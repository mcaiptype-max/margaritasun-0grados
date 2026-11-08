import { lazy, Suspense, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Reveal, LazyMount } from '../fx/text'
import { SITE } from '../content'
import { BOTTLE } from '../bottleSpec'

const BottleStage = lazy(() => import('../three/BottleStage'))

// Archivos del modelo (se generan desde el Estudio: botones .glb / .usdz)
const GLB = '/models/margarita-sun.glb'
const USDZ = '/models/margarita-sun.usdz'

function platform() {
  const a = document.createElement('a')
  if (a.relList?.supports?.('ar')) return 'ios'
  if (/android/i.test(navigator.userAgent)) return 'android'
  return 'desktop'
}

export default function ARSection({ t }) {
  const [plat, setPlat] = useState('desktop')
  const [qr, setQr] = useState(null)
  const [note, setNote] = useState(false)
  useEffect(() => {
    setPlat(platform())
    QRCode.toDataURL(`${SITE.url}/#ar`, { margin: 1, width: 360, color: { dark: '#122a66', light: '#fbf5e8' } }).then(setQr)
  }, [])

  const heightCm = Math.round((BOTTLE.bodyHeight + BOTTLE.shoulderHeight + BOTTLE.neckHeight + 7 + BOTTLE.capHeight * 0.45) / 10)

  const openAR = () => {
    if (plat === 'ios') {
      // Quick Look de iPhone/iPad: <a rel="ar"> con una imagen como único hijo
      const a = document.createElement('a')
      a.rel = 'ar'
      a.href = new URL(USDZ, window.location.href).href + '#allowsContentScaling=0'
      a.appendChild(document.createElement('img'))
      a.click()
    } else if (plat === 'android') {
      const file = new URL(GLB, window.location.href).href
      const fallback = encodeURIComponent(window.location.href)
      window.location.href =
        `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(file)}&mode=ar_preferred&title=Margarita%20Sun` +
        `#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${fallback};end;`
    } else {
      setNote(true)
    }
  }

  return (
    <section className="section ar" id="ar">
      <div className="ar-grid">
        <Reveal className="ar-copy">
          <span className="kicker">{t.kicker}</span>
          <h2 className="h2">{t.title}</h2>
          <p className="lead">{t.text}</p>
          <button className="btn-primary ar-btn" onClick={openAR}>
            <ARIcon /> {t.cta}
          </button>
          {plat === 'desktop' && (
            <div className={`ar-desk ${note ? 'pulse-once' : ''}`}>
              {qr && <img src={qr} alt="QR" width="120" height="120" />}
              <p>{t.desktop}</p>
            </div>
          )}
        </Reveal>
        <div className="ar-stage">
          <div className="ar-floor" aria-hidden />
          <Suspense fallback={null}>
            <LazyMount className="fill">
              <BottleStage mode="hero" className="fill" />
            </LazyMount>
          </Suspense>
          <div className="ar-ruler" aria-hidden>
            <span>≈ {heightCm} cm</span>
          </div>
          <span className="ar-badge">AR · 1:1</span>
        </div>
      </div>
    </section>
  )
}

function ARIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2 3 7v10l9 5 9-5V7z" />
      <path d="M3 7l9 5 9-5M12 12v10" />
    </svg>
  )
}
