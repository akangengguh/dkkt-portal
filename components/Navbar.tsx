
export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-amber-500/20 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
 <img
  src="/logo/logo-dkkt.png"
  alt="Logo DKKT"
  className="h-11 w-11 object-contain"
/>

  <div>
    <h1 className="text-sm font-bold text-white leading-none">
      Dewan Kesenian dan Kebudayaan
    </h1>
    <p className="text-xs text-gray-400">
      Kota Tasikmalaya
    </p>
  </div>
</a>

        {/* Menu */}
        <nav className="hidden md:flex gap-8 text-sm text-gray-300">
          <a href="/" className="hover:text-amber-400">Beranda</a>
          <a href="/profil" className="hover:text-amber-400">Profil</a>
          <a href="/komite" className="hover:text-amber-400">Komite</a>
          <a href="/berita" className="hover:text-amber-400">Berita</a>
          <a href="/agenda" className="hover:text-amber-400">Agenda</a>
          <a href="/galeri" className="hover:text-amber-400">Galeri</a>
        </nav>

        <a
          href="/kontak"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
        >
          Kontak
        </a>
      </div>
    </header>
  );
}