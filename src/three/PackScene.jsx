import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { Lights } from './BottleStage'
import { getBottleGeometries, makeBottleMaterials } from './bottleGeometry'
import { useLabelTexture } from './Bottle'
import { BOTTLE, PACK } from '../bottleSpec'
import { kraftTexture, boxTextures, topTexture, stickerTexture, woodTexture, filmTexture } from './packTextures'

// ── utilidades de animación ─────────────────────────────────
const CM = 0.1 // 1 cm en unidades de escena (1 u = 10 cm)
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const seg = (p, a, b) => clamp01((p - a) / (b - a))
const eOut = (t) => 1 - Math.pow(1 - t, 3)
const eInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const eBack = (t) => {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
const lerp = THREE.MathUtils.lerp

// Límites de cada etapa (proporción del scroll de la sección)
export const STAGES = [0, 0.08, 0.22, 0.4, 0.52, 0.68, 0.78, 0.88, 1]
export const stageAt = (p) => {
  for (let i = STAGES.length - 2; i >= 0; i--) if (p >= STAGES[i]) return i
  return 0
}

// ── medidas (caja de cartón corrugado regular, medidas externas) ──
const L = PACK.box.l * CM
const W = PACK.box.w * CM
const H = PACK.box.h * CM
const T = 0.045 // ~4.5 mm de cartón corrugado
const IL = L - 2 * T
const IW = W - 2 * T
const DIV_H = PACK.dividerHeight * CM
const S = L + W // lado del arreglo "pinwheel"
const PL = PACK.pallet.l * CM
const PW = PACK.pallet.w * CM
const PH = PACK.pallet.h * CM
const STACK_TOP = PH + H + 0.02
const FLAP_OPEN = 1.95 // ~112° hacia afuera

// Arreglo en molinete (pinwheel): 4 cajas alrededor de un hueco central
const SLOTS = [
  { x: S / 2 - L / 2, z: S / 2 - W / 2, r: 0 }, // C (la caja llena, al frente)
  { x: -S / 2 + L / 2, z: -S / 2 + W / 2, r: 0 },
  { x: S / 2 - W / 2, z: -S / 2 + L / 2, r: Math.PI / 2 },
  { x: -S / 2 + W / 2, z: S / 2 - L / 2, r: Math.PI / 2 },
].slice(0, Math.max(1, PACK.boxesOnPallet))

// ── cámara por etapa: [p, posición, objetivo] ───────────────
const CAM = [
  [0.0, [0, 1.25, 5.6], [0, 1.0, 0]],
  [0.1, [3.6, 6.4, 11.4], [0, 1.3, 0]],
  [0.2, [3.2, 11.6, 8.8], [0, 1.5, 0]],
  [0.4, [3.0, 11.2, 9.0], [0, 1.6, 0]],
  [0.5, [1.8, 3.0, 9.6], [0, 1.25, 0]],
  [0.6, [8.5, 7.5, 12.5], [0, 1.6, 0]],
  [0.74, [9.5, 6.2, 10.5], [0, 1.9, 0]],
  [0.86, [-6.5, 7.8, 11.5], [0, 2.0, 0]],
  [1.0, [-8.5, 6.5, 11.5], [0, 1.8, 0]],
]

function sampleCam(p, pos, look) {
  let i = 0
  while (i < CAM.length - 2 && p > CAM[i + 1][0]) i++
  const [p0, a0, b0] = CAM[i]
  const [p1, a1, b1] = CAM[i + 1]
  const t = eInOut(seg(p, p0, p1))
  pos.set(lerp(a0[0], a1[0], t), lerp(a0[1], a1[1], t), lerp(a0[2], a1[2], t))
  look.set(lerp(b0[0], b1[0], t), lerp(b0[1], b1[1], t), lerp(b0[2], b1[2], t))
}

// Fleje: cinta plana que recorre un circuito (crece con drawRange)
function strapGeometry(axis, offset, width = 0.13) {
  const hz1 = S / 2 + 0.012
  const yT = STACK_TOP + (axis === 'x' ? 0.012 : 0.004)
  const yU = PH - 0.135 // pasa por debajo de la cubierta de la tarima
  const pts2 = [[0, yT], [hz1, yT], [hz1, yU], [-hz1, yU], [-hz1, yT], [0, yT]]
  const path = []
  for (let i = 0; i < pts2.length - 1; i++) {
    const [a, b] = [pts2[i], pts2[i + 1]]
    const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.05))
    for (let k = 0; k < n; k++) path.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)])
  }
  path.push(pts2[pts2.length - 1])
  const pos = []
  const idx = []
  path.forEach(([s, y]) => {
    if (axis === 'z') pos.push(offset - width / 2, y, s, offset + width / 2, y, s)
    else pos.push(s, y, offset - width / 2, s, y, offset + width / 2)
  })
  for (let i = 0; i < path.length - 1; i++) {
    const a = i * 2
    idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function useMats() {
  return useMemo(() => {
    const kraft = kraftTexture()
    const kraftIn = kraftTexture('#c79b67')
    const k = new THREE.MeshStandardMaterial({ map: kraft, roughness: 0.9 })
    const kIn = new THREE.MeshStandardMaterial({ map: kraftIn, roughness: 0.92 })
    const mk = () => new THREE.MeshStandardMaterial({ map: kraft, roughness: 0.85 })
    const wood = woodTexture()
    const woodStamp = woodTexture(true)
    const wm = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.8 })
    // materiales de las caras impresas (las texturas llegan después, async)
    const faces = Array.from({ length: PACK.boxesOnPallet }, () => ({ marks: mk(), info: mk(), short: mk() }))
    const top = new THREE.MeshStandardMaterial({ map: topTexture(), roughness: 0.85 })
    return {
      kraft: k,
      kraftIn: kIn,
      faces,
      top,
      // caja cerrada: +x, −x, +y, −y, +z, −z
      closed: faces.map((f) => [f.short, f.short, top, k, f.marks, f.info]),
      wallFront: [k, k, k, k, faces[0].marks, kIn],
      wallBack: [k, k, k, k, kIn, faces[0].info],
      wallRight: [faces[0].short, kIn, k, k, k, k],
      wallLeft: [kIn, faces[0].short, k, k, k, k],
      flap: [k, k, kIn, k, k, k],
      flapOut: [k, k, k, kIn, k, k],
      tape: new THREE.MeshPhysicalMaterial({ color: '#fff6e0', transparent: true, opacity: 0.45, roughness: 0.15, clearcoat: 1 }),
      sticker: new THREE.MeshStandardMaterial({ map: stickerTexture(), roughness: 0.6 }),
      wood: wm(wood),
      woodStamp: [wm(woodStamp), wm(woodStamp), wm(wood), wm(wood), wm(woodStamp), wm(woodStamp)],
      strap: new THREE.MeshStandardMaterial({ color: '#1e2230', roughness: 0.45, side: THREE.DoubleSide }),
      corner: new THREE.MeshStandardMaterial({ map: kraft, color: '#a87a48', roughness: 0.8 }),
      paper: new THREE.MeshStandardMaterial({ color: '#c9a06a', roughness: 1, flatShading: true }),
      film: new THREE.MeshPhysicalMaterial({
        color: '#eef4ff',
        map: filmTexture(),
        transparent: true,
        opacity: 0.62,
        roughness: 0.08,
        envMapIntensity: 1.6,
        clearcoat: 1,
        side: THREE.DoubleSide,
        depthWrite: false,
        clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)],
      }),
      roll: new THREE.MeshPhysicalMaterial({ color: '#f4f8ff', roughness: 0.2, transparent: true, opacity: 0.85 }),
    }
  }, [])
}

