import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useInView, animate, useScroll, useVelocity, useSpring, useTransform, useMotionValue, useAnimationFrame } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const EASE = [0.22, 1, 0.36, 1]

/** Letras que suben una por una (estilo SplitText). */
export function SplitText({ text, className = '', delay = 0, stagger = 0.045, as: Tag = 'h1' }) {
  let n = 0
  const words = text.split(' ')
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, wi) => (
        <Fragment key={wi}>
        <span className="split-word" aria-hidden>
          {[...w].map((ch) => {
            const i = n++
            return (
              <span key={i} className="split-mask">
                <motion.span
                  className="split-char"
                  initial={{ y: '110%', rotate: 8, opacity: 0 }}
                  animate={{ y: '0%', rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.9, ease: EASE, delay: delay + i * stagger }}
                >
                  {ch}
                </motion.span>
              </span>
            )
          })}
        </span>
        {wi < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </Tag>
  )
}

/** Palabras que aparecen desenfocadas → nítidas (estilo BlurText). */
export function BlurText({ text, className = '', delay = 0, as: Tag = 'p' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  // Japonés no usa espacios: se anima por carácter.
  const parts = /\s/.test(text) ? text.split(' ') : [...text]
  const joiner = /\s/.test(text) ? ' ' : ''
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {parts.map((w, i) => (
        <motion.span
          key={i + w}
          aria-hidden
          style={{ display: 'inline-block' }}
          initial={{ filter: 'blur(12px)', opacity: 0, y: 14 }}
          animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: delay + i * (joiner ? 0.07 : 0.035) }}
        >
          {w}
          {i < parts.length - 1 ? joiner : ''}
        </motion.span>
      ))}
    </Tag>
  )
}

/** Brillo que recorre el texto (estilo ShinyText). */
export function ShinyText({ children, className = '' }) {
  return <span className={`shiny ${className}`}>{children}</span>
}

/** Número que cuenta al entrar en pantalla (estilo CountUp). */
export function CountUp({ to, suffix = '', duration = 1.8, locale = 'es-MX' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration, ease: EASE, onUpdate: (v) => setVal(Math.round(v)) })
    return () => c.stop()
  }, [inView, to, duration])
  return (
    <span ref={ref}>
      {val.toLocaleString(locale)}
      {suffix}
    </span>
  )
}

/** Párrafo que se "enciende" palabra por palabra con el scroll (estilo ScrollReveal). */
export function ScrollReveal({ text, className = '' }) {
  const ref = useRef(null)
  const parts = /\s/.test(text) ? text.split(' ') : [...text]
  const sep = /\s/.test(text) ? ' ' : ''
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const words = el.querySelectorAll('.sr-w')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.12, filter: 'blur(4px)' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [text])
  return (
    <p ref={ref} className={className}>
      {parts.map((w, i) => (
        <span key={i} className="sr-w">
          {w}
          {i < parts.length - 1 ? sep : ''}
        </span>
      ))}
    </p>
  )
}

/** Cinta infinita que acelera con la velocidad del scroll (estilo ScrollVelocity). */
export function VelocityMarquee({ items, base = 40, className = '' }) {
  const x = useMotionValue(0)
  const { scrollY } = useScroll()
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(vel, [-1500, 0, 1500], [-4, 1, 4], { clamp: false })
  const dir = useRef(-1)
  const track = useRef(null)
  useAnimationFrame((_, dt) => {
    const f = factor.get()
    if (f < 0) dir.current = 1
    else if (f > 0) dir.current = -1
    const w = track.current ? track.current.scrollWidth / 2 : 1000
    let next = x.get() + dir.current * base * (dt / 1000) * Math.max(1, Math.abs(f))
    if (next <= -w) next += w
    if (next > 0) next -= w
    x.set(next)
  })
  const row = [...items, ...items]
  return (
    <div className={`marquee ${className}`}>
      <motion.div className="marquee-track" ref={track} style={{ x }}>
        {[...row, ...row].map((it, i) => (
          <span key={i} className="marquee-item">
            {it}
            <svg viewBox="0 0 24 24" className="marquee-sun" aria-hidden>
              <circle cx="12" cy="12" r="5" />
              {Array.from({ length: 8 }).map((_, k) => {
                const a = (k * Math.PI) / 4
                return <line key={k} x1={12 + Math.cos(a) * 8} y1={12 + Math.sin(a) * 8} x2={12 + Math.cos(a) * 11} y2={12 + Math.sin(a) * 11} />
              })}
            </svg>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/** Tarjeta con luz que sigue al cursor (estilo SpotlightCard). */
export function SpotlightCard({ children, className = '', color = 'rgba(242,123,43,0.28)' }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <div ref={ref} onPointerMove={onMove} className={`spot ${className}`} style={{ '--spot': color }}>
      {children}
    </div>
  )
}

/** Aparece al entrar en pantalla. */
export function Reveal({ children, delay = 0, y = 40, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Monta a los hijos sólo cuando están cerca de la pantalla (ahorra GPU en el celular). */
export function LazyMount({ children, className = '', rootMargin = '200px' }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [rootMargin])
  return (
    <div ref={ref} className={className}>
      {on ? children : null}
    </div>
  )
}
