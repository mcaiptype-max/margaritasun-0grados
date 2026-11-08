import { useEffect, useRef } from 'react'

// Frutos rojos (frambuesa, mora azul, arándano y fresa deshidratada)
// que caen con física simple. Se dispara al entrar en pantalla y al tocar.
const KINDS = ['rasp', 'blue', 'cran', 'slice']

function drawBerry(ctx, kind, r) {
  if (kind === 'rasp') {
    const pts = [[0, 0], [-0.5, -0.35], [0.5, -0.35], [-0.5, 0.35], [0.5, 0.35], [0, -0.7], [0, 0.7], [-0.9, 0], [0.9, 0]]
    for (const [x, y] of pts) {
      const g = ctx.createRadialGradient(x * r * 0.6 - r * 0.1, y * r * 0.6 - r * 0.1, 0, x * r * 0.6, y * r * 0.6, r * 0.42)
      g.addColorStop(0, '#ff6b86')
      g.addColorStop(1, '#a3132f')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x * r * 0.6, y * r * 0.6, r * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (kind === 'blue') {
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
    g.addColorStop(0, '#6b7fd1')
    g.addColorStop(1, '#22265e')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#151838'
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(Math.cos(a) * r * 0.22, -r * 0.55 + Math.sin(a) * r * 0.22, r * 0.12, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (kind === 'cran') {
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
    g.addColorStop(0, '#ff5a5a')
    g.addColorStop(1, '#7e0d1f')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(0, 0, r * 0.85, r, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.beginPath()
    ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.18, r * 0.1, -0.6, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // rebanada de fresa deshidratada
    ctx.fillStyle = '#c4243f'
    ctx.beginPath()
    ctx.moveTo(0, r)
    ctx.bezierCurveTo(-r * 1.3, r * 0.1, -r * 0.8, -r * 1.1, 0, -r * 0.7)
    ctx.bezierCurveTo(r * 0.8, -r * 1.1, r * 1.3, r * 0.1, 0, r)
    ctx.fill()
    ctx.fillStyle = '#f2a0a8'
    ctx.beginPath()
    ctx.moveTo(0, r * 0.6)
    ctx.bezierCurveTo(-r * 0.7, 0, -r * 0.4, -r * 0.6, 0, -r * 0.35)
    ctx.bezierCurveTo(r * 0.4, -r * 0.6, r * 0.7, 0, 0, r * 0.6)
    ctx.fill()
    ctx.fillStyle = '#fbe3c4'
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      ctx.beginPath()
      ctx.ellipse(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.55, r * 0.05, r * 0.09, a, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

export default function BerryRain({ targetRef, hint }) {
  const cv = useRef(null)
  useEffect(() => {
    const host = targetRef.current
    const canvas = cv.current
    if (!host || !canvas) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = canvas.getContext('2d')
    let W = 0
    let H = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      W = host.clientWidth
      H = host.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    const parts = []
    const spawn = (x, y, n, spread = 1) => {
      for (let i = 0; i < n; i++)
        parts.push({
          x: x + (Math.random() - 0.5) * 60 * spread,
          y: y - Math.random() * 40,
          vx: (Math.random() - 0.5) * 260 * spread,
          vy: -120 - Math.random() * 280,
          r: 9 + Math.random() * 12,
          a: Math.random() * Math.PI * 2,
          va: (Math.random() - 0.5) * 8,
          k: KINDS[(Math.random() * KINDS.length) | 0],
          life: 0,
        })
      if (parts.length > 220) parts.splice(0, parts.length - 220)
      if (!running) start()
    }

    let raf = 0
    let running = false
    let last = 0
    const tick = (ms) => {
      const dt = Math.min(0.033, (ms - last) / 1000 || 0.016)
      last = ms
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.life += dt
        p.vy += 900 * dt
        p.vx *= 1 - 0.6 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.a += p.va * dt
        if (p.y > H + 40) {
          parts.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.a)
        ctx.shadowColor = 'rgba(80,10,20,0.25)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetY = 4
        drawBerry(ctx, p.k, p.r)
        ctx.restore()
      }
      if (parts.length) raf = requestAnimationFrame(tick)
      else running = false
    }
    const start = () => {
      running = true
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    // lluvia inicial al entrar en pantalla (una vez)
    let fired = false
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !fired && !reduce) {
          fired = true
          const top = Math.max(0, -host.getBoundingClientRect().top) - 20
          for (let k = 0; k < 6; k++) setTimeout(() => spawn(W * (0.1 + Math.random() * 0.8), top, 5, 1.4), k * 160)
        }
      },
      { threshold: 0.25 },
    )
    io.observe(host)

    const onDown = (e) => {
      if (e.target.closest('a,button')) return
      const r = host.getBoundingClientRect()
      spawn(e.clientX - r.left, e.clientY - r.top, reduce ? 4 : 14)
    }
    host.addEventListener('pointerdown', onDown)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointerdown', onDown)
    }
  }, [targetRef])

  return (
    <>
      <canvas ref={cv} className="berry-canvas" aria-hidden />
      {hint && <span className="berry-hint">✦ {hint}</span>}
    </>
  )
}
