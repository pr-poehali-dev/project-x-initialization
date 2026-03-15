import { useState, useEffect } from "react"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Desktop Header */}
      <header
        className={`fixed top-4 z-[9999] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full backdrop-blur-md md:flex border transition-all duration-300 ${
          isScrolled ? "max-w-4xl px-2 border-white/20 shadow-lg" : "max-w-6xl px-4 border-transparent shadow-none"
        } py-2`}
        style={{
          willChange: "transform",
          backfaceVisibility: "hidden",
          perspective: "1000px",
          background: isScrolled ? "rgba(15, 15, 15, 0.8)" : "transparent",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <a
          className={`z-50 flex items-center justify-center gap-2 transition-all duration-300 ${
            isScrolled ? "ml-4" : ""
          }`}
          href="/"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">GrantRun</span>
          </div>
        </a>

        <div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-white/70 transition duration-200 hover:text-white md:flex md:space-x-2">
          <a className="relative px-4 py-2 text-white/70 hover:text-white transition-colors cursor-pointer" href="#features">
            <span className="relative z-20">Возможности</span>
          </a>
          <a className="relative px-4 py-2 text-white/70 hover:text-white transition-colors cursor-pointer" href="#pricing">
            <span className="relative z-20">Тарифы</span>
          </a>
          <a className="relative px-4 py-2 text-white/70 hover:text-white transition-colors cursor-pointer" href="#experts">
            <span className="relative z-20">Эксперты</span>
          </a>
          <a className="relative px-4 py-2 text-white/70 hover:text-white transition-colors cursor-pointer" href="#academy">
            <span className="relative z-20">Академия</span>
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#start"
            className="rounded-lg font-medium relative cursor-pointer hover:-translate-y-0.5 transition-all duration-200 inline-block text-center px-4 py-2 text-sm border bg-gradient-to-r from-green-600 to-emerald-600 border-green-400/30 text-white hover:from-green-500 hover:to-emerald-500"
          >
            Начать бесплатно
          </a>
        </div>
      </header>

      {/* Mobile Header */}
      <header
        className={`fixed top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full backdrop-blur-md md:hidden px-4 py-3 border transition-all duration-300 ${
          isScrolled ? "border-white/20 shadow-lg" : "border-transparent shadow-none"
        }`}
        style={{
          background: isScrolled ? "rgba(15, 15, 15, 0.8)" : "transparent",
          left: "1rem",
          right: "1rem",
          width: "calc(100% - 2rem)",
        }}
      >
        <a className="flex items-center justify-center gap-2" href="/">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <span className="text-white font-semibold">GrantRun</span>
        </a>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 transition-colors hover:bg-white/10"
          aria-label="Toggle menu"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
        >
          <div className="flex flex-col items-center justify-center w-5 h-5 space-y-1">
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            ></span>
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden">
          <div
            className="absolute top-24 left-4 right-4 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6"
            style={{ background: "rgba(255, 255, 255, 0.1)" }}
          >
            <nav className="flex flex-col space-y-4">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left px-4 py-3 text-lg font-medium text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Возможности
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left px-4 py-3 text-lg font-medium text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Тарифы
              </a>
              <a
                href="#experts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left px-4 py-3 text-lg font-medium text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Эксперты
              </a>
              <a
                href="#academy"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left px-4 py-3 text-lg font-medium text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Академия
              </a>
              <div className="border-t border-white/20 pt-4 mt-4 flex flex-col space-y-3">
                <a
                  href="#start"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-lg font-bold text-center rounded-lg transition-all duration-200 border bg-gradient-to-r from-green-600 to-emerald-600 border-green-400/30 text-white"
                >
                  Начать бесплатно
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}