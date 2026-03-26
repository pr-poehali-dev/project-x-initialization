import { useState, useEffect } from "react"
import AuthModal from "@/components/AuthModal"
import { useNavigate } from "react-router-dom"
import { getToken } from "@/lib/api"
import Icon from "@/components/ui/icon"

const NAV_LINKS = [
  { href: '#about', label: 'О платформе' },
  { href: '#features', label: 'Возможности' },
  { href: '#cta', label: 'Начать' },
]

const Index = () => {
  const [showAuth, setShowAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (getToken()) navigate('/dashboard')
  }, [])

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", fontFamily: "inherit" }}>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(16px)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img
              src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png"
              alt="Логотип"
              style={{ width: 28, height: 28, filter: "invert(1)" }}
            />
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>Грантовый дайвинг</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden sm:flex" style={{ alignItems: "center", gap: 4 }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} style={{
                color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500,
                padding: "8px 16px", borderRadius: 8, textDecoration: "none",
                transition: "color 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >{l.label}</a>
            ))}
            <button
              onClick={() => setShowAuth(true)}
              style={{
                marginLeft: 8, padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "transparent" }}
            >Войти</button>
            <button
              onClick={() => setShowAuth(true)}
              style={{
                marginLeft: 4, padding: "8px 20px", borderRadius: 8, border: "none",
                background: "#fff", color: "#0a0a0a", fontSize: 14, fontWeight: 600, cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#e5e5e5")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >Начать бесплатно</button>
          </nav>

          {/* Mobile */}
          <div className="flex sm:hidden" style={{ gap: 8 }}>
            <button
              onClick={() => setShowAuth(true)}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#fff", color: "#0a0a0a", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >Войти</button>
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Icon name={menuOpen ? "X" : "Menu"} size={16} style={{ color: "#fff" }} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 0" }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
                display: "block", padding: "12px 24px", color: "rgba(255,255,255,0.6)", fontSize: 14, textDecoration: "none",
              }}>{l.label}</a>
            ))}
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px 80px" }}>
        <div style={{ maxWidth: 760 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Платформа для НКО и социальных проектов</span>
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 6vw, 80px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: 24,
            color: "#fff",
          }}>
            От идеи<br />до победы<br />
            <span style={{ color: "rgba(255,255,255,0.35)" }}>в гранте</span>
          </h1>

          <p style={{ fontSize: "clamp(15px, 1.5vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
            Проектная карта, экспертное ревью и каталог мероприятий — всё что нужно, чтобы выиграть первый грант.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowAuth(true)}
              style={{
                padding: "14px 28px", borderRadius: 10, border: "none",
                background: "#fff", color: "#0a0a0a",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                transition: "background 0.15s, transform 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#e5e5e5"; e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)" }}
            >
              Начать бесплатно
            </button>
            <a href="#about" style={{
              padding: "14px 28px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 500,
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
              transition: "border-color 0.15s, color 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#fff" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)" }}
            >
              Узнать больше
              <Icon name="ArrowDown" size={15} />
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          marginTop: 80,
          paddingTop: 40,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 40,
        }}>
          {[
            { value: "500+", label: "НКО на платформе" },
            { value: "72%", label: "Процент побед" },
            { value: "38", label: "Экспертов в сети" },
            { value: "2 дня", label: "До готовой заявки" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── О ПЛАТФОРМЕ ── */}
      <section id="about" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="grid-responsive">
            <div>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>О платформе</span>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 12, marginBottom: 20, color: "#fff" }}>
                Почему именно<br />Грантовый дайвинг?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
                Тысячи НКО теряют деньги не из-за плохих идей — а из-за ошибок в документах и страха перед комиссией. Мы это исправляем.
              </p>
              <button
                onClick={() => setShowAuth(true)}
                style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: "#fff", color: "#0a0a0a", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Попробовать платформу
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { icon: "Target", title: "Фокус на результат", text: "Ведём проект от идеи до победы. Каждый шаг структурирован и понятен." },
                { icon: "Shield", title: "Защита от ошибок", text: "Система проверяет слабые места в заявке и готовит к реальным вопросам комиссии." },
                { icon: "Users", title: "Живые эксперты", text: "Практикующие грантрайтеры с опытом побед в ФПГ, Росмолодёжи и президентских конкурсах." },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 16, padding: "20px 0",
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: "rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name={item.icon} size={18} style={{ color: "rgba(255,255,255,0.6)" }} />
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.6 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ВОЗМОЖНОСТИ ── */}
      <section id="features" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ marginBottom: 56 }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Возможности</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 12, color: "#fff" }}>
              Всё в одном месте
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
            {[
              { icon: "Map", title: "Проектная карта", text: "Конструктор заявки: цели, аудитория, бюджет, KPI. Заполняете по шагам — получаете готовый документ.", accent: "#4ade80" },
              { icon: "Bot", title: "ИИ-тренажёр защиты", text: "Сыграйте роль перед комиссией. ИИ задаёт жёсткие вопросы и показывает слабые места аргументации.", accent: "#60a5fa" },
              { icon: "BookOpen", title: "Академия грантов", text: "Курсы по всем типам фондов: ФПГ, Росмолодёжь, президентские гранты, международные организации.", accent: "#f59e0b" },
              { icon: "ClipboardCheck", title: "Экспертное ревью", text: "Живой эксперт проверит проект и даст письменный отзыв с рекомендациями за 24–48 часов.", accent: "#a78bfa" },
              { icon: "Calendar", title: "Каталог мероприятий", text: "Все актуальные грантовые конкурсы с дедлайнами, суммами и требованиями в одном месте.", accent: "#fb7185" },
              { icon: "BarChart2", title: "Аналитика проектов", text: "Статистика по заявкам: сколько подано, в работе, выиграно. Динамика роста по годам.", accent: "#34d399" },
            ].map((f, i) => (
              <div key={i} style={{
                padding: "28px", border: "1px solid rgba(255,255,255,0.06)",
                transition: "background 0.2s",
                cursor: "default",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, marginBottom: 20,
                  background: f.accent + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name={f.icon} size={18} style={{ color: f.accent }} />
                </div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.65 }}>{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#fff", marginBottom: 12 }}>
              Готовы к первому гранту?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, lineHeight: 1.6, maxWidth: 440 }}>
              Регистрация бесплатная. Первый результат — через 15 минут после старта.
            </p>
          </div>
          <button
            onClick={() => setShowAuth(true)}
            style={{
              padding: "16px 36px", borderRadius: 10, border: "none",
              background: "#fff", color: "#0a0a0a",
              fontSize: 16, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
              transition: "background 0.15s, transform 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#e5e5e5"; e.currentTarget.style.transform = "translateY(-1px)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)" }}
          >
            Начать бесплатно
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png"
              alt="Логотип"
              style={{ width: 20, height: 20, filter: "invert(1)", opacity: 0.4 }}
            />
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Грантовый дайвинг</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>© 2025 — Все права защищены</span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => navigate('/dashboard')} />
      )}
    </div>
  )
}

export default Index
