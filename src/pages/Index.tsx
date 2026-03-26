import { useState, useEffect, useRef } from "react"
import AuthModal from "@/components/AuthModal"
import { useNavigate } from "react-router-dom"
import { getToken } from "@/lib/api"
import Icon from "@/components/ui/icon"

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect() } },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(48px)",
      transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  )
}

const FEATURES = [
  {
    tag: "Проектная карта",
    title: "Заявка за 2 дня, не за 2 недели",
    text: "Конструктор шаг за шагом: цели, аудитория, бюджет, KPI. Никаких пустых страниц — только конкретные поля.",
    bg: "#0d1117",
    accent: "#4ade80",
    icon: "Map",
  },
  {
    tag: "ИИ-тренажёр",
    title: "Комиссия не\u00A0застанет врасплох",
    text: "ИИ играет роль строгого эксперта — задаёт провокационные вопросы и указывает на слабые места до защиты.",
    bg: "#0d0d1f",
    accent: "#818cf8",
    icon: "Bot",
  },
  {
    tag: "Экспертное ревью",
    title: "Живой взгляд\u00A0— живой результат",
    text: "Практикующий грантрайтер проверит проект и пришлёт письменный отзыв за 24–48 часов.",
    bg: "#130d0d",
    accent: "#fb7185",
    icon: "ClipboardCheck",
  },
  {
    tag: "Каталог грантов",
    title: "Все дедлайны\u00A0— в одном месте",
    text: "ФПГ, Росмолодёжь, президентские конкурсы. Актуальные даты, суммы и требования без ручного поиска.",
    bg: "#0d1209",
    accent: "#86efac",
    icon: "Calendar",
  },
]

const STATS = [
  { value: "500+", label: "НКО на платформе" },
  { value: "72%", label: "выигрывают с первой заявки" },
  { value: "38", label: "экспертов в сети" },
  { value: "24ч", label: "до обратной связи" },
]

