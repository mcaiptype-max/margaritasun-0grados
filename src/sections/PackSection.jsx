import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LazyMount } from '../fx/text'

const PackScene = lazy(() => import('../three/PackScene'))

export default function PackSection({ t }) {
  const wrap = useRef(null)
  const progress = useRef(0)
  const bar = useRef(null)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress.current = self.progress
        if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
      },
    })
    return () => st.kill()
  }, [])

  const s = t.stages[stage]
  return (
    <section className="pack" ref={wrap} id="empaque">
      <div className="pack-sticky">
        <div className="pack-canvas">
          <Suspense fallback={null}>
            <LazyMount className="fill" rootMargin="400px">
              <PackScene progress={progress} onStage={setStage} className="fill" />
            </LazyMount>
          </Suspense>
        </div>

        <header className="pack-head">
          <span className="kicker">{t.kicker}</span>
          <h2 className="h2">{t.title}</h2>
        </header>

        <div className="pack-card">
          <div className="pack-steps" aria-hidden>
            {t.stages.map((_, i) => (
              <i key={i} className={i < stage ? 'done' : i === stage ? 'on' : ''} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={stage + s.t}
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="pack-tag">
                {String(stage + 1).padStart(2, '0')} · {s.tag}
              </span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </motion.div>
          </AnimatePresence>
          <div className="pack-bar">
            <span ref={bar} />
          </div>
        </div>

        <span className={`pack-hint ${stage > 0 ? 'hide' : ''}`}>↓ {t.hint}</span>
      </div>
    </section>
  )
}
