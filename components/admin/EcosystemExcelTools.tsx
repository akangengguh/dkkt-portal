"use client";

import ExcelJS from "exceljs";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";

type Kind = "artist" | "group";
type Props = { kind: Kind; canCreate: boolean; canUpdate: boolean };
type ImportRow = { rowNumber: number; values: Record<string, unknown> };
type ImportFailure = { rowNumber: number; message: string };

const ARTIST_FIELDS = [
  "id", "registrationNumber", "registrationStatus", "name", "slug", "committeeId", "discipline", "biography", "photo", "email", "phone", "website", "birthPlace", "birthDate", "gender", "address", "skNumber", "skDate", "skFileUrl", "cardIssuedAt", "cardFileUrl", "sortOrder", "isFeatured", "isActive", "registeredAt", "verifiedAt", "verifiedBy", "createdAt", "updatedAt",
] as const;

const GROUP_FIELDS = [
  "id", "registrationNumber", "registrationStatus", "name", "slug", "committeeId", "groupType", "description", "leader", "address", "email", "phone", "website", "logo", "establishedDate", "memberCount", "skNumber", "skDate", "skFileUrl", "cardIssuedAt", "cardFileUrl", "sortOrder", "isFeatured", "isActive", "registeredAt", "verifiedAt", "verifiedBy", "createdAt", "updatedAt",
] as const;

const ARTIST_IMPORT_FIELDS = [
  "name", "slug", "committeeId", "discipline", "biography", "photo", "email", "phone", "website", "birthPlace", "birthDate", "gender", "address", "skNumber", "skDate", "skFileUrl", "sortOrder", "isFeatured", "isActive",
] as const;

const GROUP_IMPORT_FIELDS = [
  "name", "slug", "committeeId", "groupType", "description", "leader", "address", "email", "phone", "website", "logo", "establishedDate", "memberCount", "skNumber", "skDate", "skFileUrl", "sortOrder", "isFeatured", "isActive",
] as const;

const DATE_FIELDS = new Set([
  "birthDate", "establishedDate", "skDate", "cardIssuedAt", "registeredAt", "verifiedAt", "createdAt", "updatedAt",
]);
const NUMBER_FIELDS = new Set(["memberCount", "sortOrder"]);
const BOOLEAN_FIELDS = new Set(["isFeatured", "isActive"]);
const EXCEL_EPOCH = Date.UTC(1899, 11, 30);
const MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function fieldsFor(kind: Kind) {
  return kind === "artist" ? ARTIST_FIELDS : GROUP_FIELDS;
}

function importFieldsFor(kind: Kind) {
  return kind === "artist" ? ARTIST_IMPORT_FIELDS : GROUP_IMPORT_FIELDS;
}

function apiRouteFor(kind: Kind) {
  return kind === "artist" ? "artists" : "groups";
}

function plainCellValue(value: unknown, field: string): unknown {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    const richText = (value as { richText?: { text?: string }[] }).richText;
    if (Array.isArray(richText)) return richText.map((part) => part.text || "").join("").trim();
    throw new Error(`Kolom ${field} berisi formula atau format sel yang tidak didukung.`);
  }

  if (DATE_FIELDS.has(field)) {
    if (typeof value === "number") {
      const date = new Date(EXCEL_EPOCH + value * 86_400_000);
      if (Number.isNaN(date.getTime())) throw new Error(`Tanggal pada kolom ${field} tidak valid.`);
      return date.toISOString().slice(0, 10);
    }
    const text = String(value).trim();
    if (!text) return null;
    if (Number.isNaN(Date.parse(text))) throw new Error(`Tanggal "${text}" pada kolom ${field} tidak valid.`);
    return text;
  }

  if (NUMBER_FIELDS.has(field)) {
    const number = typeof value === "number" ? value : Number(String(value).trim());
    if (!Number.isInteger(number)) throw new Error(`Kolom ${field} harus berupa bilangan bulat.`);
    return number;
  }

  if (BOOLEAN_FIELDS.has(field)) {
    if (typeof value === "boolean") return value;
    const text = String(value).trim().toLowerCase();
    if (["true", "1", "ya"].includes(text)) return true;
    if (["false", "0", "tidak"].includes(text)) return false;
    throw new Error(`Kolom ${field} harus berisi TRUE/FALSE atau Ya/Tidak.`);
  }

  return String(value).trim();
}