export default function Index() {
  const [showAuth, setShowAuth] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (getToken()) navigate("/dashboard")
    const t = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(t)
  }, [])

  const appear = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "none" : "translateY(32px)",
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  })

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1 }}>

      {/* ── HEADER ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,10,10,0.7)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        ...appear(0),
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img
              src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png"
              alt="Логотип"
              style={{ width: 24, height: 24, filter: "invert(1)" }}
            />
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: "#fff" }}>Грантовый дайвинг</span>
          </a>

          <nav className="hidden sm:flex" style={{ alignItems: "center", gap: 0 }}>
            {[
              { href: "#features", label: "Продукт" },
              { href: "#about", label: "Эксперты" },
              { href: "#stats", label: "Результаты" },
            ].map(l => (
              <a key={l.href} href={l.href} style={{
                color: "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: 500,
                padding: "8px 18px", textDecoration: "none", letterSpacing: "-0.01em",
                transition: "color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
              >{l.label}</a>
            ))}
          </nav>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setShowAuth(true)} className="hidden sm:block" style={{
              padding: "8px 18px", borderRadius: 8, background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)",
              fontSize: 14, fontWeight: 500, cursor: "pointer", letterSpacing: "-0.01em",
              transition: "border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.color = "#fff" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}
            >Войти</button>
            <button onClick={() => setShowAuth(true)} style={{
              padding: "9px 20px", borderRadius: 8, background: "#fff",
              border: "none", color: "#0a0a0a",
              fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em",
              transition: "background 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#e8e8e8"; e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "none" }}
            >Попробовать</button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 32px 80px", maxWidth: 1280, margin: "0 auto", position: "relative" }}>
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", top: "10%", right: "0%",
            width: "clamp(400px, 55vw, 900px)", height: "clamp(400px, 55vw, 900px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(74,222,128,0.055) 0%, transparent 65%)",
            filter: "blur(40px)",
            animation: "pulse1 9s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", top: "35%", right: "25%",
            width: "clamp(250px, 35vw, 600px)", height: "clamp(250px, 35vw, 600px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 65%)",
            filter: "blur(60px)",
            animation: "pulse2 12s ease-in-out infinite 3s",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, paddingTop: 60 }}>
          <div style={{ marginBottom: 32, ...appear(0.15) }}>
            <span style={{
              display: "inline-block",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "#4ade80",
            }}>для НКО и социальных проектов</span>
          </div>

          <h1 style={{
            fontSize: "clamp(56px, 9.5vw, 140px)",
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            color: "#fff",
            margin: 0,
            marginBottom: 52,
            ...appear(0.25),
          }}>
            Выиграй<br />
            <span style={{ color: "rgba(255,255,255,0.18)" }}>первый</span><br />
            грант.
          </h1>

          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", ...appear(0.45) }}>
            <button onClick={() => setShowAuth(true)} style={{
              padding: "18px 40px", borderRadius: 12, background: "#fff",
              border: "none", color: "#0a0a0a",
              fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.02em",
              transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), background 0.2s",
              display: "inline-flex", alignItems: "center", gap: 10,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#e8e8e8" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = "#fff" }}
            >
              Начать бесплатно
              <Icon name="ArrowRight" size={17} />
            </button>
            <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 14, letterSpacing: "-0.01em" }}>
              Без карты. Без скрытых условий.
            </span>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }} className="stats-grid">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div style={{
                  padding: "52px 40px",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                }} className="stat-item">
                  <div style={{ fontSize: "clamp(38px, 5vw, 70px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 14, marginTop: 10, letterSpacing: "-0.01em", lineHeight: 1.4 }}>{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── МАНИФЕСТ ── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 32px" }}>
          <Reveal>
            <p style={{
              fontSize: "clamp(24px, 4vw, 54px)",
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: "-0.03em",
              color: "#fff",
              maxWidth: 860,
            }}>
              Тысячи НКО теряют гранты не из-за плохих идей —&nbsp;а&nbsp;из-за ошибок в&nbsp;документах и страха перед комиссией.{" "}
              <span style={{ color: "rgba(255,255,255,0.18)" }}>Мы это исправляем.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 32px" }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 64 }}>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 72px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>
                Что внутри
              </h2>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14, letterSpacing: "-0.01em" }}>четыре инструмента</span>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }} className="features-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.tag} delay={i * 0.1}>
                <div style={{
                  background: f.bg,
                  padding: "52px 48px",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "default",
                  transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1)",
                  height: "100%",
                  boxSizing: "border-box",
                }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.012)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "none")}
                >
                  <div style={{
                    position: "absolute", top: -80, right: -80,
                    width: 300, height: 300,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${f.accent}15 0%, transparent 70%)`,
                    filter: "blur(40px)",
                    pointerEvents: "none",
                  }} />
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "5px 12px", borderRadius: 100,
                    background: f.accent + "14",
                    marginBottom: 36,
                  }}>
                    <Icon name={f.icon} size={12} style={{ color: f.accent }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: f.accent }}>{f.tag}</span>
                  </div>
                  <h3 style={{ fontSize: "clamp(22px, 2.4vw, 36px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.08, marginBottom: 18 }}>{f.title}</h3>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.65, letterSpacing: "-0.01em", maxWidth: 380 }}>{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ЭКСПЕРТЫ ── */}
      <section id="about" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="about-grid">
            <Reveal>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 24 }}>Сеть экспертов</span>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 68px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.0, marginBottom: 28 }}>
                38 живых<br />
                <span style={{ color: "rgba(255,255,255,0.18)" }}>грантрайтеров</span>
              </h2>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.38)", lineHeight: 1.65, letterSpacing: "-0.01em", marginBottom: 40, maxWidth: 420 }}>
                Практики с опытом побед в ФПГ, Росмолодёжи и президентских конкурсах. Не теоретики — люди, которые сами выигрывали гранты.
              </p>
              <button onClick={() => setShowAuth(true)} style={{
                padding: "15px 30px", borderRadius: 10, background: "transparent",
                border: "1px solid rgba(255,255,255,0.18)", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em",
                transition: "border-color 0.2s, background 0.2s, transform 0.2s",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "none" }}
              >
                Найти эксперта
                <Icon name="ArrowRight" size={14} />
              </button>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {[
                { name: "Анна К.", role: "ФПГ, культура", wins: "12 побед" },
                { name: "Иван Р.", role: "Росмолодёжь", wins: "9 побед" },
                { name: "Мария С.", role: "Президентские", wins: "17 побед" },
                { name: "+35", role: "экспертов", wins: "в сети" },
              ].map((expert, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div style={{
                    padding: "28px 24px",
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    transition: "background 0.2s, border-color 0.2s, transform 0.2s",
                    cursor: "default",
                  }}
                    onMouseEnter={el => { el.currentTarget.style.background = "rgba(255,255,255,0.055)"; el.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; el.currentTarget.style.transform = "translateY(-2px)" }}
                    onMouseLeave={el => { el.currentTarget.style.background = "rgba(255,255,255,0.025)"; el.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; el.currentTarget.style.transform = "none" }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", marginBottom: 4 }}>{expert.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "-0.01em", marginBottom: 18 }}>{expert.role}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80", letterSpacing: "-0.01em" }}>{expert.wins}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Reveal>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 32px", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(52px, 9vw, 120px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 0.92, marginBottom: 52 }}>
              Готовы<br />
              <span style={{ color: "rgba(255,255,255,0.16)" }}>к победе?</span>
            </h2>
            <button onClick={() => setShowAuth(true)} style={{
              padding: "20px 52px", borderRadius: 14, background: "#fff",
              border: "none", color: "#0a0a0a",
              fontSize: 17, fontWeight: 900, cursor: "pointer", letterSpacing: "-0.02em",
              transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1), background 0.2s",
              display: "inline-flex", alignItems: "center", gap: 12,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.025)"; e.currentTarget.style.background = "#ececec" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = "#fff" }}
            >
              Начать бесплатно
              <Icon name="ArrowRight" size={19} />
            </button>
            <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 14, marginTop: 22, letterSpacing: "-0.01em" }}>
              Регистрация за 30 секунд. Первый результат — через 15 минут.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png"
              alt="Логотип"
              style={{ width: 18, height: 18, filter: "invert(1)", opacity: 0.2 }}
            />
            <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>Грантовый дайвинг</span>
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.14)", fontSize: 13 }}>© 2025</span>
            {["#features", "#about"].map((href, i) => (
              <a key={href} href={href} style={{ color: "rgba(255,255,255,0.18)", fontSize: 13, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.18)")}
              >{i === 0 ? "Продукт" : "Эксперты"}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes pulse1 {
          0%, 100% { transform: scale(1) translate(0,0); }
          50% { transform: scale(1.1) translate(15px, -20px); }
        }
        @keyframes pulse2 {
          0%, 100% { transform: scale(1) translate(0,0); }
          50% { transform: scale(0.92) translate(-10px, 18px); }
        }
        @media (max-width: 860px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
        @media (max-width: 640px) {
          .stats-grid .stat-item { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); }
        }
      `}</style>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => navigate("/dashboard")} />
      )}
    </div>
  )
}
