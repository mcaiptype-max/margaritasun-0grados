import * as THREE from 'three'
import QRCode from 'qrcode'
import { SITE } from '../content'
import { PACK } from '../bottleSpec'

// Paleta de marca (tomada del producto real)
export const C = {
  cream: '#f6ecd6',
  paper: '#fbfaf6',
  cobalt: '#22378f',
  cobaltDeep: '#1a2a6e',
  navy: '#262f78',
  ochre: '#e0a526',
  berry: '#c8233f',
  sun: '#f27b2b',
  ink: '#2a2340',
}

const SERIF = '"Fraunces", Georgia, serif'
const SANS = '"Zen Kaku Gothic New", system-ui, sans-serif'

// Etiqueta 195 × 80 mm → 2048 × 840 px, envuelve las 4 caras:
// frente ES | lateral info ES | frente JA | lateral info JA
export const LABEL_W = 2048
export const LABEL_H = 840

/* ───────── elementos gráficos reutilizables ───────── */

// Logo "0°" con estrella dentro del cero + "GRADOS"
export function drawLogo(ctx, cx, cy, size, color = C.cobalt, word = true) {
  ctx.save()
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `700 ${size}px ${SERIF}`
  ctx.fillText('0', cx, cy)
  // estrella de 4 puntas
  const sy = cy - size * 0.36
  const r = size * 0.13
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2
    const rr = i % 2 ? r * 0.3 : r
    ctx.lineTo(cx + Math.cos(a) * rr, sy + Math.sin(a) * rr)
  }
  ctx.closePath()
  ctx.fill()
  // símbolo de grado
  ctx.lineWidth = size * 0.055
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.arc(cx + size * 0.42, cy - size * 0.66, size * 0.1, 0, Math.PI * 2)
  ctx.stroke()
  if (word) {
    ctx.font = `500 ${size * 0.2}px ${SANS}`
    const txt = 'G R A D O S'
    ctx.fillText(txt, cx, cy + size * 0.3)
  }
  ctx.restore()
}

