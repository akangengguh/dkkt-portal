import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type StorageProvider = "local" | "remote";

export function getStorageProvider(): StorageProvider {
  const value = (process.env.UPLOAD_STORAGE_DRIVER || "local").trim().toLowerCase();
  return value === "remote" ? "remote" : "local";
}

export function getStoragePublicBaseUrl() {
  const configured = process.env.UPLOAD_STORAGE_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "";
}

export async function saveUploadedFile(file: File, scope: string, fileName: string) {
  const provider = getStorageProvider();
  const objectKey = `uploads/${scope}/${fileName}`;

  if (provider === "remote") {
    const baseUrl = getStoragePublicBaseUrl();
    const bucket = process.env.UPLOAD_STORAGE_BUCKET?.trim();
    const region = process.env.UPLOAD_STORAGE_REGION?.trim();
    const accessKeyId = process.env.UPLOAD_STORAGE_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.UPLOAD_STORAGE_SECRET_ACCESS_KEY?.trim();
    const endpoint = process.env.UPLOAD_STORAGE_ENDPOINT?.trim();

    if (!baseUrl || !bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error("Konfigurasi object storage belum lengkap.");
    }

    const client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: Boolean(endpoint),
      credentials: { accessKeyId, secretAccessKey },
    });

    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    }));

    return {
      url: `${baseUrl}/${objectKey}`,
      storageProvider: "remote",
    };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", scope);
  await mkdir(uploadDir, { recursive: true });
  const targetPath = path.join(uploadDir, fileName);
  await writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

  return {
    url: `/uploads/${scope}/${fileName}`,
    storageProvider: "local",
  };
}

export async function persistUploadedFile({ file, scope, fileName }: { file: File; scope: string; fileName: string }) {
  const result = await saveUploadedFile(file, scope, fileName);
  return result.url;
}

export async function readUploadedFileFromDisk(scope: string, fileName: string) {
  const filePath = path.join(process.cwd(), "public", "uploads", scope, fileName);
  return readFile(filePath);
}
