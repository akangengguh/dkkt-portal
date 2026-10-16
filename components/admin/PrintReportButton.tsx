"use client";

import Link from "next/link";

type PrintReportButtonProps = {
  disabled?: boolean;
  href?: string;
};

export default function PrintReportButton({ disabled = false, href }: PrintReportButtonProps = {}) {
  const className = "rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:border-amber-300/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 print:hidden";

  if (href) {
    return <Link href={href} className={className}>Cetak laporan</Link>;
  }

  function printReport() {
    const finishPrinting = () => {
      document.body.classList.remove("report-print-mode");
      window.removeEventListener("afterprint", finishPrinting);
    };

    document.body.classList.add("report-print-mode");
    window.addEventListener("afterprint", finishPrinting, { once: true });
    window.print();
  }

  return (
    <button
      type="button"
      onClick={printReport}
      disabled={disabled}
      className={className}
    >
      Cetak laporan
    </button>
  );
}