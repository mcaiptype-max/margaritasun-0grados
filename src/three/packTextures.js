import * as THREE from 'three'
import QRCode from 'qrcode'
import { C, drawLogo, drawOrnament } from './labelTexture'
import { PACK } from '../bottleSpec'
import { SITE } from '../content'

const SANS = '"Zen Kaku Gothic New", system-ui, sans-serif'
const SERIF = '"Fraunces", Georgia, serif'
const BLUE = '#24409a'

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}
function toTex(c, repeat) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat[0], repeat[1])
  }
  return t
}

// ── Cartón corrugado kraft ─────────────────────────────────
function kraftBase(ctx, w, h, tone = '#b98d5c') {
  ctx.fillStyle = tone
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < (w * h) / 60; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,235,200,${Math.random() * 0.07})` : `rgba(70,40,15,${Math.random() * 0.07})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1)
  }
  for (let x = 0; x < w; x += 9) {
    ctx.fillStyle = 'rgba(80,50,20,0.03)'
    ctx.fillRect(x, 0, 3, h)
  }
}
export function kraftTexture(tone) {
  const [c, ctx] = canvas(512, 512)
  kraftBase(ctx, 512, 512, tone)
  return toTex(c, [2, 2])
}

// ── Pictogramas de manejo (ISO 780) en azul ─────────────────
function sym(ctx, kind, x, y, s) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = BLUE
  ctx.strokeStyle = BLUE
  ctx.lineWidth = s * 0.06
  ctx.lineCap = 'round'
  if (kind === 'up') {
    for (const dx of [-0.2, 0.2]) {
      ctx.beginPath()
      ctx.moveTo(s * dx, -s * 0.42)
      ctx.lineTo(s * (dx + 0.15), -s * 0.18)
      ctx.lineTo(s * (dx - 0.15), -s * 0.18)
      ctx.closePath()
      ctx.fill()
      ctx.fillRect(s * dx - s * 0.03, -s * 0.2, s * 0.06, s * 0.5)
    }
    ctx.fillRect(-s * 0.42, s * 0.36, s * 0.84, s * 0.07)
  } else if (kind === 'glass') {
    ctx.beginPath()
    ctx.moveTo(-s * 0.2, -s * 0.42)
    ctx.lineTo(s * 0.2, -s * 0.42)
    ctx.quadraticCurveTo(s * 0.2, -s * 0.02, 0, 0)
    ctx.quadraticCurveTo(-s * 0.2, -s * 0.02, -s * 0.2, -s * 0.42)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, s * 0.36)
    ctx.moveTo(-s * 0.16, s * 0.4)
    ctx.lineTo(s * 0.16, s * 0.4)
    ctx.stroke()
  } else if (kind === 'dry') {
    ctx.beginPath()
    ctx.arc(0, 0, s * 0.36, Math.PI, 0)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, s * 0.34)
    ctx.arc(-s * 0.07, s * 0.34, s * 0.07, 0, Math.PI)
    ctx.stroke()
    for (const dx of [-0.3, -0.1, 0.1, 0.3]) {
      ctx.beginPath()
      ctx.moveTo(s * dx, -s * 0.62)
      ctx.lineTo(s * dx - s * 0.04, -s * 0.48)
      ctx.stroke()
    }
  } else if (kind === 'temp') {
    ctx.lineWidth = s * 0.05
    ctx.strokeRect(-s * 0.05, -s * 0.42, s * 0.1, s * 0.62)
    ctx.beginPath()
    ctx.arc(0, s * 0.3, s * 0.12, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(-s * 0.03, -s * 0.1, s * 0.06, s * 0.36)
    ctx.font = `700 ${s * 0.15}px ${SANS}`
    ctx.textAlign = 'right'
    ctx.fillText('10°C', -s * 0.12, -s * 0.32)
    ctx.textAlign = 'left'
    ctx.fillText('0°C', s * 0.12, s * 0.05)
  } else if (kind === 'stack') {
    ctx.lineWidth = s * 0.05
    ctx.strokeRect(-s * 0.3, -s * 0.42, s * 0.6, s * 0.36)
    ctx.beginPath()
    ctx.moveTo(-s * 0.3, -s * 0.42)
    ctx.lineTo(s * 0.3, -s * 0.06)
    ctx.moveTo(s * 0.3, -s * 0.42)
    ctx.lineTo(-s * 0.3, -s * 0.06)
    ctx.stroke()
    ctx.strokeRect(-s * 0.3, 0, s * 0.6, s * 0.4)
    ctx.font = `700 ${s * 0.3}px ${SANS}`
    ctx.textAlign = 'center'
    ctx.fillText(String(PACK.maxStack), 0, s * 0.31)
  }
  ctx.restore()
}
function symbolRow(ctx, x0, x1, y, s) {
  const kinds = ['up', 'glass', 'dry', 'temp', 'stack']
  kinds.forEach((k, i) => sym(ctx, k, x0 + ((x1 - x0) * i) / (kinds.length - 1), y, s))
}

