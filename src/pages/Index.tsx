import { useState, useEffect } from "react"
import AuthModal from "@/components/AuthModal"
import { useNavigate } from "react-router-dom"
import { getToken } from "@/lib/api"
import Icon from "@/components/ui/icon"

const Index = () => {
  const [showAuth, setShowAuth] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (getToken()) {
      navigate('/dashboard')
    }
  }, [])

  return (
    <main className="relative overflow-hidden" style={{ backgroundColor: "#2563EB" }}>

      {/* Rays background — только на hero */}
      <div className="absolute top-0 left-0 w-full h-screen" style={{ animation: "raysRotate 30s linear infinite", transformOrigin: "50% 50vh" }}>
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((angle, i) => (
            <line
              key={i}
              x1={720} y1={450}
              x2={720 + 2000 * Math.cos((angle * Math.PI) / 180)}
              y2={450 + 2000 * Math.sin((angle * Math.PI) / 180)}
              stroke={i % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}
              strokeWidth="100"
            />
          ))}
        </svg>
      </div>

      {/* Glow */}
      <div className="absolute pointer-events-none" style={{ top: "50vh", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)", borderRadius: "50%", animation: "glowPulse 4s ease-in-out infinite" }} />

      {/* Navbar */}
      <header className="relative z-20 flex items-center justify-between px-8 py-5">
        <a href="/" className="flex items-center gap-2">
          <img src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png" alt="Логотип" className="w-9 h-9 invert rounded-md" />
          <span className="text-white text-xl tracking-tight font-semibold">Грантовый дайвинг</span>
        </a>
        <nav className="flex items-center gap-2">
          <a href="#about" className="px-5 py-2.5 rounded-full text-sm font-medium transition-all" style={{ background: "rgba(255,255,255,0.18)", color: "white", backdropFilter: "blur(8px)" }}>О платформе</a>
          <a href="#features" className="px-5 py-2.5 rounded-full text-sm font-medium transition-all" style={{ background: "rgba(255,255,255,0.18)", color: "white", backdropFilter: "blur(8px)" }}>Возможности</a>
          <button onClick={() => setShowAuth(true)} className="px-5 py-2.5 rounded-full text-sm font-medium transition-all" style={{ background: "rgba(255,255,255,0.18)", color: "white", backdropFilter: "blur(8px)" }}>Войти</button>
        </nav>
      </header>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "calc(100vh - 80px)" }}>
        <h1 className="text-white font-black leading-none mb-4" style={{ fontSize: "clamp(52px, 9vw, 120px)", letterSpacing: "-0.02em" }}>
          Грантовый дайвинг
        </h1>
        <p className="text-white/70 text-center max-w-xl leading-relaxed" style={{ fontSize: "clamp(14px, 1.2vw, 17px)" }}>
          Платформа для НКО и социальных проектов — от первой идеи до победы в гранте.<br />
          Проектная карта, бета-защита с ИИ и экспертное ревью в одном месте.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <button onClick={() => setShowAuth(true)} className="px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105" style={{ background: "white", color: "#2563EB" }}>
            Начать бесплатно
          </button>
        </div>
      </div>

      {/* ── О ПЛАТФОРМЕ ── */}
      <section id="about" className="relative z-10 px-6 py-24 rounded-lg" style={{ background: "rgba(0,0,0,0.15)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-white/60 uppercase tracking-widest mb-4" style={{ background: "rgba(255,255,255,0.08)" }}>О платформе</span>
            <h2 className="text-white font-black mb-4" style={{ fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: "-0.02em" }}>
              Почему именно<br />Грантовый дайвинг?
            </h2>
            <p className="text-white/60 max-w-xl mx-auto leading-relaxed">
              Мы знаем, как сложно написать первую заявку. Тысячи НКО теряют деньги не из-за плохих идей, а из-за ошибок в документах и страха перед комиссией.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "Target",
                title: "Фокус на результат",
                text: "Мы не просто помогаем заполнить форму — мы ведём проект от идеи до победы. Каждый шаг структурирован и понятен.",
              },
              {
                icon: "Shield",
                title: "Защита от ошибок",
                text: "ИИ-тренажёр заранее проверяет слабые места в вашей заявке и готовит вас к реальным вопросам экспертной комиссии.",
              },
              {
                icon: "Users",
                title: "Живые эксперты",
                text: "В сети платформы — практикующие грантрайтеры с опытом побед в ФПГ, Росмолодёжи и президентских конкурсах.",
              },
            ].map(card => (
              <div key={card.title} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <Icon name={card.icon} size={20} className="text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>

          {/* Цифры */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              { value: "500+", label: "НКО на платформе" },
              { value: "72%",  label: "Процент побед" },
              { value: "38",   label: "Экспертов в сети" },
              { value: "2 дня", label: "До готовой заявки" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-white font-black mb-1" style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>{s.value}</div>
                <div className="text-white/50 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ВОЗМОЖНОСТИ ── */}
      <section id="features" className="relative z-10 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-white/60 uppercase tracking-widest mb-4" style={{ background: "rgba(255,255,255,0.08)" }}>Возможности</span>
            <h2 className="text-white font-black mb-4" style={{ fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: "-0.02em" }}>
              Всё что нужно<br />в одном месте
            </h2>
            <p className="text-white/60 max-w-lg mx-auto leading-relaxed">
              Забудьте о разрозненных документах и таблицах. Грантовый дайвинг собирает весь рабочий процесс в единый поток.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: "Map",
                title: "Проектная карта",
                text: "Структурированный конструктор заявки: цели, целевая аудитория, бюджет, KPI. Заполняете по шагам — получаете готовый документ.",
                accent: "#4ADE80",
              },
              {
                icon: "Bot",
                title: "ИИ-тренажёр защиты",
                text: "Сыграйте роль перед комиссией прямо на платформе. ИИ задаёт жёсткие вопросы и показывает, где ваши аргументы слабы.",
                accent: "#60A5FA",
              },
              {
                icon: "BookOpen",
                title: "Грант-Академия",
                text: "Короткие видеоуроки и чек-листы по каждому типу фондов: ФПГ, Росмолодёжь, президентские гранты, международные фонды.",
                accent: "#F59E0B",
              },
              {
                icon: "ClipboardCheck",
                title: "Экспертное ревью",
                text: "Отправьте проект на проверку живому эксперту. Получите письменный отзыв и рекомендации за 24–48 часов.",
                accent: "#A78BFA",
              },
              {
                icon: "Bell",
                title: "Дедлайн-трекер",
                text: "Не пропустите приём заявок. Платформа следит за сроками и напоминает о важных датах по выбранным фондам.",
                accent: "#FB7185",
              },
              {
                icon: "BarChart2",
                title: "Аналитика проектов",
                text: "Статистика по всем вашим заявкам: сколько подано, сколько в работе, процент побед и динамика роста по годам.",
                accent: "#34D399",
              },
            ].map(f => (
              <div key={f.title} className="flex gap-5 rounded-2xl p-6 transition-all" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: f.accent + "22" }}>
                  <Icon name={f.icon} size={20} style={{ color: f.accent }} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1.5">{f.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA нижний ── */}
      <section className="relative z-10 px-6 py-24 text-center" style={{ background: "rgba(0,0,0,0.2)" }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-white font-black mb-4" style={{ fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.02em" }}>
            Готовы к первому гранту?
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Регистрация бесплатная. Начните создавать проект прямо сейчас — первый результат увидите через 15 минут.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-2xl"
            style={{ background: "white", color: "#2563EB" }}
          >
            Начать бесплатно
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png" alt="Логотип" className="w-5 h-5 invert" />
          <span className="text-white/50 text-sm font-medium">Грантовый дайвинг</span>
        </div>
        <p className="text-white/30 text-xs">© 2026 — платформа для грантрайтеров и НКО</p>
      </footer>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => navigate('/dashboard')} />
      )}
    </main>
  )
}

export default Index