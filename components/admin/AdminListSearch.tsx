import Link from "next/link";

type Props = {
  query: string;
  placeholder: string;
  clearHref: string;
  resultCount: number;
};

export default function AdminListSearch({ query, placeholder, clearHref, resultCount }: Props) {
  return (
    <form action={clearHref} method="get" role="search" className="flex flex-wrap items-center gap-3">
      <label htmlFor="admin-list-search" className="sr-only">Cari daftar</label>
      <input
        id="admin-list-search"
        name="q"
        type="search"
        defaultValue={query}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-amber-400/50 sm:max-w-sm"
      />
      <button type="submit" className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-amber-400/30 hover:text-amber-300">
        Cari
      </button>
      {query && <Link href={clearHref} className="text-sm text-gray-500 transition hover:text-white">Hapus</Link>}
      <span className="text-xs text-gray-500">{resultCount} hasil</span>
    </form>
  );
}