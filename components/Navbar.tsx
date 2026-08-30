export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center font-bold text-black">
            DK
          </div>

          <div>
            <h1 className="text-white font-bold leading-none">
              DKKT
            </h1>
            <p className="text-xs text-gray-400">
              Kota Tasikmalaya
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav className="hidden md:flex gap-8 text-sm text-gray-300">
            <a href="/">Beranda</a>
            <a href="/profil">Profil</a>
            <a href="/komite">Komite</a>
            <a href="/berita">Berita</a>
            <a href="/agenda">Agenda</a>
            <a href="/galeri">Galeri</a>
        </nav>

        <a
            href="/kontak"
            className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-semibold"
            >
            Kontak
        </a>
      </div>
    </header>
  );
}