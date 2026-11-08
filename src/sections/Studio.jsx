import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import BottleStage from '../three/BottleStage'
import { C, drawTile } from '../three/labelTexture'
import { SITE } from '../content'
import { exportGLB, exportUSDZ, saveBlob } from '../three/exportModel'

const FORMATS = {
  post: { label: '1:1', w: 1080, h: 1080 },
  story: { label: '9:16', w: 1080, h: 1920 },
  wide: { label: '16:9', w: 1920, h: 1080 },
}

// Cómo se pinta cada fondo en el archivo descargado
function paintBg(ctx, key, w, h) {
  if (key === 'sunrise') {
    const g = ctx.createLinearGradient(0, h, 0, 0)
    g.addColorStop(0, '#ffcf73')
    g.addColorStop(0.35, '#f27b2b')
    g.addColorStop(0.7, '#c8233f')
    g.addColorStop(1, '#2a1450')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    const r = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.6)
    r.addColorStop(0, 'rgba(255,220,150,0.7)')
    r.addColorStop(1, 'rgba(255,220,150,0)')
    ctx.fillStyle = r
    ctx.fillRect(0, 0, w, h)
  } else if (key === 'talavera') {
    const s = Math.round(Math.min(w, h) / 6)
    for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) drawTile(ctx, x, y, s)
    ctx.fillStyle = 'rgba(246,236,214,0.35)'
    ctx.fillRect(0, 0, w, h)
  } else if (key === 'night') {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#0b1230')
    g.addColorStop(1, '#3a1240')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = `rgba(255,240,220,${Math.random() * 0.8})`
      ctx.beginPath()
      ctx.arc(Math.random() * w, Math.random() * h * 0.75, Math.random() * 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = 'rgba(242,123,43,0.9)'
    ctx.beginPath()
    ctx.arc(w * 0.78, h * 0.18, Math.min(w, h) * 0.07, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = C.cream
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = C.sun
    ctx.beginPath()
    ctx.arc(w / 2, h * 0.5, Math.min(w, h) * 0.32, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function Studio({ t, lang, onClose }) {
  const [bg, setBg] = useState('sunrise')
  const [fmt, setFmt] = useState('post')
  const [showText, setShowText] = useState(true)
  const [rot, setRot] = useState(0.4)
  const [busy, setBusy] = useState(false)
  const glRef = useRef(null)
  const r3f = useRef(null)
  const F = FORMATS[fmt]
  const dark = bg !== 'cream' && bg !== 'talavera'

  const download = async () => {
    setBusy(true)
    try {
      const out = document.createElement('canvas')
      out.width = F.w
      out.height = F.h
      const ctx = out.getContext('2d')
      paintBg(ctx, bg, F.w, F.h)
      // Render de la botella en alta resolución (tamaño final del archivo)
      const st = r3f.current
      if (st) {
        const { gl, scene, camera, size } = st
        const prevDpr = gl.getPixelRatio()
        gl.setPixelRatio(1)
        gl.setSize(F.w, F.h, false)
        camera.aspect = F.w / F.h
        camera.updateProjectionMatrix()
        gl.render(scene, camera)
        ctx.drawImage(gl.domElement, 0, 0, F.w, F.h)
        gl.setPixelRatio(prevDpr)
        gl.setSize(size.width, size.height, false)
        camera.aspect = size.width / size.height
        camera.updateProjectionMatrix()
      } else if (glRef.current) {
        ctx.drawImage(glRef.current, 0, 0, F.w, F.h)
      }
      if (showText) {
        const u = Math.min(F.w, F.h) / 1080
        ctx.textAlign = 'center'
        ctx.fillStyle = dark ? '#fff7ea' : C.cobaltDeep
        ctx.font = `italic 400 ${54 * u}px "Fraunces", serif`
        ctx.fillText('Margarita', F.w / 2, 120 * u)
        ctx.font = `700 ${120 * u}px "Fraunces", serif`
        ctx.fillText('Sun', F.w / 2, 235 * u)
        ctx.font = `500 ${34 * u}px "Zen Kaku Gothic New", sans-serif`
        ctx.fillText(t.tagline, F.w / 2, F.h - 110 * u)
        ctx.font = `500 ${24 * u}px "Zen Kaku Gothic New", sans-serif`
        ctx.globalAlpha = 0.8
        ctx.fillText(`${SITE.company} · ${SITE.url.replace('https://', '')}`, F.w / 2, F.h - 60 * u)
        ctx.globalAlpha = 1
      }
      const url = out.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `margarita-sun-${bg}-${F.label.replace(':', 'x')}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      className="studio"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="studio-bar">
        <button className="chip" onClick={onClose}>
          {t.back}
        </button>
        <strong className="studio-title">{t.title}</strong>
        <span />
      </header>

      <div className="studio-body">
        <div className="studio-frame-wrap">
          <div className={`studio-frame bg-${bg}`} style={{ aspectRatio: `${F.w} / ${F.h}`, width: `min(100%, calc(var(--avail) * ${F.w / F.h}))` }}>
            <BottleStage mode="studio" canvasRef={glRef} stateRef={r3f} studioRotation={rot} className="studio-canvas" />
            {showText && (
              <div className={`studio-text ${dark ? 'on-dark' : ''}`} lang={lang}>
                <div className="st-top">
                  <em>Margarita</em>
                  <b>Sun</b>
                </div>
                <div className="st-bottom">
                  <span>{t.tagline}</span>
                  <small>
                    {SITE.company} · {SITE.url.replace('https://', '')}
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="studio-panel">
          <label className="ctl-label">{t.bg}</label>
          <div className="ctl-row">
            {Object.entries(t.bgs).map(([k, v]) => (
              <button key={k} className={`swatch sw-${k} ${bg === k ? 'on' : ''}`} onClick={() => setBg(k)}>
                <i />
                {v}
              </button>
            ))}
          </div>

          <label className="ctl-label">{t.format}</label>
          <div className="ctl-row">
            {Object.entries(FORMATS).map(([k, f]) => (
              <button key={k} className={`chip ${fmt === k ? 'on' : ''}`} onClick={() => setFmt(k)}>
                {f.label}
              </button>
            ))}
            <button className={`chip ${showText ? 'on' : ''}`} onClick={() => setShowText((s) => !s)}>
              {t.text_on}
            </button>
          </div>

          <label className="ctl-label">↻</label>
          <input
            type="range"
            min={-3.14}
            max={3.14}
            step={0.01}
            value={rot}
            onChange={(e) => setRot(parseFloat(e.target.value))}
            className="range"
          />

          <button className="btn-primary" onClick={download} disabled={busy}>
            {t.download}
          </button>
          <div className="ctl-row model-row">
            <button className="chip" onClick={async () => saveBlob(await exportGLB(), 'margarita-sun.glb')}>
              3D .glb
            </button>
            <button className="chip" onClick={async () => saveBlob(await exportUSDZ(), 'margarita-sun.usdz')}>
              3D .usdz
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  )
}