// Banda blanca inferior con Talavera y logo
function brandBand(ctx, w, h, y, variant) {
  const bh = h - y
  ctx.fillStyle = '#f7f5ef'
  ctx.fillRect(0, y, w, bh)
  ctx.fillStyle = '#2a49a8'
  ctx.fillRect(0, h - bh * 0.1, w, bh * 0.1)
  const os = bh / 120
  drawOrnament(ctx, 14, y + 10, os, 1, 1, BLUE)
  drawOrnament(ctx, w - 14, y + 10, os, -1, 1, BLUE)
  drawOrnament(ctx, 14, h - bh * 0.1 - 10, os, 1, -1, BLUE)
  drawOrnament(ctx, w - 14, h - bh * 0.1 - 10, os, -1, -1, BLUE)
  ctx.fillStyle = BLUE
  if (variant === 'marks') {
    drawLogo(ctx, w * 0.17, y + bh * 0.6, bh * 0.42, BLUE)
    ctx.fillRect(w * 0.29, y + bh * 0.18, 3, bh * 0.6)
    ctx.textAlign = 'center'
    ctx.font = `italic 700 ${bh * 0.2}px ${SERIF}`
    ctx.fillText('Margarita Sun', w * 0.62, y + bh * 0.32)
    ctx.fillRect(w * 0.37, y + bh * 0.46, w * 0.5, bh * 0.2)
    ctx.fillStyle = '#fff'
    ctx.font = `700 ${bh * 0.12}px ${SANS}`
    ctx.fillText('BEBIDA SIN ALCOHOL · ノンアルコール', w * 0.62, y + bh * 0.6)
  } else {
    ctx.textAlign = 'left'
    ctx.font = `italic 700 ${bh * 0.2}px ${SERIF}`
    ctx.fillText('Margarita Sun', w * 0.09, y + bh * 0.42)
    ctx.font = `500 ${bh * 0.09}px ${SANS}`
    ctx.fillStyle = '#333'
    ctx.fillText(`Bebida sin alcohol · ノンアルコール · ${PACK.marks.contents}`, w * 0.09, y + bh * 0.66)
    if (variant === 'info-qr') {
      ctx.strokeStyle = '#555'
      ctx.lineWidth = 2
      ctx.strokeRect(w * 0.64, y + bh * 0.2, w * 0.24, bh * 0.52)
      ctx.font = `500 ${bh * 0.06}px ${SANS}`
      ctx.textAlign = 'center'
      ctx.fillText('código de barras', w * 0.76, y + bh * 0.68)
    } else {
      drawLogo(ctx, w * 0.8, y + bh * 0.55, bh * 0.36, BLUE)
    }
  }
}

function paperPanel(ctx, w, h, yEnd) {
  ctx.fillStyle = 'rgba(236,214,166,0.75)'
  ctx.fillRect(w * 0.04, h * 0.05, w * 0.92, yEnd - h * 0.05)
}

function infoLines(ctx, x, y, size, maxW) {
  const m = PACK.marks
  const rows = [
    [m.product, 700, BLUE],
    [m.productJa, 500, '#222'],
    [`${m.contents} · N.W. ${m.netWeight} · G.W. ${m.grossWeight}`, 500, '#222'],
    [`DIM. ${PACK.box.l} × ${PACK.box.w} × ${PACK.box.h} CM`, 500, '#222'],
    [`BB / 賞味期限: ${m.bestBefore} · LOT ${m.lot}`, 500, '#222'],
    ['PRODUCT OF MEXICO · メキシコ産', 700, BLUE],
    [m.company, 500, '#222'],
    [m.temp, 700, BLUE],
    ['FRAGILE · 割れ物注意 · THIS SIDE UP · 天地無用', 500, '#222'],
  ]
  ctx.textAlign = 'left'
  rows.forEach(([t, wgt, col], i) => {
    ctx.fillStyle = col
    ctx.font = `${wgt} ${size}px ${SANS}`
    ctx.fillText(t, x, y + i * size * 1.42, maxW)
  })
}

