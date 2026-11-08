import * as THREE from 'three'
import { BOTTLE } from '../bottleSpec'
import { tagTexture } from './labelTexture'

// Unidad de la escena: 1 = 10 cm (1 decímetro). mm → u
export const MM = 1 / 100
const SEG = 128
const sgnPow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p)
const ease = (t) => t * t * (3 - 2 * t)

// Sección transversal = superelipse (n alto ≈ cuadrado, n = 2 círculo)
export function superPoint(theta, a, n) {
  return [a * sgnPow(Math.cos(theta), 2 / n), a * sgnPow(Math.sin(theta), 2 / n)]
}

function surfaceFromRings(rings, closeBottom = true) {
  const pos = []
  const idx = []
  rings.forEach(({ y, a, n }) => {
    for (let i = 0; i <= SEG; i++) {
      const [x, z] = superPoint((i / SEG) * Math.PI * 2, a, n)
      pos.push(x, y, z)
    }
  })
  const row = SEG + 1
  for (let r = 0; r < rings.length - 1; r++)
    for (let i = 0; i < SEG; i++) {
      const a = r * row + i
      idx.push(a, a + row, a + 1, a + 1, a + row, a + row + 1)
    }
  if (closeBottom) {
    const c = pos.length / 3
    pos.push(0, rings[0].y, 0)
    for (let i = 0; i < SEG; i++) idx.push(c, i, i + 1)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

export function dims(spec = BOTTLE) {
  const A = (spec.bodyWidth / 2) * MM
  const N = spec.cornerRoundness
  const bodyTop = spec.bodyHeight * MM
  const shoulderTop = bodyTop + spec.shoulderHeight * MM
  const neckR = (spec.neckDiameter / 2) * MM
  const neckTop = shoulderTop + spec.neckHeight * MM // aquí está el anillo (bead)
  const lipR = (spec.lipDiameter / 2) * MM
  const capH = spec.capHeight * MM
  const lipTop = neckTop + capH - 3 * MM // rosca cubierta por la tapa
  const capR = (spec.capDiameter / 2) * MM
  const capBottom = neckTop + 1.5 * MM
  const total = capBottom + capH
  return { A, N, bodyTop, shoulderTop, neckR, neckTop, lipR, lipTop, capR, capH, capBottom, total }
}

function rings(d, scale = 1, top = Infinity, bottom = 0) {
  const out = []
  const push = (y, a, n) => {
    if (y >= bottom - 1e-6 && y <= top + 1e-6) out.push({ y, a: a * scale, n })
  }
  for (let i = 0; i <= 6; i++) {
    const t = i / 6
    push(bottom + 0.05 * t, d.A * (0.86 + 0.14 * Math.sin((t * Math.PI) / 2)), d.N)
  }
  push(d.bodyTop, d.A, d.N)
  const sh = d.shoulderTop - d.bodyTop
  for (let i = 1; i <= 18; i++) {
    const t = i / 18
    push(d.bodyTop + sh * t, THREE.MathUtils.lerp(d.A, d.neckR, ease(t)), THREE.MathUtils.lerp(d.N, 2, ease(Math.min(1, t * 1.3))))
  }
  push(d.neckTop - 3 * MM, d.neckR, 2)
  push(d.neckTop - 2 * MM, d.neckR + 1.4 * MM, 2) // anillo bajo la tapa
  push(d.neckTop, d.neckR + 1.4 * MM, 2)
  push(d.neckTop + 0.8 * MM, d.lipR, 2)
  push(d.lipTop, d.lipR, 2)
  if (top < Infinity && out[out.length - 1].y < top - 1e-6) out.push({ ...out[out.length - 1], y: top })
  return out
}

// Banda de etiqueta: u = longitud de arco desde la esquina frontal izquierda.
function labelGeometry(a, n, y0, y1) {
  const N = 256
  const pts = []
  for (let i = 0; i <= N; i++) pts.push(superPoint((3 * Math.PI) / 4 - (i / N) * Math.PI * 2, a, n))
  const len = [0]
  for (let i = 1; i <= N; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const pos = []
  const uv = []
  const idx = []
  for (let i = 0; i <= N; i++) {
    const [x, z] = pts[i]
    const u = len[i] / len[N]
    pos.push(x, y0, z, x, y1, z)
    uv.push(u, 0, u, 1)
  }
  for (let i = 0; i < N; i++) {
    const a0 = i * 2
    idx.push(a0, a0 + 2, a0 + 1, a0 + 1, a0 + 2, a0 + 3)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

// Tapa con estrías (knurl) en una sola geometría
function capGeometry(r, h) {
  const g = new THREE.CylinderGeometry(r, r, h, 96, 1)
  const p = g.attributes.position
  const n = g.attributes.normal
  for (let i = 0; i < p.count; i++) {
    if (Math.abs(n.getY(i)) > 0.5) continue
    const x = p.getX(i)
    const z = p.getZ(i)
    const ang = Math.atan2(z, x)
    const k = 1 + 0.025 * Math.sign(Math.sin(ang * 48))
    p.setXYZ(i, x * k, p.getY(i), z * k)
  }
  g.computeVertexNormals()
  g.translate(0, h / 2, 0)
  return g
}

// Etiqueta colgante de papel kraft con cordón de yute
export function getTagGeometries(spec = BOTTLE) {
  const d = dims(spec)
  const y = d.shoulderTop + 7 * MM
  const ringR = d.neckR + 0.9 * MM
  const twine = new THREE.TorusGeometry(ringR, 0.9 * MM, 6, 48).rotateX(Math.PI / 2).translate(0, y, 0)
  // dirección hacia la esquina frontal derecha
  const ang = -Math.PI / 4
  const dir = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang)).normalize()
  const knot = dir.clone().multiplyScalar(ringR).setY(y)
  const tagW = 46 * MM
  const tagH = 33 * MM
  const hole = knot.clone().add(dir.clone().multiplyScalar(9 * MM)).add(new THREE.Vector3(0, -6 * MM, 0))
  const string = new THREE.CylinderGeometry(0.6 * MM, 0.6 * MM, 1, 6)
  const sv = hole.clone().sub(knot)
  const sm = new THREE.Matrix4().compose(
    knot.clone().add(hole).multiplyScalar(0.5),
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), sv.clone().normalize()),
    new THREE.Vector3(1, sv.length(), 1),
  )
  string.applyMatrix4(sm)
  // tarjeta: cuelga del agujero (esquina superior), inclinada como en las fotos
  const tag = new THREE.PlaneGeometry(tagW, tagH)
  tag.translate(tagW / 2 - 5 * MM, -tagH / 2 + 5 * MM, 0)
  tag.rotateZ(-0.62)
  tag.rotateY(ang + Math.PI / 2 - 0.35)
  tag.translate(hole.x, hole.y, hole.z)
  return { twine, string, tag }
}

const cache = new Map()
/** Geometrías de la botella (con base en y = 0). */
export function getBottleGeometries(spec = BOTTLE) {
  const key = JSON.stringify(spec)
  if (cache.has(key)) return cache.get(key)
  const d = dims(spec)
  const fill = Math.min(spec.fillLevel * MM, d.shoulderTop + (d.neckTop - d.shoulderTop) * 0.5)
  const liquidRings = rings(d, 0.93, fill, 0.03)
  const topRing = liquidRings[liquidRings.length - 1]
  const g = {
    d,
    glass: surfaceFromRings(rings(d)),
    liquid: surfaceFromRings(liquidRings),
    liquidTop: new THREE.CircleGeometry(topRing.a * 0.98, 48).rotateX(-Math.PI / 2).translate(0, fill, 0),
    label: labelGeometry(d.A + 0.003, d.N, spec.labelBottom * MM, (spec.labelBottom + spec.labelHeight) * MM),
    cap: capGeometry(d.capR, d.capH).translate(0, d.capBottom, 0),
    capTop: new THREE.RingGeometry(d.capR * 0.86, d.capR * 0.995, 64).rotateX(-Math.PI / 2).translate(0, d.capBottom + d.capH + 0.001, 0),
    ...(spec.hangTag ? { tag: getTagGeometries(spec) } : {}),
  }
  cache.set(key, g)
  return g
}

export function makeBottleMaterials(spec = BOTTLE, label = null, { lite = false } = {}) {
  return {
    liquid: lite
      ? new THREE.MeshStandardMaterial({
          color: spec.colors.liquid,
          roughness: 0.18,
          emissive: new THREE.Color(spec.colors.liquid).multiplyScalar(0.5),
          emissiveIntensity: 0.35,
        })
      : new THREE.MeshPhysicalMaterial({
      color: spec.colors.liquid,
      roughness: 0.12,
      transmission: 0.45,
      thickness: 0.6,
      ior: 1.34,
      attenuationColor: new THREE.Color(spec.colors.liquid).multiplyScalar(0.6),
      attenuationDistance: 0.6,
      emissive: new THREE.Color(spec.colors.liquid).multiplyScalar(0.45),
      emissiveIntensity: 0.25,
    }),
    liquidTop: new THREE.MeshStandardMaterial({ color: new THREE.Color(spec.colors.liquid).lerp(new THREE.Color('#ffffff'), 0.2), roughness: 0.2 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.22,
      roughness: 0.03,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    label: new THREE.MeshStandardMaterial({ map: label, roughness: 0.55, side: THREE.DoubleSide }),
    cap: new THREE.MeshStandardMaterial({ color: spec.colors.cap, roughness: 0.32, metalness: 0.85 }),
    capTop: new THREE.MeshStandardMaterial({ color: spec.colors.capDetail, roughness: 0.4, metalness: 0.85 }),
    twine: new THREE.MeshStandardMaterial({ color: '#b89a6a', roughness: 1 }),
    tag: new THREE.MeshStandardMaterial({ map: tagTexture(), roughness: 0.95, side: THREE.DoubleSide }),
  }
}
