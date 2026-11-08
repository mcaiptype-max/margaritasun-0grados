import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Reveal } from '../fx/text'
import { SITE } from '../content'
import { BOTTLE } from '../bottleSpec'

// Modelos de la botella a tamaño real (se generan desde el Estudio: botones .glb / .usdz)
const GLB = '/models/margarita-sun.glb'
const USDZ = '/models/margarita-sun.usdz'
// <model-viewer> de Google: maneja AR en Android (Scene Viewer / WebXR) e iPhone (Quick Look)
const MV_SRC = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.4.0/dist/model-viewer.min.js'

function loadModelViewer() {
  if (customElements.get('model-viewer')) return Promise.resolve()
  if (!window.__mvLoading) {
    window.__mvLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.type = 'module'
      s.src = MV_SRC
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    }).then(() => customElements.whenDefined('model-viewer'))
  }
  return window.__mvLoading
}

const isAndroid = () => /android/i.test(navigator.userAgent)
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /macintosh/i.test(navigator.userAgent))

// Respaldo manual: abre el visor AR del sistema aunque model-viewer no lo haya habilitado
function launchSceneViewer() {
  const file = new URL(GLB, window.location.href).href
  // si el teléfono no tiene el visor de Google, el navegador regresa aquí con este ancla
  const fallback = encodeURIComponent(window.location.href.split('#')[0] + '#ar-sin-visor')
  const a = document.createElement('a')
  a.href =
    `intent://arvr.google.com/scene-viewer/1.2?file=${encodeURIComponent(file)}&mode=ar_preferred&resizable=false&title=Margarita%20Sun` +
    `#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${fallback};end;`
  a.click()
}
function launchQuickLook() {
  const a = document.createElement('a')
  a.rel = 'ar'
  a.href = new URL(USDZ, window.location.href).href + '#allowsContentScaling=0'
  a.appendChild(document.createElement('img'))
  a.click()
}

const isMobile = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /macintosh/i.test(navigator.userAgent))

export default function ARSection({ t, lang }) {
  const mv = useRef(null)
  const wrap = useRef(null)
  const [ready, setReady] = useState(false)
  const [canAR, setCanAR] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [qr, setQr] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (window.location.hash === '#ar-sin-visor' || window.location.hash === '#model-viewer-no-ar-fallback') {
      setMsg(t.noViewer)
      history.replaceState(null, '', window.location.pathname + '#ar')
      setTimeout(() => document.getElementById('ar')?.scrollIntoView(), 300)
    }
    setMobile(isMobile())
    QRCode.toDataURL(`${SITE.url}/#ar`, { margin: 1, width: 360, color: { dark: '#122a66', light: '#fbf5e8' } }).then(setQr)
    // cargar model-viewer solo cuando la sección se acerca a la pantalla
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        loadModelViewer()
          .then(() => setReady(true))
          .catch(() => setMsg(t.loadError))
      },
      { rootMargin: '600px' },
    )
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [t.loadError])

  useEffect(() => {
    const el = mv.current
    if (!ready || !el) return
    const onLoad = () => setCanAR(!!el.canActivateAR)
    const onStatus = (e) => {
      if (e.detail.status === 'failed') setMsg(t.failed)
    }
    el.addEventListener('load', onLoad)
    el.addEventListener('ar-status', onStatus)
    if (el.loaded) onLoad()
    return () => {
      el.removeEventListener('load', onLoad)
      el.removeEventListener('ar-status', onStatus)
    }
  }, [ready, t.failed])

  const heightCm = Math.round((BOTTLE.bodyHeight + BOTTLE.shoulderHeight + BOTTLE.neckHeight + BOTTLE.capHeight + 1.5) / 10)

  const openAR = () => {
    setMsg('')
    const el = mv.current
    // Android: siempre directo al visor AR de Google (Scene Viewer), funciona desde
    // Chrome, Samsung Internet y otros navegadores, y no se "bloquea" al regresar.
    if (isAndroid()) launchSceneViewer()
    else if (isIOS() && document.createElement('a').relList?.supports?.('ar')) launchQuickLook()
    else if (el && el.canActivateAR) el.activateAR()
    else setMsg(mobile ? t.unsupported : t.desktop)
  }

  return (
    <section className="section ar" id="ar" ref={wrap}>
      <div className="ar-grid">
        <Reveal className="ar-copy">
          <span className="kicker">{t.kicker}</span>
          <h2 className="h2">{t.title}</h2>
          <p className="lead">{t.text}</p>
          <button className="btn-primary ar-btn" onClick={openAR}>
            <ARIcon /> {t.cta}
          </button>
          {msg && (
            <p className="ar-msg">
              {msg}
              {msg === t.noViewer && (
                <>
                  {' '}
                  <a href="https://play.google.com/store/apps/details?id=com.google.ar.core" target="_blank" rel="noreferrer">
                    {t.install}
                  </a>
                </>
              )}
            </p>
          )}
          {!mobile && (
            <div className="ar-desk">
              {qr && <img src={qr} alt="QR" width="120" height="120" />}
              <p>{t.desktop}</p>
            </div>
          )}
          {mobile && !canAR && ready && !isAndroid() && <p className="ar-hint">{t.hint}</p>}
        </Reveal>
        <div className="ar-stage">
          <div className="ar-floor" aria-hidden />
          {ready && (
            <model-viewer
              ref={mv}
              src={GLB}
              ios-src={USDZ}
              alt="Margarita Sun"
              ar
              ar-modes="scene-viewer quick-look"
              ar-scale="fixed"
              ar-placement="floor"
              camera-controls=""
              auto-rotate=""
              touch-action="pan-y"
              shadow-intensity="1"
              exposure="1.05"
              environment-image="neutral"
              camera-orbit="15deg 80deg 115%"
              camera-target="auto auto auto"
              interaction-prompt="none"
              lang={lang}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent' }}
            >
              <span slot="ar-button" style={{ display: 'none' }} />
              <div slot="progress-bar" />
            </model-viewer>
          )}
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