function Pallet({ mats }) {
  const parts = useMemo(() => {
    const out = []
    const deckT = 0.12
    const n = 7
    const bw = PW / (n + (n - 1) * 0.28)
    for (let i = 0; i < n; i++) {
      out.push({ s: [PL, deckT, bw], p: [0, PH - deckT / 2, -PW / 2 + bw / 2 + i * bw * 1.28] })
    }
    const xs = [-PL / 2 + 0.45, 0, PL / 2 - 0.45]
    const zs = [-PW / 2 + 0.45, 0, PW / 2 - 0.45]
    xs.forEach((x) => out.push({ s: [0.9, 0.1, PW], p: [x, PH - deckT - 0.05, 0] }))
    const blockH = PH - deckT - 0.1 - 0.12
    xs.forEach((x) =>
      zs.forEach((z) => out.push({ s: [0.9, blockH, 0.9], p: [x, 0.12 + blockH / 2, z], stamp: x === 0 && z === zs[2] })),
    )
    zs.forEach((z) => out.push({ s: [PL, 0.12, 0.9], p: [0, 0.06, z] }))
    return out
  }, [])
  return parts.map((b, i) => (
    <mesh key={i} position={b.p} material={b.stamp ? mats.woodStamp : mats.wood}>
      <boxGeometry args={b.s} />
    </mesh>
  ))
}


