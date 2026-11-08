import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js'
import { getBottleGeometries, makeBottleMaterials } from './bottleGeometry'
import { loadLabelTexture } from './Bottle'
import { BOTTLE } from '../bottleSpec'

// Algunos visores AR prefieren texturas de tamaño potencia de 2
function potTexture(tex) {
  const img = tex?.image
  if (!img || !img.width) return tex
  const p2 = (n) => Math.pow(2, Math.round(Math.log2(n)))
  const c = document.createElement('canvas')
  c.width = Math.min(2048, p2(img.width))
  c.height = Math.min(2048, p2(img.height))
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.flipY = tex.flipY
  return t
}

// Botella a tamaño real (metros) para realidad aumentada.
async function buildScene({ forUSDZ = false } = {}) {
  const label = await loadLabelTexture()
  const g = getBottleGeometries(BOTTLE)
  const m = makeBottleMaterials(BOTTLE)
  m.label.map = potTexture(label)
  m.tag.map = potTexture(m.tag.map)
  const scene = new THREE.Scene()
  const root = new THREE.Group()
  root.name = 'MargaritaSun'
  const add = (geo, mat, name) => {
    let material = mat
    if (forUSDZ) {
      // Quick Look (iPhone) no entiende transmisión: versiones simples
      material = new THREE.MeshStandardMaterial({
        color: mat.color,
        map: mat.map || null,
        roughness: mat.roughness,
        metalness: mat.metalness || 0,
        transparent: mat.transparent,
        opacity: mat.opacity,
        side: mat.side,
      })
      if (name === 'Bebida') {
        material.transparent = true
        material.opacity = 0.92
      }
      if (name === 'Vidrio') material.opacity = 0.18
    }
    // escena en decímetros → metros (escala aplicada a la geometría)
    const mesh = new THREE.Mesh(geo.clone().scale(0.1, 0.1, 0.1), material)
    mesh.name = name
    root.add(mesh)
  }
  add(g.liquid, m.liquid, 'Bebida')
  add(g.liquidTop, m.liquidTop, 'BebidaSuperficie')
  add(g.label, m.label, 'Etiqueta')
  add(g.cap, m.cap, 'Tapa')
  add(g.capTop, m.capTop, 'TapaDetalle')
  if (g.tag) {
    add(g.tag.twine, m.twine, 'Cordon')
    add(g.tag.string, m.twine, 'CordonNudo')
    add(g.tag.tag, m.tag, 'EtiquetaColgante')
  }
  add(g.glass, m.glass, 'Vidrio')
  scene.add(root)
  return scene
}

export async function exportGLB() {
  const scene = await buildScene()
  const buf = await new GLTFExporter().parseAsync(scene, { binary: true, maxTextureSize: 2048 })
  return new Blob([buf], { type: 'model/gltf-binary' })
}

export async function exportUSDZ() {
  const scene = await buildScene({ forUSDZ: true })
  const arr = await new USDZExporter().parseAsync(scene, { quickLookCompatible: true })
  return new Blob([arr], { type: 'model/vnd.usdz+zip' })
}

export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
