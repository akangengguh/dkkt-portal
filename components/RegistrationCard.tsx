"use client";

import { useState } from "react";

type RegistrationCardProps = {
  category: "INDIVIDUAL" | "GROUP";
  id: string;
  kind: "artist" | "group";
  name: string;
  registrationNumber: string;
  status: string;
  committee: string;
  subtitle: string;
  secondary?: string;
  photo?: string | null;
  registeredAt: unknown;
  canIssue: boolean;
};

function formatDate(value: unknown) {
  return new Date(String(value)).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function RegistrationCard({
  category,
  id,
  kind,
  name,
  registrationNumber,
  status,
  committee,
  subtitle,
  secondary,
  photo,
  registeredAt,
  canIssue,
}: RegistrationCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [issued, setIssued] = useState(currentStatus === "ACTIVE");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const apiRoute = kind === "artist" ? "artists" : "groups";

  async function printCard() {
    setError("");
    if (currentStatus === "VERIFIED" && !issued) {
      if (!canIssue) {
        setError("Anda tidak memiliki izin untuk menerbitkan kartu.");
        return;
      }
      setBusy(true);
      try {
        const response = await fetch(`/api/admin/${apiRoute}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "issue-card" }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Kartu gagal diterbitkan.");
        setCurrentStatus("ACTIVE");
        setIssued(true);
        window.setTimeout(() => window.print(), 0);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Kartu gagal diterbitkan.");
      } finally {
        setBusy(false);
      }
      return;
    }
    window.print();
  }

  const statusLabel = currentStatus === "ACTIVE" ? "AKTIF" : currentStatus === "VERIFIED" ? "TERVERIFIKASI" : currentStatus;

  return (
    <main className="registration-card-print">
      <section className="registration-card-gallery" aria-label="Pratinjau kartu registrasi">
        <div className="registration-card-preview">
          <p className="registration-card-side-label">Tampak depan</p>
          <article className="registration-card-face registration-card-front">
            <header className="registration-card-front-header">
              <img src="/logo/logo-dkkt.png" alt="Logo DKKT" />
              <div>
                <p>DKKT KOTA TASIKMALAYA</p>
                <h1>KARTU REGISTRASI</h1>
              </div>
            </header>
            <div className="registration-card-front-body">
              <div className="registration-card-profile">
                <div className="registration-card-photo">
                  {photo ? <img src={photo} alt={name} /> : category === "GROUP" ? "◈" : "✦"}
                </div>
                <div className="registration-card-identity">
                  <p className="registration-card-category">{category === "GROUP" ? "KELOMPOK / SANGGAR" : "SENIMAN & BUDAYAWAN"}</p>
                  <h2>{name}</h2>
                  <p>{subtitle}</p>
                  {secondary ? <span>{secondary}</span> : null}
                </div>
              </div>
              <div className="registration-card-number">
                <div><span>NOMOR REGISTRASI</span><strong>{registrationNumber}</strong></div>
                <span className="registration-card-status">{statusLabel}</span>
              </div>
            </div>
          </article>
        </div>

        <div className="registration-card-preview">
          <p className="registration-card-side-label">Tampak belakang</p>
          <article className="registration-card-face registration-card-back">
            <header className="registration-card-back-header">
              <div><p>DKKT KOTA TASIKMALAYA</p><h2>INFORMASI REGISTRASI</h2></div>
              <img src="/logo/logo-dkkt.png" alt="" />
            </header>
            <dl className="registration-card-details">
              <div><dt>Nama terdaftar</dt><dd>{name}</dd></div>
              <div><dt>Komite</dt><dd>{committee}</dd></div>
              <div><dt>Status kartu</dt><dd>{statusLabel}</dd></div>
              <div><dt>Terdaftar sejak</dt><dd>{formatDate(registeredAt)}</dd></div>
            </dl>
            <p className="registration-card-legal">Kartu ini merupakan bukti registrasi pada portal DKKT. Keabsahan SK Terdaftar mengikuti verifikasi administrasi DKKT.</p>
            <footer className="registration-card-back-footer"><span>DKKT · TASIKMALAYA</span><strong>{registrationNumber}</strong></footer>
          </article>
        </div>
      </section>

      {error && <p role="alert" className="registration-card-error">{error}</p>}
      <button type="button" disabled={busy || (currentStatus === "VERIFIED" && !canIssue)} onClick={printCard} className="registration-card-action" aria-label={busy ? "Menerbitkan kartu" : currentStatus === "VERIFIED" && !issued ? "Terbitkan dan cetak kartu" : "Cetak atau simpan kartu sebagai PDF"}>
        {busy ? "Menerbitkan kartu..." : currentStatus === "VERIFIED" && !issued ? "Terbitkan & cetak kartu" : "Cetak / Simpan PDF"}
      </button>
    </main>
  );
}