function Scene({ progress, onStage }) {
  const mats = useMats()
  const label = useLabelTexture()
  const bg = getBottleGeometries(BOTTLE)
  const bm = useMemo(() => makeBottleMaterials(BOTTLE, null, { lite: true }), [])
  useEffect(() => {
    bm.label.map = label
    bm.label.needsUpdate = true
  }, [label, bm])

  // Texturas impresas de cada caja (C/N 1/4 … 4/4)
  useEffect(() => {
    let alive = true
    const run = async () => {
      await document.fonts?.ready
      for (let i = 0; i < mats.faces.length; i++) {
        const tx = await boxTextures(i + 1, mats.faces.length)
        if (!alive) return
        for (const key of ['marks', 'info', 'short']) {
          mats.faces[i][key].map = tx[key]
          mats.faces[i][key].needsUpdate = true
        }
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [mats])

  const { gl, camera, size } = useThree()
  useEffect(() => {
    gl.localClippingEnabled = true
  }, [gl])

  const N = PACK.grid.cols * PACK.grid.rows
  const dx = IL / PACK.grid.cols
  const dz = IW / PACK.grid.rows
  const slots = useMemo(() => {
    const out = []
    for (let r = 0; r < PACK.grid.rows; r++)
      for (let c = 0; c < PACK.grid.cols; c++)
        out.push(new THREE.Vector3((c - (PACK.grid.cols - 1) / 2) * dx, T, (r - (PACK.grid.rows - 1) / 2) * dz))
    return out
  }, [dx, dz])
  const hero = (PACK.grid.rows - 1) * PACK.grid.cols + Math.floor(PACK.grid.cols / 2)
  const order = useMemo(() => {
    const idx = slots.map((_, i) => i).filter((i) => i !== hero)
    idx.sort((a, b) => slots[a].z - slots[b].z || Math.abs(slots[a].x) - Math.abs(slots[b].x))
    const o = new Array(N).fill(0)
    idx.forEach((i, k) => (o[i] = k))
    return o
  }, [slots, hero, N])

  const dividers = useMemo(() => {
    const out = []
    for (let c = 1; c < PACK.grid.cols; c++) out.push({ p: [-IL / 2 + c * dx, T, 0], s: [0.012, DIV_H, IW] })
    for (let r = 1; r < PACK.grid.rows; r++) out.push({ p: [0, T, -IW / 2 + r * dz], s: [IL, DIV_H, 0.012] })
    return out
  }, [dx, dz])

  // Relleno: bolas de papel kraft en el hueco central del arreglo
  const PAPER = 26
  const paperData = useMemo(() => {
    const hole = S - 2 * L + 0.0 // lado del hueco = |L − W|
    const side = Math.abs(L - W) - 0.06
    return Array.from({ length: PAPER }, (_, i) => ({
      x: (Math.random() - 0.5) * side,
      z: (Math.random() - 0.5) * side,
      y: PH + 0.08 + (i / PAPER) * (H - 0.2),
      s: 0.07 + Math.random() * 0.05,
      r: Math.random() * Math.PI,
      d: i / PAPER,
      hole,
    }))
  }, [])
  const paperGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), [])

  const r = {
    world: useRef(),
    full: useRef(),
    base: useRef(),
    wF: useRef(),
    wB: useRef(),
    wL: useRef(),
    wR: useRef(),
    fF: useRef(),
    fB: useRef(),
    fL: useRef(),
    fR: useRef(),
    tape: useRef(),
    tapeEnds: useRef([]),
    sticker: useRef(),
    pallet: useRef(),
    others: useRef([]),
    corners: useRef([]),
    straps: useRef([]),
    film: useRef(),
    roll: useRef(),
    inst: useRef([]),
    paper: useRef(),
    divs: useRef([]),
  }
  const strapGeos = useMemo(
    () => [strapGeometry('z', -S / 4), strapGeometry('z', S / 4), strapGeometry('x', -S / 4), strapGeometry('x', S / 4)],
    [],
  )
  const filmGeo = useMemo(() => {
    const y0 = PH - 0.45
    const h = STACK_TOP + 0.06 - y0
    const rad = (S / 2 + 0.035) * Math.SQRT2
    const g = new THREE.CylinderGeometry(rad, rad, h, 4, 1, true)
    g.rotateY(Math.PI / 4)
    g.translate(0, y0 + h / 2, 0)
    return g
  }, [])

  const tmp = useMemo(
    () => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), s: new THREE.Vector3(), v: new THREE.Vector3(), e: new THREE.Euler(), pos: new THREE.Vector3(), look: new THREE.Vector3() }),
    [],
  )
  const smooth = useRef(0)
  const spin = useRef(0)
  const lastStage = useRef(-1)

  useFrame((state, dt) => {
    const target = progress.current
    smooth.current += (target - smooth.current) * Math.min(1, dt * 4.5)
    const p = smooth.current
    const st = stageAt(target)
    if (st !== lastStage.current) {
      lastStage.current = st
      onStage?.(st)
    }

    // cámara
    sampleCam(p, tmp.pos, tmp.look)
    const aspect = size.width / size.height
    const f = aspect < 0.75 ? 2.35 : aspect < 1.1 ? 1.5 : 1
    tmp.pos.sub(tmp.look).multiplyScalar(f).add(tmp.look)
    camera.position.copy(tmp.pos)
    camera.lookAt(tmp.look)

    if (p > 0.965) spin.current += dt * 0.25
    else spin.current *= 1 - Math.min(1, dt * 3)
    r.world.current.rotation.y = spin.current

    // 1 · la caja se arma: fondo + paredes que se levantan (con solapas abiertas)
    const tb = eOut(seg(p, 0.08, 0.12))
    r.base.current.scale.set(tb || 1e-4, 1, tb || 1e-4)
    const fold = (a, b) => 1 - eBack(seg(p, a, b))
    r.wF.current.rotation.x = (Math.PI / 2) * fold(0.11, 0.17)
    r.wB.current.rotation.x = (-Math.PI / 2) * fold(0.12, 0.18)
    r.wL.current.rotation.z = (Math.PI / 2) * fold(0.14, 0.2)
    r.wR.current.rotation.z = (-Math.PI / 2) * fold(0.15, 0.21)
    const wallsOn = p > 0.1
    for (const w of [r.wF, r.wB, r.wL, r.wR]) w.current.visible = wallsOn

    // separadores de cartón
    r.divs.current.forEach((d, k) => {
      if (!d) return
      const t = eBack(seg(p, 0.215 + k * 0.005, 0.24 + k * 0.005))
      d.visible = t > 0.001
      d.scale.y = Math.max(1e-4, t)
    })

    // 2 · botellas
    const heroMove = eInOut(seg(p, 0.17, 0.23))
    const heroSpin = (1 - eInOut(seg(p, 0, 0.21))) * Math.PI * 2
    for (let i = 0; i < N; i++) {
      let x, y, z, ry, sc
      if (i === hero) {
        x = lerp(0, slots[i].x, heroMove)
        z = lerp(0, slots[i].z, heroMove)
        y = T
        ry = heroSpin
        sc = 1
      } else {
        const a = 0.245 + order[i] * 0.0055
        const t = seg(p, a, a + 0.045)
        x = slots[i].x
        z = slots[i].z
        y = T + 3.4 * (1 - eOut(t))
        ry = (1 - t) * 0.6
        sc = t > 0 ? 1 : 0
      }
      tmp.e.set(0, ry, 0)
      tmp.q.setFromEuler(tmp.e)
      tmp.s.setScalar(sc || 1e-4)
      tmp.m.compose(tmp.v.set(x, y, z), tmp.q, tmp.s)
      for (const im of r.inst.current) im && im.setMatrixAt(i, tmp.m)
    }
    for (const im of r.inst.current) if (im) im.instanceMatrix.needsUpdate = true

    // 3 · cierre: solapas menores, luego mayores, cinta y calcomanía
    const cMin = eInOut(seg(p, 0.41, 0.445))
    const cMaj = eInOut(seg(p, 0.445, 0.48))
    r.fR.current.rotation.z = -FLAP_OPEN * (1 - cMin)
    r.fL.current.rotation.z = FLAP_OPEN * (1 - cMin)
    r.fF.current.rotation.x = FLAP_OPEN * (1 - cMaj)
    r.fB.current.rotation.x = -FLAP_OPEN * (1 - cMaj)
    const tt = eInOut(seg(p, 0.48, 0.505))
    r.tape.current.visible = tt > 0
    r.tape.current.scale.x = Math.max(1e-4, tt)
    r.tapeEnds.current.forEach((e) => e && (e.visible = tt >= 1))
    const ts = eBack(seg(p, 0.5, 0.52))
    r.sticker.current.visible = ts > 0.001
    r.sticker.current.scale.setScalar(Math.max(1e-4, ts))

    // 4 · tarima + la caja llena va a su lugar + 3 cajas más + relleno
    const lift = eInOut(seg(p, 0.52, 0.56))
    const move = eInOut(seg(p, 0.56, 0.62))
    const slot = SLOTS[0]
    r.full.current.position.set(slot.x * move, move > 0 ? PH + 1.3 * (1 - move) : lift * (PH + 1.3), slot.z * move)
    const tp = eOut(seg(p, 0.535, 0.6))
    r.pallet.current.visible = tp > 0
    r.pallet.current.position.x = -11 * (1 - tp)
    r.others.current.forEach((o, k) => {
      if (!o) return
      const a = 0.6 + k * 0.02
      const t = seg(p, a, a + 0.045)
      const sl = SLOTS[k + 1]
      o.visible = t > 0
      o.position.set(sl.x, PH + H / 2 + 4 * (1 - eOut(t)), sl.z)
      o.rotation.set(0, sl.r + (1 - t) * 0.5, (1 - t) * 0.15)
    })
    const pim = r.paper.current
    if (pim) {
      for (let i = 0; i < PAPER; i++) {
        const d = paperData[i]
        const t = eOut(seg(p, 0.645 + d.d * 0.03, 0.665 + d.d * 0.03))
        tmp.e.set(d.r, d.r * 2, d.r * 0.5)
        tmp.q.setFromEuler(tmp.e)
        tmp.s.set(d.s, d.s * 0.85, d.s * 1.1).multiplyScalar(t > 0 ? 1 : 1e-4)
        tmp.m.compose(tmp.v.set(d.x, d.y + (1 - t) * 3, d.z), tmp.q, tmp.s)
        pim.setMatrixAt(i, tmp.m)
      }
      pim.instanceMatrix.needsUpdate = true
    }

    // 5 · esquineros
    r.corners.current.forEach((c, k) => {
      if (!c) return
      const a = 0.68 + k * 0.018
      const t = seg(p, a, a + 0.05)
      c.visible = t > 0
      c.position.y = PH + 3.5 * (1 - eOut(t))
    })

    // 6 · fleje
    r.straps.current.forEach((m, k) => {
      if (!m) return
      const a = 0.78 + k * 0.018
      const t = eInOut(seg(p, a, a + 0.06))
      m.visible = t > 0
      const total = m.geometry.index.count
      m.geometry.setDrawRange(0, Math.floor((t * total) / 6) * 6)
    })

    // 7 · playo
    const tf = seg(p, 0.88, 0.98)
    const y0 = PH - 0.45
    const hNow = lerp(y0, STACK_TOP + 0.07, eInOut(tf))
    mats.film.clippingPlanes[0].constant = hNow
    r.film.current.visible = tf > 0
    r.roll.current.visible = tf > 0 && tf < 1
    const ang = eInOut(tf) * Math.PI * 2 * 3.5
    const rr = S / 2 + 0.45
    r.roll.current.position.set(Math.cos(ang) * rr, Math.max(y0 + 0.35, hNow - 0.25), Math.sin(ang) * rr)
  })

  const cornerSpots = [
    [S / 2, S / 2],
    [-S / 2, S / 2],
    [-S / 2, -S / 2],
    [S / 2, -S / 2],
  ]
  const legs = 0.36
  const ct = 0.025

  return (
    <group ref={r.world}>
      {/* Caja llena (cartón corrugado, solapas) */}
      <group ref={r.full}>
        <mesh ref={r.base} position={[0, T / 2, 0]} material={mats.kraftIn}>
          <boxGeometry args={[IL, T, IW]} />
        </mesh>
        {/* pared frontal (marcas de embarque) + solapa mayor */}
        <group ref={r.wF} position={[0, 0, W / 2]}>
          <mesh position={[0, H / 2, -T / 2]} material={mats.wallFront}>
            <boxGeometry args={[L, H, T]} />
          </mesh>
          <group ref={r.fF} position={[0, H, -T / 2]}>
            <mesh position={[0, -T / 2, -W / 4 + T / 4]} material={mats.flap}>
              <boxGeometry args={[L, T, W / 2 - T / 2]} />
            </mesh>
          </group>
        </group>
        {/* pared trasera (información + QR) + solapa mayor */}
        <group ref={r.wB} position={[0, 0, -W / 2]}>
          <mesh position={[0, H / 2, T / 2]} material={mats.wallBack}>
            <boxGeometry args={[L, H, T]} />
          </mesh>
          <group ref={r.fB} position={[0, H, T / 2]}>
            <mesh position={[0, -T / 2, W / 4 - T / 4]} material={mats.flap}>
              <boxGeometry args={[L, T, W / 2 - T / 2]} />
            </mesh>
          </group>
        </group>
        {/* laterales + solapas menores */}
        <group ref={r.wL} position={[-L / 2, 0, 0]}>
          <mesh position={[T / 2, H / 2, 0]} material={mats.wallLeft}>
            <boxGeometry args={[T, H, IW]} />
          </mesh>
          <group ref={r.fL} position={[T / 2, H - T, 0]}>
            <mesh position={[W / 4 - T / 2, -T / 2, 0]} material={mats.flap}>
              <boxGeometry args={[W / 2 - T, T, IW]} />
            </mesh>
          </group>
        </group>
        <group ref={r.wR} position={[L / 2, 0, 0]}>
          <mesh position={[-T / 2, H / 2, 0]} material={mats.wallRight}>
            <boxGeometry args={[T, H, IW]} />
          </mesh>
          <group ref={r.fR} position={[-T / 2, H - T, 0]}>
            <mesh position={[-W / 4 + T / 2, -T / 2, 0]} material={mats.flap}>
              <boxGeometry args={[W / 2 - T, T, IW]} />
            </mesh>
          </group>
        </group>

        {/* separadores 6 × 4 */}
        {dividers.map((d, k) => (
          <group key={k} ref={(el) => (r.divs.current[k] = el)} position={d.p}>
            <mesh position={[0, DIV_H / 2, 0]} material={mats.kraftIn}>
              <boxGeometry args={d.s} />
            </mesh>
          </group>
        ))}

        {/* 24 botellas instanciadas */}
        {[
          [bg.liquid, bm.liquid, 1],
          [bg.liquidTop, bm.liquidTop, 1],
          [bg.label, bm.label, 2],
          [bg.cap, bm.cap, 2],
          [bg.capTop, bm.capTop, 2],
          [bg.glass, bm.glass, 3],
        ].map(([geo, mat, ro], k) => (
          <instancedMesh key={k} ref={(el) => (r.inst.current[k] = el)} args={[geo, mat, N]} renderOrder={ro} frustumCulled={false} />
        ))}

        {/* cinta y calcomanía "0° GRADOS" */}
        <mesh ref={r.tape} position={[0, H + 0.003, 0]} material={mats.tape}>
          <boxGeometry args={[L + 0.01, 0.004, 0.48]} />
        </mesh>
        {[-1, 1].map((sx, k) => (
          <mesh key={k} ref={(el) => (r.tapeEnds.current[k] = el)} position={[sx * (L / 2 + 0.003), H - 0.25, 0]} material={mats.tape}>
            <boxGeometry args={[0.004, 0.5, 0.48]} />
          </mesh>
        ))}
        <mesh ref={r.sticker} position={[0, H + 0.008, -W / 4 - 0.05]} rotation={[-Math.PI / 2, 0, 0]} material={mats.sticker}>
          <planeGeometry args={[0.95, 0.61]} />
        </mesh>
      </group>

      {/* Tarima */}
      <group ref={r.pallet}>
        <Pallet mats={mats} />
      </group>

      {/* Cajas vacías cerradas (C/N 2/4 … 4/4) */}
      {SLOTS.slice(1).map((_, k) => (
        <mesh key={k} ref={(el) => (r.others.current[k] = el)} material={mats.closed[k + 1]}>
          <boxGeometry args={[L, H, W]} />
        </mesh>
      ))}

      {/* Relleno: papel kraft en el hueco central */}
      <instancedMesh ref={r.paper} args={[paperGeo, mats.paper, PAPER]} frustumCulled={false} />

      {/* Esquineros */}
      {cornerSpots.map(([x, z], k) => (
        <group key={k} ref={(el) => (r.corners.current[k] = el)} position={[x, PH, z]}>
          <mesh position={[-Math.sign(x) * (legs / 2 - 0.01), H / 2 + 0.01, Math.sign(z) * (ct / 2 + 0.006)]} material={mats.corner}>
            <boxGeometry args={[legs, H + 0.02, ct]} />
          </mesh>
          <mesh position={[Math.sign(x) * (ct / 2 + 0.006), H / 2 + 0.01, -Math.sign(z) * (legs / 2 - 0.01)]} material={mats.corner}>
            <boxGeometry args={[ct, H + 0.02, legs]} />
          </mesh>
        </group>
      ))}

      {/* Fleje */}
      {strapGeos.map((g, k) => (
        <mesh key={k} ref={(el) => (r.straps.current[k] = el)} geometry={g} material={mats.strap} />
      ))}

      {/* Playo + rollo */}
      <mesh ref={r.film} geometry={filmGeo} material={mats.film} renderOrder={5} />
      <mesh ref={r.roll} material={mats.roll}>
        <cylinderGeometry args={[0.16, 0.16, 1.4, 32]} />
      </mesh>
    </group>
  )
}

export default function PackScene({ progress, onStage, className }) {
  return (
    <Canvas className={className} dpr={[1, 1.5]} camera={{ position: [0, 1.3, 3.4], fov: 32, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true }}>
      <Lights />
      <Scene progress={progress} onStage={onStage} />
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={22} blur={2.6} far={6} resolution={512} color="#5a2a10" />
    </Canvas>
  )
}