/** Caras de la caja (texturas). cn = número de caja (C/N). */
export async function boxTextures(cn = 1, total = PACK.boxesOnPallet) {
  const W = 1400
  const H = 1000
  const bandY = H * 0.71
  // Cara con marcas de embarque (larga)
  const [c1, a] = canvas(W, H)
  kraftBase(a, W, H)
  paperPanel(a, W, H, bandY)
  symbolRow(a, W * 0.1, W * 0.88, H * 0.15, 90)
  a.strokeStyle = BLUE
  a.lineWidth = 3
  a.strokeRect(W * 0.08, H * 0.27, W * 0.84, H * 0.4)
  a.fillStyle = BLUE
  a.textAlign = 'center'
  a.font = `700 52px ${SANS}`
  ;[...PACK.marks.shipping, `C/N ${cn}/${total}`].forEach((t, i) => a.fillText(t, W / 2, H * 0.34 + i * 62))
  brandBand(a, W, H, bandY, 'marks')

  // Cara de información con QR (larga)
  const [c2, b] = canvas(W, H)
  kraftBase(b, W, H)
  paperPanel(b, W, H, bandY)
  symbolRow(b, W * 0.1, W * 0.88, H * 0.15, 90)
  b.strokeStyle = BLUE
  b.lineWidth = 3
  b.strokeRect(W * 0.08, H * 0.27, W * 0.84, H * 0.4)
  infoLines(b, W * 0.11, H * 0.33, 25, W * 0.5)
  try {
    const q = document.createElement('canvas')
    await QRCode.toCanvas(q, SITE.url, { width: 240, margin: 2, color: { dark: BLUE, light: '#ffffff' } })
    b.fillStyle = '#fff'
    b.fillRect(W * 0.66, H * 0.29, 260, 260)
    b.drawImage(q, W * 0.66 + 10, H * 0.29 + 10)
    b.fillStyle = BLUE
    b.textAlign = 'center'
    b.font = `700 22px ${SANS}`
    b.fillText('Escanéame · スキャンしてね', W * 0.66 + 130, H * 0.6)
    b.font = `500 16px ${SANS}`
    b.fillStyle = '#333'
    b.fillText(SITE.url.replace('https://', ''), W * 0.66 + 130, H * 0.63)
  } catch {}
  brandBand(b, W, H, bandY, 'info-qr')

  // Cara corta (25 × 25)
  const S = 1000
  const [c3, d] = canvas(S, S)
  kraftBase(d, S, S)
  paperPanel(d, S, S, S * 0.71)
  symbolRow(d, S * 0.12, S * 0.88, S * 0.15, 70)
  d.strokeStyle = BLUE
  d.lineWidth = 3
  d.strokeRect(S * 0.08, S * 0.27, S * 0.84, S * 0.4)
  infoLines(d, S * 0.11, S * 0.33, 19, S * 0.78)
  brandBand(d, S, S, S * 0.71, 'info')

  return { marks: toTex(c1), info: toTex(c2), short: toTex(c3) }
}

/** Tapa superior cerrada: solapas, cinta y calcomanía. */
export function topTexture() {
  const W = 1400
  const H = 1000
  const [c, t] = canvas(W, H)
  kraftBase(t, W, H)
  // unión de solapas
  t.fillStyle = 'rgba(60,35,15,0.55)'
  t.fillRect(0, H / 2 - 3, W, 6)
  // cinta transparente
  t.fillStyle = 'rgba(255,250,235,0.35)'
  t.fillRect(0, H / 2 - 70, W, 140)
  t.fillStyle = 'rgba(255,255,255,0.25)'
  t.fillRect(0, H / 2 - 70, W, 8)
  drawSticker(t, W * 0.5, H * 0.24, 380)
  return toTex(c)
}

export function drawSticker(ctx, cx, cy, s) {
  ctx.save()
  ctx.fillStyle = '#ecd28a'
  ctx.fillRect(cx - s / 2, cy - s * 0.32, s, s * 0.64)
  drawLogo(ctx, cx, cy + s * 0.12, s * 0.42, BLUE)
  ctx.restore()
}
export function stickerTexture() {
  const [c, ctx] = canvas(512, 330)
  ctx.fillStyle = '#ecd28a'
  ctx.fillRect(0, 0, 512, 330)
  drawLogo(ctx, 256, 200, 190, BLUE)
  return toTex(c)
}

export function woodTexture(stamp = false) {
  const [c, ctx] = canvas(512, 512)
  ctx.fillStyle = '#c9a473'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 70; i++) {
    const y = Math.random() * 512
    ctx.strokeStyle = `rgba(110,70,30,${0.08 + Math.random() * 0.15})`
    ctx.lineWidth = 1 + Math.random() * 3
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x <= 512; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 6)
    ctx.stroke()
  }
  if (stamp) {
    // sello NIMF 15 / ISPM 15 ilustrativo
    ctx.strokeStyle = '#2a1d14'
    ctx.lineWidth = 8
    ctx.strokeRect(70, 150, 372, 212)
    ctx.beginPath()
    ctx.moveTo(190, 150)
    ctx.lineTo(190, 362)
    ctx.stroke()
    ctx.fillStyle = '#2a1d14'
    ctx.font = `700 46px ${SANS}`
    ctx.textAlign = 'center'
    ctx.fillText('IPPC', 130, 270)
    ctx.textAlign = 'left'
    ctx.font = `700 52px ${SANS}`
    ctx.fillText('MX-000', 215, 235)
    ctx.fillText('HT', 215, 310)
  }
  return toTex(c)
}

export function filmTexture() {
  const [c, ctx] = canvas(512, 512)
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = -512; i < 1024; i += 64) {
    const g = ctx.createLinearGradient(i, 0, i + 120, 512)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.5, 'rgba(255,255,255,1)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.strokeStyle = g
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + 180, 512)
    ctx.stroke()
  }
  return toTex(c, [3, 2])
}
