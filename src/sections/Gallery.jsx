import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GALLERY } from '../content'
import { Reveal } from '../fx/text'
import { TileSVG } from './icons'

gsap.registerPlugin(ScrollTrigger)

function Card({ item, i, lang, soon, onOpen }) {
  const [ok, setOk] = useState(null) // null = cargando, true/false
  const tilt = [-2.5, 1.8, -1.2, 2.4, -1.8, 1.2, -2.2, 1.6][i % 8]
  return (
    <figure className={`bts-card ${ok ? 'has-img' : 'is-empty'}`} style={{ '--tilt': `${tilt}deg` }}>
      <div className="bts-frame" onClick={() => ok && onOpen(i)} role={ok ? 'button' : undefined} tabIndex={ok ? 0 : -1}>
        {ok !== false && (
          <motion.img
            layoutId={`bts-${i}`}
            src={item.src}
            alt={item[lang]}
            loading="lazy"
            className="bts-img"
            onLoad={() => setOk(true)}
            onError={() => setOk(false)}
            style={{ opacity: ok ? 1 : 0 }}
          />
        )}
        {ok === false && (
          <div className="bts-empty">
            <TileSVG className="bts-tile" />
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>{soon}</span>
          </div>
        )}
      </div>
      <figcaption>
        <span className="bts-num">{String(i + 1).padStart(2, '0')}</span>
        {item[lang]}
      </figcaption>
    </figure>
  )
}

export default function Gallery({ t, lang }) {
  const section = useRef(null)
  const track = useRef(null)
  const [open, setOpen] = useState(null)

  // En escritorio: la galería se fija y se desplaza horizontalmente con el scroll
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      const el = track.current
      const dist = () => el.scrollWidth - window.innerWidth + 80
      const tween = gsap.to(el, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
      // parallax suave dentro de cada foto
      gsap.utils.toArray(el.querySelectorAll('.bts-frame')).forEach((f) => {
        gsap.fromTo(
          f.querySelector('.bts-img, .bts-empty'),
          { xPercent: -6 },
          { xPercent: 6, ease: 'none', scrollTrigger: { trigger: f, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } },
        )
      })
    })
    return () => mm.revert()
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="bts" ref={section} id="detras">
      <div className="bts-head">
        <Reveal>
          <span className="kicker">{t.kicker}</span>
          <h2 className="h2">{t.title}</h2>
          <p className="lead">{t.text}</p>
        </Reveal>
      </div>
      <div className="bts-track" ref={track}>
        {GALLERY.map((item, i) => (
          <Card key={item.src} item={item} i={i} lang={lang} soon={t.soon} onOpen={setOpen} />
        ))}
      </div>
      <AnimatePresence>
        {open !== null && (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.img layoutId={`bts-${open}`} src={GALLERY[open].src} alt={GALLERY[open][lang]} />
            <p>{GALLERY[open][lang]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