// Ornamento floral de Talavera para esquinas
export function drawOrnament(ctx, x, y, s, fx = 1, fy = 1, color = C.cobalt) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(fx * s, fy * s)
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 2.2
  ctx.lineCap = 'round'
  // flor central
  ctx.save()
  ctx.translate(28, 28)
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3)
    ctx.beginPath()
    ctx.ellipse(0, -10, 4.5, 10, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = C.paper
  ctx.beginPath()
  ctx.arc(0, 0, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // hojas y zarcillos
  const leaf = (lx, ly, a, l = 13) => {
    ctx.save()
    ctx.translate(lx, ly)
    ctx.rotate(a)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(l * 0.5, -l * 0.45, l, 0)
    ctx.quadraticCurveTo(l * 0.5, l * 0.45, 0, 0)
    ctx.fill()
    ctx.restore()
  }
  leaf(46, 22, -0.3)
  leaf(22, 46, 1.9)
  leaf(52, 40, 0.6, 10)
  leaf(40, 52, 1.0, 10)
  ctx.beginPath()
  ctx.moveTo(48, 10)
  ctx.bezierCurveTo(62, 4, 70, 14, 62, 20)
  ctx.moveTo(10, 48)
  ctx.bezierCurveTo(4, 62, 14, 70, 20, 62)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(66, 6, 2.6, 0, Math.PI * 2)
  ctx.arc(6, 66, 2.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function sprig(ctx, x, y, s, flip = 1) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(flip * s, s)
  ctx.strokeStyle = C.cobalt
  ctx.fillStyle = C.cobalt
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.moveTo(0, 60)
  ctx.bezierCurveTo(-14, 30, 10, 0, 0, -50)
  ctx.stroke()
  for (const [lx, ly, a] of [[-4, 36, -2.4], [4, 18, -0.6], [-4, 0, -2.6], [5, -20, -0.5], [-2, -40, -2.2]]) {
    ctx.save()
    ctx.translate(lx, ly)
    ctx.rotate(a)
    ctx.beginPath()
    ctx.ellipse(9, 0, 9, 4, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  ctx.save()
  ctx.translate(0, -56)
  for (let i = 0; i < 5; i++) {
    ctx.rotate((Math.PI * 2) / 5)
    ctx.beginPath()
    ctx.ellipse(0, -7, 3.6, 7, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
  ctx.restore()
}

// Ilustración: copa de margarita con frutos rojos, naranja y limón
export function drawCocktail(ctx, cx, cy, s = 1) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(s, s)
  sprig(ctx, -118, 6, 0.9, 1)
  sprig(ctx, 118, 6, 0.9, -1)
  // copa
  const g = ctx.createLinearGradient(0, -70, 0, -10)
  g.addColorStop(0, '#ff5a7a')
  g.addColorStop(1, '#d81d45')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(-62, -64)
  ctx.lineTo(62, -64)
  ctx.quadraticCurveTo(58, -26, 18, -20)
  ctx.quadraticCurveTo(6, -12, 0, -2)
  ctx.quadraticCurveTo(-6, -12, -18, -20)
  ctx.quadraticCurveTo(-58, -26, -62, -64)
  ctx.fill()
  // escarchado del borde
  ctx.fillStyle = '#ffd0da'
  ctx.fillRect(-64, -70, 128, 7)
  ctx.strokeStyle = '#8a8fa8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(0, -2)
  ctx.lineTo(0, 46)
  ctx.moveTo(-26, 50)
  ctx.quadraticCurveTo(0, 42, 26, 50)
  ctx.stroke()
  // rodaja de limón en el borde
  ctx.fillStyle = '#9cc63a'
  ctx.beginPath()
  ctx.arc(58, -74, 20, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e6f2b0'
  ctx.beginPath()
  ctx.arc(58, -74, 15, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#9cc63a'
  ctx.lineWidth = 2
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    ctx.beginPath()
    ctx.moveTo(58, -74)
    ctx.lineTo(58 + Math.cos(a) * 15, -74 + Math.sin(a) * 15)
    ctx.stroke()
  }
  // naranja
  ctx.fillStyle = '#f39a1e'
  ctx.beginPath()
  ctx.arc(58, 28, 24, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffd27a'
  ctx.beginPath()
  ctx.arc(58, 28, 19, 0, Math.PI * 2)
  ctx.fill()
  // hojas de menta
  ctx.fillStyle = '#3f8d3a'
  for (const [x, y, a] of [[-52, 8, -0.8], [-36, 4, -0.2], [20, 10, 0.5]]) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(a)
    ctx.beginPath()
    ctx.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  // fresas
  const straw = (x, y, r, a) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(a)
    ctx.fillStyle = '#d61f36'
    ctx.beginPath()
    ctx.moveTo(0, r * 1.2)
    ctx.bezierCurveTo(-r * 1.3, r * 0.2, -r, -r, 0, -r * 0.8)
    ctx.bezierCurveTo(r, -r, r * 1.3, r * 0.2, 0, r * 1.2)
    ctx.fill()
    ctx.fillStyle = '#ffe28a'
    for (let i = 0; i < 7; i++) ctx.fillRect(-r * 0.5 + (i % 3) * r * 0.45, -r * 0.3 + Math.floor(i / 3) * r * 0.45, 2, 3)
    ctx.fillStyle = '#3f8d3a'
    ctx.fillRect(-r * 0.5, -r * 1.0, r, r * 0.3)
    ctx.restore()
  }
  straw(-40, 34, 17, -0.3)
  straw(-10, 42, 15, 0.2)
  // moras y arándanos
  const berry = (x, y, r, c1, c2) => {
    const gg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r)
    gg.addColorStop(0, c1)
    gg.addColorStop(1, c2)
    ctx.fillStyle = gg
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  berry(18, 40, 12, '#6a4a8a', '#24163a')
  berry(32, 46, 9, '#5a6ad0', '#1b2260')
  berry(-62, 38, 9, '#5a6ad0', '#1b2260')
  berry(8, 52, 8, '#ff6a7e', '#a3132f')
  ctx.restore()
}

function octagon(ctx, x, y, s, label = '2') {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = '#fff'
  ctx.fillRect(-s * 0.62, -s * 0.62, s * 1.24, s * 1.42)
  ctx.strokeStyle = '#111'
  ctx.lineWidth = 2
  ctx.strokeRect(-s * 0.62, -s * 0.62, s * 1.24, s * 1.42)
  ctx.fillStyle = '#111'
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8
    ctx.lineTo(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5)
  }
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.font = `700 ${s * 0.55}px ${SANS}`
  ctx.fillText(label, 0, s * 0.2)
  ctx.fillStyle = '#111'
  ctx.font = `700 ${s * 0.1}px ${SANS}`
  ctx.fillText('SECRETARÍA DE SALUD', 0, s * 0.72)
  ctx.restore()
}

function band(ctx, cx, y, w, text, size = 28) {
  ctx.fillStyle = C.navy
  ctx.fillRect(cx - w / 2, y, w, size * 1.45)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.font = `700 ${size}px ${SERIF}`
  ctx.fillText(text, cx, y + size * 1.08)
}

function corners(ctx, x0, w, h, s = 1.15) {
  drawOrnament(ctx, x0 + 8, 8, s, 1, 1)
  drawOrnament(ctx, x0 + w - 8, 8, s, -1, 1)
  drawOrnament(ctx, x0 + 8, h - 8, s, 1, -1)
  drawOrnament(ctx, x0 + w - 8, h - 8, s, -1, -1)
}

export async function makeLabelCanvas() {
  if (document.fonts) {
    await Promise.all([
      document.fonts.load('700 120px "Fraunces"'),
      document.fonts.load('italic 700 60px "Fraunces"'),
      document.fonts.load('700 40px "Zen Kaku Gothic New"'),
      document.fonts.load('500 30px "Zen Kaku Gothic New"'),
    ]).catch(() => {})
  }
  const cv = document.createElement('canvas')
  cv.width = LABEL_W
  cv.height = LABEL_H
  const ctx = cv.getContext('2d')
  const P = LABEL_W / 4
  const H = LABEL_H
  ctx.fillStyle = C.paper
  ctx.fillRect(0, 0, LABEL_W, H)
  for (let i = 0; i < 4; i++) corners(ctx, P * i, P, H)
  const mid = (i) => P * i + P / 2
  const m = PACK.marks

  // ── 1 · FRENTE ESPAÑOL ──
  let x = mid(0)
  octagon(ctx, P - 92, 92, 92)
  drawLogo(ctx, x, 235, 104)
  ctx.fillStyle = C.cobaltDeep
  ctx.textAlign = 'center'
  ctx.font = `italic 700 54px ${SERIF}`
  ctx.fillText('Margarita Sun', x, 345)
  drawCocktail(ctx, x, 470, 1.05)
  band(ctx, x, 560, 420, 'BEBIDA SIN ALCOHOL', 30)
  ctx.fillStyle = C.ink
  ctx.font = `500 22px ${SANS}`
  ctx.fillText('de jugos de naranja, frutos rojos y limón', x, 638)
  ctx.font = `700 21px ${SANS}`
  ctx.fillText('P A S T E U R I Z A D O', x, 672)
  ctx.textAlign = 'left'
  ctx.font = `700 19px ${SANS}`
  ctx.fillText('CONTENIDO NETO', x - 160, 768)
  ctx.font = `700 34px ${SANS}`
  ctx.fillText('250 mL', x + 30, 772)

  // ── 2 · LATERAL ESPAÑOL (información) ──
  x = P + 70
  ctx.fillStyle = C.cobaltDeep
  ctx.textAlign = 'left'
  ctx.font = `700 26px ${SANS}`
  ctx.fillText('INFORMACIÓN', x, 150)
  ctx.fillStyle = C.ink
  ctx.font = `500 20px ${SANS}`
  ;[
    'Bebida sin alcohol de jugos',
    'de naranja, frutos rojos y',
    'limón. Pasteurizada.',
    '',
    'Consérvese en refrigeración',
    'entre 0 y 10 °C.',
    'Agítese antes de servir.',
    '',
    `Lote: ${m.lot}`,
    `Consumir antes de: ${m.bestBefore}`,
    '',
    'Hecho en México por',
    'Cero Grados Bebidas,',
    'S.A. de C.V. · Puebla, Pue.',
  ].forEach((l, i) => ctx.fillText(l, x, 190 + i * 29))
  try {
    const q = document.createElement('canvas')
    await QRCode.toCanvas(q, SITE.url, { width: 132, margin: 1, color: { dark: C.cobaltDeep, light: C.paper } })
    ctx.drawImage(q, x, 615)
  } catch {}
  ctx.font = `700 18px ${SANS}`
  ctx.fillText('Escanéame', x + 150, 660)
  ctx.font = `500 16px ${SANS}`
  ctx.fillText('スキャンしてね', x + 150, 688)

  // ── 3 · FRENTE JAPONÉS ──
  x = mid(2)
  drawLogo(ctx, x, 195, 104)
  ctx.fillStyle = C.cobaltDeep
  ctx.textAlign = 'center'
  ctx.font = `500 22px ${SANS}`
  ctx.fillText('ゼロ・グラドス', x, 262)
  ctx.fillStyle = C.ink
  ctx.font = `700 52px ${SANS}`
  ctx.fillText('マルガリータ', x, 335)
  ctx.fillText('サン', x, 395)
  drawCocktail(ctx, x, 510, 1.0)
  band(ctx, x, 596, 420, 'ノンアルコール', 28)
  ctx.fillStyle = C.ink
  ctx.font = `500 22px ${SANS}`
  ctx.fillText('オレンジ・ベリー・ライムの', x, 668)
  ctx.fillText('果汁入り飲料', x, 698)
  ctx.font = `700 19px ${SANS}`
  ctx.fillText('内容量', x - 60, 770)
  ctx.font = `700 34px ${SANS}`
  ctx.fillText('250ml', x + 40, 772)

  // ── 4 · LATERAL JAPONÉS ──
  x = P * 3 + 70
  ctx.textAlign = 'left'
  ctx.fillStyle = C.cobaltDeep
  ctx.font = `700 26px ${SANS}`
  ctx.fillText('一括表示', x, 150)
  ctx.fillStyle = C.ink
  ctx.font = `500 20px ${SANS}`
  ;[
    '名称：清涼飲料水',
    '　　（ノンアルコール）',
    '原材料：オレンジ果汁、',
    '　　ベリー果汁、ライム果汁',
    '内容量：250ml',
    `賞味期限：${m.bestBefore}`,
    '保存方法：要冷蔵（0〜10℃）',
    '原産国名：メキシコ',
    '製造者：Cero Grados Bebidas',
    '　　Puebla, México',
    '',
    '開栓後はお早めに',
    'お召し上がりください。',
  ].forEach((l, i) => ctx.fillText(l, x, 190 + i * 31))
  // marca de reciclaje びん
  ctx.strokeStyle = C.ink
  ctx.lineWidth = 3
  ctx.strokeRect(x, 620, 74, 74)
  ctx.font = `700 26px ${SANS}`
  ctx.fillText('びん', x + 10, 667)
  ctx.font = `500 16px ${SANS}`
  ctx.fillText('キャップ：金属', x + 92, 650)
  ctx.fillText('ラベル：紙', x + 92, 678)
  return cv
}

// Etiqueta colgante de papel kraft ("0° GRADOS")
function drawTag(ctx) {
  ctx.fillStyle = '#cdb78f'
  ctx.fillRect(0, 0, 460, 330)
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,245,220' : '90,60,30'},${Math.random() * 0.12})`
    ctx.fillRect(Math.random() * 460, Math.random() * 330, 2, 2)
  }
  ctx.fillStyle = '#8a7350'
  ctx.beginPath()
  ctx.arc(50, 50, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.translate(250, 185)
  ctx.rotate(-0.12)
  ctx.fillStyle = C.cobalt
  ctx.font = `700 50px ${SERIF}`
  ctx.textAlign = 'center'
  ctx.fillText('GRADOS', -70, 20)
  drawLogo(ctx, 105, 40, 110, C.cobalt, false)
  ctx.restore()
}
let tagTex = null
export function tagTexture() {
  if (tagTex) return tagTex
  const cv = document.createElement('canvas')
  cv.width = 460
  cv.height = 330
  const ctx = cv.getContext('2d')
  drawTag(ctx)
  tagTex = new THREE.CanvasTexture(cv)
  tagTex.colorSpace = THREE.SRGBColorSpace
  // redibujar cuando terminen de cargar las fuentes
  document.fonts?.load(`700 50px "Fraunces"`).then(() => {
    drawTag(ctx)
    tagTex.needsUpdate = true
  })
  return tagTex
}

// Azulejo de Talavera (fondos del Estudio y detalles)
export function drawTile(ctx, x, y, s) {
  ctx.save()
  ctx.translate(x + s / 2, y + s / 2)
  ctx.fillStyle = C.cream
  ctx.fillRect(-s / 2, -s / 2, s, s)
  ctx.fillStyle = C.cobalt
  for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    ctx.beginPath()
    ctx.arc((cx * s) / 2, (cy * s) / 2, s * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 8; i++) {
    ctx.save()
    ctx.rotate((i * Math.PI) / 4)
    ctx.fillStyle = i % 2 ? C.cobaltDeep : C.cobalt
    ctx.beginPath()
    ctx.ellipse(0, -s * 0.2, s * 0.07, s * 0.17, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  ctx.fillStyle = C.ochre
  ctx.beginPath()
  ctx.arc(0, 0, s * 0.09, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