function styleWorksheet(worksheet: ExcelJS.Worksheet, fields: readonly string[]) {
  fields.forEach((field, index) => {
    const column = worksheet.getColumn(index + 1);
    column.key = field;
    column.width = Math.min(Math.max(field.length + 2, 14), 30);
    if (DATE_FIELDS.has(field)) column.numFmt = "yyyy-mm-dd";
  });
  const header = worksheet.addRow([...fields]);
  header.height = 24;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF202020" } };
    cell.alignment = { vertical: "middle" };
  });
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: fields.length },
  };
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer as BlobPart], { type: MIME_TYPE }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function EcosystemExcelTools({ kind, canCreate, canUpdate }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [failures, setFailures] = useState<ImportFailure[]>([]);
  const fields = fieldsFor(kind);
  const route = apiRouteFor(kind);
  const label = kind === "artist" ? "seniman" : "kelompok";
  const canImport = canCreate || canUpdate;

  async function exportData() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/${route}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !Array.isArray(result.data)) throw new Error(result.message || "Data gagal diekspor.");

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(kind === "artist" ? "Seniman" : "Kelompok");
      styleWorksheet(worksheet, fields);
      for (const record of result.data as Record<string, unknown>[]) {
        worksheet.addRow(fields.map((field) => {
          const value = record[field];
          if (value === null || value === undefined) return null;
          if (DATE_FIELDS.has(field)) {
            const date = new Date(String(value));
            return Number.isNaN(date.getTime()) ? String(value) : date;
          }
          return value;
        }));
      }
      await downloadWorkbook(workbook, `data-${label}-${new Date().toISOString().slice(0, 10)}.xlsx`);
      setMessage(`${result.data.length} data ${label} berhasil diekspor.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Data gagal diekspor.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(kind === "artist" ? "Seniman" : "Kelompok");
    styleWorksheet(worksheet, fields);
    worksheet.addRow(fields.map(() => null));
    const guide = workbook.addWorksheet("Petunjuk");
    guide.addRows([
      ["Petunjuk impor data"],
      ["Gunakan nama kolom database pada baris pertama dan jangan mengubah urutan/header."],
      ["ID kosong: membuat pendaftaran baru. ID terisi: memperbarui data profil yang cocok."],
      ["Nomor registrasi dan status verifikasi dikelola sistem, bukan diubah melalui impor."],
      ["Kolom tanggal menggunakan format YYYY-MM-DD. Boolean menggunakan TRUE/FALSE."],
    ]);
    guide.getColumn(1).width = 100;
    guide.getRow(1).font = { bold: true };
    await downloadWorkbook(workbook, `template-${label}.xlsx`);
  }

  async function parseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("");
    setFailures([]);
    setRows([]);
    setFileName(file.name);
    try {
      if (!file.name.toLowerCase().endsWith(".xlsx")) throw new Error("Pilih file Excel berformat .xlsx.");
      if (file.size > 10 * 1024 * 1024) throw new Error("Ukuran file maksimal 10 MB.");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const worksheet = workbook.worksheets[0];
      if (!worksheet || worksheet.rowCount < 2) throw new Error("File tidak memiliki baris data untuk diimpor.");

      const knownFields = new Set<string>(fields);
      const headerColumns = new Map<string, number>();
      const unknownFields: string[] = [];
      worksheet.getRow(1).eachCell((cell, columnNumber) => {
        const header = typeof cell.value === "string" ? cell.value.trim() : "";
        if (!header) return;
        if (headerColumns.has(header)) throw new Error(`Kolom ${header} muncul lebih dari sekali.`);
        if (!knownFields.has(header)) unknownFields.push(header);
        headerColumns.set(header, columnNumber);
      });
      if (unknownFields.length) throw new Error(`Kolom tidak sesuai database: ${unknownFields.join(", ")}.`);
      if (!headerColumns.has("name")) throw new Error("Kolom name wajib ada. Gunakan template Excel yang tersedia.");

      const parsedRows: ImportRow[] = [];
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
        const row = worksheet.getRow(rowNumber);
        const values: Record<string, unknown> = {};
        let hasData = false;
        for (const [field, columnNumber] of headerColumns) {
          const rawValue = row.getCell(columnNumber).value;
          if (rawValue !== null && rawValue !== undefined && rawValue !== "") hasData = true;
          try {
            values[field] = plainCellValue(rawValue, field);
          } catch (reason) {
            throw new Error(`Baris ${rowNumber}: ${reason instanceof Error ? reason.message : "Nilai tidak valid."}`);
          }
        }
        if (hasData) {
          if (typeof values.name !== "string" || !values.name) throw new Error(`Baris ${rowNumber}: kolom name wajib diisi.`);
          parsedRows.push({ rowNumber, values });
        }
      }
      if (!parsedRows.length) throw new Error("Tidak ada baris data yang dapat diimpor.");
      setRows(parsedRows);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "File Excel gagal dibaca.");
    } finally {
      setBusy(false);
    }
  }

  async function importRows() {
    setBusy(true);
    setError("");
    setMessage("");
    setFailures([]);
    let created = 0;
    let updated = 0;
    const rowFailures: ImportFailure[] = [];
    const hasExistingIds = rows.some(({ values }) => typeof values.id === "string" && values.id.trim());
    let existingRecords = new Map<string, Record<string, unknown>>();

    try {
      if (hasExistingIds && canUpdate) {
        const response = await fetch(`/api/admin/${route}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.data)) throw new Error(result.message || "Data saat ini gagal dimuat.");
        existingRecords = new Map((result.data as Record<string, unknown>[]).map((record) => [String(record.id), record]));
      }

      for (const row of rows) {
        const id = typeof row.values.id === "string" ? row.values.id.trim() : "";
        const isUpdate = Boolean(id);
        if (isUpdate && !canUpdate) {
          rowFailures.push({ rowNumber: row.rowNumber, message: "Tidak memiliki izin untuk memperbarui data." });
          continue;
        }
        if (!isUpdate && !canCreate) {
          rowFailures.push({ rowNumber: row.rowNumber, message: "Tidak memiliki izin untuk membuat data baru." });
          continue;
        }

        const payload: Record<string, unknown> = {};
        const existing = isUpdate ? existingRecords.get(id) : undefined;
        if (isUpdate && !existing) {
          rowFailures.push({ rowNumber: row.rowNumber, message: "ID tidak ditemukan pada database." });
          continue;
        }
        for (const field of importFieldsFor(kind)) {
          payload[field] = Object.prototype.hasOwnProperty.call(row.values, field)
            ? row.values[field]
            : existing?.[field] ?? null;
        }

        try {
          const response = await fetch(`/api/admin/${route}${isUpdate ? `/${encodeURIComponent(id)}` : ""}`, {
            method: isUpdate ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || "Data gagal disimpan.");
          if (isUpdate) updated += 1;
          else created += 1;
        } catch (reason) {
          rowFailures.push({ rowNumber: row.rowNumber, message: reason instanceof Error ? reason.message : "Data gagal disimpan." });
        }
      }

      setFailures(rowFailures);
      setMessage(`Impor selesai: ${created} data baru, ${updated} diperbarui, ${rowFailures.length} gagal.`);
      if (created || updated) router.refresh();
      if (!rowFailures.length) setRows([]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impor gagal dijalankan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap gap-2">
        {canImport && <>
          <button type="button" onClick={downloadTemplate} disabled={busy} className="rounded-lg border border-white/15 px-3 py-2.5 text-sm font-semibold text-gray-300 hover:border-amber-300/50 hover:text-white disabled:opacity-50">Template Excel</button>
          <button type="button" onClick={() => fileInput.current?.click()} disabled={busy} className="rounded-lg border border-white/15 px-3 py-2.5 text-sm font-semibold text-gray-300 hover:border-amber-300/50 hover:text-white disabled:opacity-50">Impor Excel</button>
          <input ref={fileInput} type="file" accept=".xlsx" onChange={(event) => void parseFile(event)} className="sr-only" />
        </>}
        <button type="button" onClick={() => void exportData()} disabled={busy} className="rounded-lg border border-white/15 px-3 py-2.5 text-sm font-semibold text-gray-300 hover:border-amber-300/50 hover:text-white disabled:opacity-50">{busy ? "Memproses..." : "Ekspor Excel"}</button>
      </div>
      <p className="mt-2 max-w-xl text-xs text-gray-500">Kolom menggunakan nama field database. ID menghubungkan data saat pembaruan; nomor registrasi dan status verifikasi dikelola sistem.</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
      {message && <p role="status" className="mt-2 text-sm text-emerald-300">{message}</p>}
      {rows.length > 0 && <section className="mt-3 rounded-lg border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold text-white">{fileName}: {rows.length} baris siap diimpor</p>
        <ul className="mt-2 space-y-1 text-xs text-gray-400">{rows.slice(0, 4).map((row) => <li key={row.rowNumber}>Baris {row.rowNumber}: {String(row.values.name)}{row.values.id ? ` · ID ${String(row.values.id)}` : " · data baru"}</li>)}</ul>
        {rows.length > 4 && <p className="mt-1 text-xs text-gray-500">dan {rows.length - 4} baris lainnya</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void importRows()} disabled={busy} className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-black disabled:opacity-50">{busy ? "Mengimpor..." : `Impor ${rows.length} baris`}</button>
          <button type="button" onClick={() => { setRows([]); setFailures([]); setMessage(""); }} disabled={busy} className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-gray-300 disabled:opacity-50">Batal</button>
        </div>
      </section>}
      {failures.length > 0 && <ul className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-200">{failures.slice(0, 20).map((failure) => <li key={`${failure.rowNumber}-${failure.message}`}>Baris {failure.rowNumber}: {failure.message}</li>)}</ul>}
    </div>
  );
}