import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { content, SITE } from './content'
import Aurora from './fx/Aurora'
import { SplitText, BlurText, ShinyText, CountUp, ScrollReveal, VelocityMarquee, SpotlightCard, Reveal, LazyMount } from './fx/text'
import { Icon, TileSVG } from './sections/icons'
import PackSection from './sections/PackSection'
import ARSection from './sections/ARSection'
import Gallery from './sections/Gallery'
import RouteMap from './sections/RouteMap'
import BerryRain from './fx/BerryRain'

const BottleStage = lazy(() => import('./three/BottleStage'))
const Studio = lazy(() => import('./sections/Studio'))

gsap.registerPlugin(ScrollTrigger)

function useLang() {
  const initial = () => {
    const saved = (() => {
      try {
        return localStorage.getItem('ms-lang')
      } catch {
        return null
      }
    })()
    if (saved) return saved
    return navigator.language?.startsWith('ja') ? 'ja' : 'es'
  }
  const [lang, setLang] = useState(initial)
  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('ms-lang', lang)
    } catch {}
    // Los textos cambian de largo: recalcular posiciones de scroll
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [lang])
  return [lang, setLang]
}

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

/* ───────────────────────── NAV ───────────────────────── */
function Nav({ t, lang, setLang }) {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <nav className={`nav ${solid ? 'solid' : ''}`}>
      <a href="#top" className="logo" aria-label="0 Grados">
        <span className="logo-mark">0°</span>
        <span className="logo-word">Margarita Sun</span>
      </a>
      <div className="nav-links">
        <a href="#historia">{t.nav.story}</a>
        <a href="#empaque">{t.nav.pack}</a>
        <a href="#ritual">{t.nav.ritual}</a>
        <a href="#origen">{t.nav.origin}</a>
        <a href="#estudio" className="nav-studio">
          {t.nav.studio}
        </a>
      </div>
      <div className="lang" role="group" aria-label="Idioma / 言語">
        <motion.span className="lang-pill" layout transition={{ type: 'spring', stiffness: 500, damping: 35 }} style={{ left: lang === 'es' ? 4 : '50%' }} />
        <button className={lang === 'es' ? 'on' : ''} onClick={() => setLang('es')}>
          ES
        </button>
        <button className={lang === 'ja' ? 'on' : ''} onClick={() => setLang('ja')}>
          日本語
        </button>
      </div>
    </nav>
  )
}

/* ───────────────────────── HERO ───────────────────────── */
function Hero({ t, lang }) {
  return (
    <header className="hero" id="top">
      <Aurora className="hero-bg" />
      <div className="hero-sun" aria-hidden />
      <div className="hero-inner">
        <div className="hero-copy" key={lang}>
          <ShinyText className="eyebrow">{t.hero.eyebrow}</ShinyText>
          <SplitText text={t.hero.title} className="hero-title" delay={0.15} />
          <BlurText text={t.hero.subtitle} className="hero-sub" delay={0.7} />
          <motion.a
            href="#historia"
            className="btn-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.7 }}
          >
            {t.hero.cta} ↓
          </motion.a>
        </div>
        <div className="hero-bottle">
          <Suspense fallback={<div className="bottle-fallback" />}>
            <LazyMount className="fill">
              <BottleStage mode="hero" className="fill" />
            </LazyMount>
          </Suspense>
          <span className="drag-hint">⟲ {t.hero.drag}</span>
        </div>
      </div>
      <svg className="hero-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
        <path d="M0,64 C240,120 480,0 720,48 C960,96 1200,24 1440,64 L1440,120 L0,120 Z" />
      </svg>
    </header>
  )
}

