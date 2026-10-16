import { ZipArchive } from "archiver";
import { existsSync } from "node:fs";
import path from "node:path";
import { PassThrough, Readable } from "node:stream";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

import { adminApiError } from "@/lib/admin-api";
import { requireSuperAdmin } from "@/lib/admin";
import { getStorageProvider } from "@/lib/storage";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TableReader = [string, () => Promise<unknown>];

const tableReaders: TableReader[] = [
  ["User", async () => db.orm.public.User.all()],
  ["Role", async () => db.orm.public.Role.all()],
  ["Permission", async () => db.orm.public.Permission.all()],
  ["UserRole", async () => db.orm.public.UserRole.all()],
  ["RolePermission", async () => db.orm.public.RolePermission.all()],
  ["Committee", async () => db.orm.public.Committee.all()],
  ["CommitteeMember", async () => db.orm.public.CommitteeMember.all()],
  ["CommitteeUser", async () => db.orm.public.CommitteeUser.all()],
  ["NewsCategory", async () => db.orm.public.NewsCategory.all()],
  ["News", async () => db.orm.public.News.all()],
  ["NewsWorkflowLog", async () => db.orm.public.NewsWorkflowLog.all()],
  ["AgendaCategory", async () => db.orm.public.AgendaCategory.all()],
  ["Agenda", async () => db.orm.public.Agenda.all()],
  ["AgendaWorkflowLog", async () => db.orm.public.AgendaWorkflowLog.all()],
  ["MediaFile", async () => db.orm.public.MediaFile.all()],
  ["GalleryAlbum", async () => db.orm.public.GalleryAlbum.all()],
  ["GalleryItem", async () => db.orm.public.GalleryItem.all()],
  ["Document", async () => db.orm.public.Document.all()],
  ["OrganizationSection", async () => db.orm.public.OrganizationSection.all()],
  ["OrganizationMember", async () => db.orm.public.OrganizationMember.all()],
  ["Artist", async () => db.orm.public.Artist.all()],
  ["CulturalGroup", async () => db.orm.public.CulturalGroup.all()],
  ["RegistrationSequence", async () => db.orm.public.RegistrationSequence.all()],
  ["SitePage", async () => db.orm.public.SitePage.all()],
  ["HomeHighlight", async () => db.orm.public.HomeHighlight.all()],
  ["SiteSetting", async () => db.orm.public.SiteSetting.all()],
  ["SocialLink", async () => db.orm.public.SocialLink.all()],
  ["ContactMessage", async () => db.orm.public.ContactMessage.all()],
  ["AuditLog", async () => db.orm.public.AuditLog.all()],
];

async function loadDatabaseSnapshot() {
  const tables: Record<string, unknown> = {};
  for (const [name, read] of tableReaders) tables[name] = await read();

  return {
    format: "dkkt-cms-backup",
    version: 1,
    generatedAt: new Date().toISOString(),
    tableCount: tableReaders.length,
    tables,
  };
}

function getRemoteStorageClient() {
  const bucket = process.env.UPLOAD_STORAGE_BUCKET?.trim();
  const region = process.env.UPLOAD_STORAGE_REGION?.trim();
  const accessKeyId = process.env.UPLOAD_STORAGE_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.UPLOAD_STORAGE_SECRET_ACCESS_KEY?.trim();
  const endpoint = process.env.UPLOAD_STORAGE_ENDPOINT?.trim();

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("Konfigurasi object storage belum lengkap untuk membuat backup.");
  }

  return {
    bucket,
    client: new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: Boolean(endpoint),
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

async function listRemoteObjects(client: S3Client, bucket: string) {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const page = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: "uploads/",
      ContinuationToken: continuationToken,
    }));
    for (const object of page.Contents || []) {
      if (object.Key && !object.Key.endsWith("/")) keys.push(object.Key);
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

function safeArchivePath(key: string) {
  return key.split("/").filter((part) => part && part !== "." && part !== "..").join("/");
}

export async function GET() {
  let remoteClient: S3Client | undefined;
  let archive: ZipArchive | undefined;
  let output: PassThrough | undefined;

  try {
    await requireSuperAdmin();
    const snapshot = await loadDatabaseSnapshot();
    const dateStamp = new Date().toISOString().replace(/[:.]/g, "-");
    const publicDirectory = path.join(process.cwd(), "public");

    archive = new ZipArchive({ zlib: { level: 6 } });
    output = new PassThrough();
    archive.pipe(output);
    archive.on("error", (error) => {
      remoteClient?.destroy();
      output?.destroy(error);
    });
    archive.on("warning", (error) => {
      remoteClient?.destroy();
      output?.destroy(error);
    });
    archive.on("end", () => remoteClient?.destroy());

    archive.append(`${JSON.stringify(snapshot, (_key, value) => typeof value === "bigint" ? value.toString() : value, 2)}\n`, {
      name: "database/backup.json",
    });
    archive.append(
      "DKKT CMS backup\n\nIncludes all application database tables and public files. If remote object storage is enabled, its files are included under files/object-storage. Environment secrets and storage credentials are not included. The database snapshot contains sensitive account data and password hashes; store this archive securely.\n",
      { name: "README-backup.txt" },
    );

    if (existsSync(publicDirectory)) archive.directory(publicDirectory, "files/public");

    if (getStorageProvider() === "remote") {
      const storage = getRemoteStorageClient();
      remoteClient = storage.client;
      const keys = await listRemoteObjects(storage.client, storage.bucket);
      for (const key of keys) {
        const safeKey = safeArchivePath(key);
        if (!safeKey) continue;
        archive.append(Readable.from((async function* () {
          const response = await storage.client.send(new GetObjectCommand({
            Bucket: storage.bucket,
            Key: key,
          }));
          if (!response.Body) return;
          for await (const chunk of response.Body as AsyncIterable<Uint8Array>) yield chunk;
        })()), { name: `files/object-storage/${safeKey}` });
      }
    }

    const archiveStream = Readable.toWeb(output) as ReadableStream<Uint8Array>;
    void archive.finalize().catch((error: unknown) => {
      remoteClient?.destroy();
      output?.destroy(error instanceof Error ? error : new Error("Backup gagal dibuat."));
    });

    return new Response(archiveStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="dkkt-cms-backup-${dateStamp}.zip"`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    remoteClient?.destroy();
    archive?.abort();
    return adminApiError(error, "Backup data gagal dibuat.");
  }
}