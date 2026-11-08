import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { makeLabelCanvas } from './labelTexture'
import { getBottleGeometries, makeBottleMaterials } from './bottleGeometry'
import { SITE } from '../content'
import { BOTTLE } from '../bottleSpec'

// Textura de etiqueta compartida (se crea una sola vez para toda la página)
let labelPromise = null
export function loadLabelTexture() {
  if (!labelPromise)
    labelPromise = new Promise((resolve) => {
      const fromCanvas = async () => {
        const t = new THREE.CanvasTexture(await makeLabelCanvas())
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 8
        resolve(t)
      }
      // Si existe la etiqueta real del equipo en /public/etiqueta.png, se usa esa.
      new THREE.TextureLoader().load(
        SITE.customLabel,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace
          t.anisotropy = 8
          resolve(t)
        },
        undefined,
        fromCanvas,
      )
    })
  return labelPromise
}

export function useLabelTexture() {
  const [tex, setTex] = useState(null)
  useEffect(() => {
    let alive = true
    loadLabelTexture().then((t) => alive && setTex(t))
    return () => {
      alive = false
    }
  }, [])
  return tex
}

/** Botella completa. La base queda en y = 0 salvo que `centered` sea true. */
export default function Bottle({ centered = true, ...props }) {
  const label = useLabelTexture()
  const g = getBottleGeometries(BOTTLE)
  const m = useMemo(() => makeBottleMaterials(BOTTLE), [])
  useEffect(() => {
    m.label.map = label
    m.label.needsUpdate = true
  }, [label, m])
  return (
    <group {...props}>
      <group position-y={centered ? -g.d.total / 2 : 0}>
        <mesh geometry={g.liquid} material={m.liquid} renderOrder={1} />
        <mesh geometry={g.liquidTop} material={m.liquidTop} />
        <mesh geometry={g.glass} material={m.glass} renderOrder={3} />
        {label && <mesh geometry={g.label} material={m.label} renderOrder={2} />}
        <mesh geometry={g.cap} material={m.cap} />
        <mesh geometry={g.capTop} material={m.capTop} />
        {g.tag && (
          <>
            <mesh geometry={g.tag.twine} material={m.twine} />
            <mesh geometry={g.tag.string} material={m.twine} />
            <mesh geometry={g.tag.tag} material={m.tag} />
          </>
        )}
      </group>
    </group>
  )
}