/* ───────────────────────── HISTORIA ───────────────────────── */
function Story({ t, lang }) {
  return (
    <section className="section story" id="historia">
      <Reveal>
        <span className="kicker">{t.story.kicker}</span>
      </Reveal>
      <ScrollReveal key={lang} text={t.story.text} className="story-text" />
      <div className="stats">
        {t.stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.08} className="stat">
            <strong>
              <CountUp to={s.v} suffix={s.s} locale={lang === 'ja' ? 'ja-JP' : 'es-MX'} />
            </strong>
            <span>{s.l}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─────────────── ENVASE: botella que gira con el scroll ─────────────── */
function Anatomy({ t }) {
  const wrap = useRef(null)
  const progress = useRef(0)
  const [active, setActive] = useState(0)
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress.current = self.progress
        setActive(Math.min(t.anatomy.items.length - 1, Math.floor(self.progress * t.anatomy.items.length)))
      },
    })
    return () => st.kill()
  }, [t])
  return (
    <section className="anatomy" ref={wrap}>
      <div className="anatomy-sticky">
        <div className="anatomy-head">
          <span className="kicker">{t.anatomy.kicker}</span>
          <h2 className="h2">{t.anatomy.title}</h2>
        </div>
        <div className="anatomy-stage">
          <div className="anatomy-ring" aria-hidden />
          <Suspense fallback={null}>
            <LazyMount className="fill">
              <BottleStage mode="scroll" scrollRef={progress} className="fill" />
            </LazyMount>
          </Suspense>
        </div>
        <ol className="anatomy-list">
          {t.anatomy.items.map((it, i) => (
            <li key={i} className={i === active ? 'on' : ''}>
              <span className="num">0{i + 1}</span>
              <div>
                <b>{it.t}</b>
                <p>{it.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="anatomy-progress">
          {t.anatomy.items.map((_, i) => (
            <i key={i} className={i <= active ? 'on' : ''} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── INGREDIENTES ───────────────────────── */
function Ingredients({ t }) {
  return (
    <section className="section ingredients">
      <Reveal>
        <span className="kicker">{t.ingredients.kicker}</span>
        <h2 className="h2">{t.ingredients.title}</h2>
      </Reveal>
      <div className="grid4">
        {t.ingredients.items.map((it, i) => (
          <Reveal key={it.k} delay={i * 0.1}>
            <SpotlightCard className="ing-card">
              <div className={`ing-icon ic-${it.k}`}>
                <Icon name={it.k} />
              </div>
              <h3>{it.t}</h3>
              <p>{it.d}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ───────────────────────── RITUAL (tarjetas apiladas) ───────────────────────── */
function Ritual({ t, fx }) {
  const ref = useRef(null)
  return (
    <section className="section ritual" id="ritual" ref={ref}>
      <BerryRain targetRef={ref} hint={fx} />
      <Reveal>
        <span className="kicker">{t.ritual.kicker}</span>
        <h2 className="h2">{t.ritual.title}</h2>
      </Reveal>
      <div className="stack">
        {t.ritual.steps.map((s, i) => (
          <div key={i} className={`stack-card sc-${i}`} style={{ top: `calc(90px + ${i * 22}px)` }}>
            <span className="stack-num">{i + 1}</span>
            <div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
            <TileSVG className="stack-tile" />
          </div>
        ))}
      </div>
    </section>
  )
}

/* ───────────────────────── ORIGEN (ruta animada) ───────────────────────── */
function Origin({ t }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.tile-row svg'),
        { rotate: -90, scale: 0, opacity: 0 },
        {
          rotate: 0,
          scale: 1,
          opacity: 1,
          stagger: 0.06,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: el.querySelector('.tile-row'), start: 'top 90%' },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section className="section origin" id="origen" ref={ref}>
      <Reveal>
        <span className="kicker">{t.origin.kicker}</span>
        <h2 className="h2">{t.origin.title}</h2>
        <p className="lead">{t.origin.text}</p>
      </Reveal>
      <RouteMap t={t.origin} />
      <div className="tile-row" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <TileSVG key={i} />
        ))}
      </div>
    </section>
  )
}

/* ───────────────────────── SUSTENTABLE ───────────────────────── */
function Green({ t }) {
  return (
    <section className="section green">
      <Reveal>
        <span className="kicker">{t.green.kicker}</span>
        <h2 className="h2">{t.green.title}</h2>
      </Reveal>
      <div className="grid3">
        {t.green.items.map((it, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <div className="green-card">
              <div className="green-icon">
                <Icon name={['glass', 'cap', 'box'][i]} />
              </div>
              <h3>{it.t}</h3>
              <p>{it.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ───────────────────────── CTA ESTUDIO ───────────────────────── */
function StudioCta({ t }) {
  return (
    <section className="studio-cta">
      <Aurora className="cta-bg" colors={['#2a1450', '#c8233f', '#f27b2b', '#ffcf73']} />
      <Reveal className="cta-inner">
        <span className="kicker light">{t.studio.kicker}</span>
        <h2 className="h2 light">{t.studio.title}</h2>
        <p className="lead light">{t.studio.text}</p>
        <a href="#estudio" className="btn-primary btn-light">
          {t.studio.cta} →
        </a>
      </Reveal>
    </section>
  )
}

function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="footer-tiles" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <TileSVG key={i} />
        ))}
      </div>
      <div className="footer-inner">
        <div className="logo big">
          <span className="logo-mark">0°</span>
          <span>
            {t.footer.by} <b>{SITE.company}</b>
          </span>
        </div>
        <p>{t.footer.made}</p>
        <p className="muted">© 2026 · Puebla, México</p>
      </div>
    </footer>
  )
}

export default function App() {
  const [lang, setLang] = useLang()
  const hash = useHashRoute()
  const t = content[lang]
  const studioOpen = hash === '#estudio'

  useEffect(() => {
    document.body.style.overflow = studioOpen ? 'hidden' : ''
  }, [studioOpen])

  return (
    <div className={`app lang-${lang}`}>
      <Nav t={t} lang={lang} setLang={setLang} />
      <main>
        <Hero t={t} lang={lang} />
        <VelocityMarquee items={t.marquee} />
        <Story t={t} lang={lang} />
        <Anatomy t={t} />
        <Ingredients t={t} />
        <PackSection t={t.pack} />
        <Ritual t={t} fx={t.ritualFx} />
        <Origin t={t} />
        <Gallery t={t.bts} lang={lang} />
        <ARSection t={t.ar} lang={lang} />
        <Green t={t} />
        <StudioCta t={t} />
      </main>
      <Footer t={t} />
      <AnimatePresence>
        {studioOpen && (
          <Suspense fallback={null}>
            <Studio
              t={t.studio}
              lang={lang}
              onClose={() => {
                history.pushState('', '', window.location.pathname)
                window.dispatchEvent(new HashChangeEvent('hashchange'))
              }}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  )
}
