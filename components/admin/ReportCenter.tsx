"use client";

import { useState } from "react";

import PrintReportButton from "@/components/admin/PrintReportButton";

export type ReportCategory = "artist" | "group" | "committee";

export type ReportRow = {
  id: string;
  category: ReportCategory;
  name: string;
  subcategory: string;
  committeeId: string;
  committeeName: string;
  responsiblePerson: string;
  registrationNumber: string;
  date: string;
  dateLabel: string;
  status: string;
};

export type ReportCategoryOption = {
  value: ReportCategory;
  label: string;
};

type ReportCenterProps = {
  rows: ReportRow[];
  categories: ReportCategoryOption[];
  printedAt: string;
  initialCategory?: ReportCategory | "all";
};

const categoryLabels: Record<ReportCategory, string> = {
  artist: "Seniman",
  group: "Kelompok / Sanggar",
  committee: "Komite",
};

function ReportTable({ rows }: { rows: ReportRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "19%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "11%" }} />
        </colgroup>
        <thead className="bg-white/3 text-xs text-gray-400">
          <tr>
            <th className="px-4 py-3">No.</th>
            <th className="px-4 py-3">Kategori</th>
            <th className="px-4 py-3">Nama / anggota</th>
            <th className="px-4 py-3">Bidang / jenis / posisi</th>
            <th className="px-4 py-3">Komite / ketua</th>
            <th className="px-4 py-3">No. registrasi</th>
            <th className="px-4 py-3">Tanggal</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={`${row.category}-${row.id}`} className="border-t border-white/10 align-top">
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3">{categoryLabels[row.category]}</td>
              <td className="px-4 py-3 font-semibold">{row.name}</td>
              <td className="px-4 py-3">{row.subcategory || "-"}</td>
              <td className="px-4 py-3">
                <span className="block">{row.committeeName || "-"}</span>
                {row.responsiblePerson && <span className="mt-1 block text-xs">Ketua / pemimpin: {row.responsiblePerson}</span>}
              </td>
              <td className="px-4 py-3">{row.registrationNumber || "-"}</td>
              <td className="px-4 py-3">{row.dateLabel || "-"}</td>
              <td className="px-4 py-3">{row.status || "-"}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-gray-500">Tidak ada data yang cocok dengan filter.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportCenter({ rows, categories, printedAt, initialCategory = "all" }: ReportCenterProps) {
  const [category, setCategory] = useState<ReportCategory | "all">(initialCategory);
  const [committeeId, setCommitteeId] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const categoryRows = rows.filter((row) => category === "all" || row.category === category);
  const committeeOptions = Array.from(new Map(
    rows.filter((row) => row.committeeId && row.committeeName)
      .map((row) => [row.committeeId, row.committeeName]),
  ).entries()).sort((a, b) => a[1].localeCompare(b[1], "id"));
  const subcategoryOptions = Array.from(new Set(categoryRows.map((row) => row.subcategory).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "id"));
  const statusOptions = Array.from(new Set(categoryRows.map((row) => row.status).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "id"));
  const normalizedSearch = search.trim().toLocaleLowerCase("id-ID");
  const filteredRows = categoryRows.filter((row) => {
    if (committeeId !== "all" && row.committeeId !== committeeId) return false;
    if (subcategory !== "all" && row.subcategory !== subcategory) return false;
    if (status !== "all" && row.status !== status) return false;
    if (dateFrom && (!row.date || row.date < dateFrom)) return false;
    if (dateTo && (!row.date || row.date > dateTo)) return false;
    if (normalizedSearch) {
      const haystack = [row.name, row.subcategory, row.committeeName, row.responsiblePerson, row.registrationNumber]
        .join(" ").toLocaleLowerCase("id-ID");
      if (!haystack.includes(normalizedSearch)) return false;
    }
    return true;
  });
  const selectedCategoryLabel = category === "all"
    ? "Semua kategori"
    : categories.find((item) => item.value === category)?.label || "Semua kategori";

  function resetFilters() {
    setCategory("all");
    setCommitteeId("all");
    setSubcategory("all");
    setStatus("all");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-6 print:hidden">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">CMS DKKT</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Pusat Laporan</h1>
          <p className="mt-2 text-sm text-gray-400">Pilih kategori dan filter data yang akan dicetak.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={resetFilters} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:border-white/30 hover:text-white">Reset filter</button>
          <PrintReportButton disabled={filteredRows.length === 0} />
        </div>
      </header>

      <section className="grid gap-4 border-b border-white/10 py-6 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        <label className="grid gap-2 text-sm text-gray-300">
          Jenis data
          <select value={category} onChange={(event) => { setCategory(event.target.value as ReportCategory | "all"); setSubcategory("all"); setStatus("all"); }} className="rounded-lg border border-white/15 bg-[#101010] px-3 py-2.5 text-white">
            <option value="all">Semua data</option>
            {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        {committeeOptions.length > 0 && <label className="grid gap-2 text-sm text-gray-300">
          Komite
          <select value={committeeId} onChange={(event) => setCommitteeId(event.target.value)} className="rounded-lg border border-white/15 bg-[#101010] px-3 py-2.5 text-white">
            <option value="all">Semua komite</option>
            {committeeOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>}
        {subcategoryOptions.length > 0 && <label className="grid gap-2 text-sm text-gray-300">
          Bidang / jenis / posisi
          <select value={subcategory} onChange={(event) => setSubcategory(event.target.value)} className="rounded-lg border border-white/15 bg-[#101010] px-3 py-2.5 text-white">
            <option value="all">Semua</option>
            {subcategoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>}
        {statusOptions.length > 0 && <label className="grid gap-2 text-sm text-gray-300">
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-white/15 bg-[#101010] px-3 py-2.5 text-white">
            <option value="all">Semua status</option>
            {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>}
        <label className="grid gap-2 text-sm text-gray-300">
          Tanggal dari
          <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="rounded-lg border border-white/15 bg-[#101010] px-3 py-2.5 text-white" />
        </label>
        <label className="grid gap-2 text-sm text-gray-300">
          Tanggal sampai
          <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="rounded-lg border border-white/15 bg-[#101010] px-3 py-2.5 text-white" />
        </label>
        <label className="grid gap-2 text-sm text-gray-300 sm:col-span-2">
          Pencarian
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nama, nomor registrasi, bidang, komite" className="rounded-lg border border-white/15 bg-[#101010] px-3 py-2.5 text-white placeholder:text-gray-600" />
        </label>
      </section>

      <p className="py-4 text-sm text-gray-400 print:hidden">Menampilkan <strong className="text-white">{filteredRows.length}</strong> dari {rows.length} data · {selectedCategoryLabel}</p>
      <section className="overflow-hidden rounded-xl border border-white/10 print:hidden" aria-label="Pratinjau hasil laporan">
        <ReportTable rows={filteredRows} />
      </section>

      <section className="report-print report-center-print" aria-label="Laporan terfilter">
        <header>
          <p>Dewan Kesenian dan Kebudayaan Kota Tasikmalaya</p>
          <h1>Laporan Data DKKT</h1>
          <p>{selectedCategoryLabel} · Dicetak: {printedAt}</p>
        </header>
        <div className="report-summary">
          <p>Jumlah data: <strong>{filteredRows.length}</strong></p>
          <p>Kategori: <strong>{selectedCategoryLabel}</strong></p>
          <p>Rentang tanggal: <strong>{dateFrom || "awal"} s.d. {dateTo || "sekarang"}</strong></p>
          <p>Filter status: <strong>{status === "all" ? "Semua" : status}</strong></p>
        </div>
        <ReportTable rows={filteredRows} />
      </section>
    </div>
  );
}
