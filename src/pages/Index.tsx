import { useState, useEffect } from "react"
import AuthModal from "@/components/AuthModal"
import { useNavigate } from "react-router-dom"
import { getToken } from "@/lib/api"

const Index = () => {
  const [showAuth, setShowAuth] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (getToken()) {
      navigate('/dashboard')
    }
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "#2563EB" }}>

      {/* Rays background */}
      <div className="absolute inset-0 w-full h-full" style={{ animation: "raysRotate 30s linear infinite", transformOrigin: "50% 50%" }}>
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((angle, i) => (
            <line
              key={i}
              x1={720}
              y1={450}
              x2={720 + 2000 * Math.cos((angle * Math.PI) / 180)}
              y2={450 + 2000 * Math.sin((angle * Math.PI) / 180)}
              stroke={i % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}
              strokeWidth="100"
            />
          ))}
        </svg>
      </div>

      {/* Glow orb center */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "glowPulse 4s ease-in-out infinite",
        }}
      />

      {/* Navbar */}
      <header className="relative z-20 flex items-center justify-between px-8 py-5">
        <a href="/" className="flex items-center gap-2">
          <img
            src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png"
            alt="Логотип"
            className="w-9 h-9 invert"
          />
          <span className="text-white font-bold text-xl tracking-tight">Грантовый дайвинг</span>
        </a>

        <nav className="flex items-center gap-2">
          <a
            href="#about"
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.18)", color: "white", backdropFilter: "blur(8px)" }}
          >
            О платформе
          </a>
          <a
            href="#features"
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.18)", color: "white", backdropFilter: "blur(8px)" }}
          >
            Возможности
          </a>
          <button
            onClick={() => setShowAuth(true)}
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.18)", color: "white", backdropFilter: "blur(8px)" }}
          >
            Войти
          </button>
        </nav>
      </header>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "calc(100vh - 80px)" }}>

        {/* Badge */}
        <div
          className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-white font-medium"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          <span style={{ fontSize: "16px" }}>✳</span>
          Привет, давай знакомиться!
        </div>

        {/* Main title */}
        <h1 className="text-white font-black leading-none mb-4" style={{ fontSize: "clamp(52px, 9vw, 120px)", letterSpacing: "-0.02em" }}>
          Грантовый дайвинг
        </h1>



        {/* Description */}
        <p className="text-white/70 text-center max-w-xl leading-relaxed" style={{ fontSize: "clamp(14px, 1.2vw, 17px)" }}>
          Платформа для НКО и социальных проектов — от первой идеи до победы в гранте.
          <br />
          Проектная карта, бета-защита с ИИ и экспертное ревью в одном месте.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <button
            onClick={() => setShowAuth(true)}
            className="px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105"
            style={{ background: "white", color: "#2563EB" }}
          >
            Начать бесплатно
          </button>
          <button
            onClick={() => setShowAuth(true)}
            className="px-8 py-4 rounded-full font-semibold text-base text-white transition-all hover:bg-white/20"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            Войти в аккаунт
          </button>
        </div>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => navigate('/dashboard')}
        />
      )}
    </main>
  )
}

export default Index