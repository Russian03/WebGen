import { useEffect, useState } from "react";

export default function Navbar({ t }) {

  const [currentLang, setCurrentLang] = useState("ca");
  const [scrolled, setScrolled] = useState(false);

  // Detectar idioma
  useEffect(() => {
    const currentPath = window.location.pathname;

    if (currentPath.startsWith("/en")) {
      setCurrentLang("en");
    } else if (currentPath.startsWith("/es")) {
      setCurrentLang("es");
    } else {
      setCurrentLang("ca");
    }
  }, []);

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;

    window.location.href = `/${lang}`;
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/20 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container-custom flex items-center justify-between py-6">

        {/* Logo */}
        <div className="text-2xl font-bold">
          WebGen
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-8">
          <a href="#services">{t.nav.services}</a>
          <a href="#pricing">{t.nav.pricing}</a>
          <a href="#projects">{t.nav.projects}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>

        {/* Selector idioma */}
        <select
          value={currentLang}
          onChange={handleLanguageChange}
          className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
        >
          <option value="ca">Català</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>

      </div>
    </header>
  );
}