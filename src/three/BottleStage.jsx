import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Lightformer, PresentationControls } from '@react-three/drei'
import Bottle from './Bottle'

export function Lights({ warm = true }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={warm ? 2.2 : 1.6} color={warm ? '#ffe2c0' : '#ffffff'} />
      <directionalLight position={[-4, 2, -2]} intensity={1.2} color="#9fb8ff" />
      {/* Entorno generado localmente (sin descargar HDRIs) para los reflejos del vidrio */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 4, -6]} scale={[10, 3, 1]} color="#ffd7a8" />
        <Lightformer form="rect" intensity={3} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[4, 8, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[3, 8, 1]} color="#ffb48a" />
        <Lightformer form="ring" intensity={2} position={[0, 6, 2]} scale={3} color="#f27b2b" />
      </Environment>
    </>
  )
}

function Spinner({ speed = 0.25, scrollRef, children }) {
  const g = useRef()
  useFrame((_, dt) => {
    if (!g.current) return
    if (scrollRef) {
      const target = scrollRef.current * Math.PI * 2
      g.current.rotation.y += (target - g.current.rotation.y) * Math.min(1, dt * 6)
    } else {
      g.current.rotation.y += dt * speed
    }
  })
  return <group ref={g}>{children}</group>
}

/**
 * mode: 'hero' (gira solo + arrastrable) | 'scroll' (gira con el scroll) | 'studio'
 */
export default function BottleStage({ mode = 'hero', scrollRef, studioRotation = 0, canvasRef, stateRef, className }) {
  const isStudio = mode === 'studio'
  return (
    <Canvas
      className={className}
      ref={canvasRef}
      dpr={[1, isStudio ? 2 : 1.75]}
      camera={{ position: [0, isStudio ? 0.9 : 1.2, isStudio ? 7.6 : 5.2], fov: 30 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: isStudio }}
      onCreated={(state) => {
        if (stateRef) stateRef.current = state
      }}
    >
      <Suspense fallback={null}>
        <Lights />
        <PresentationControls
          global={false}
          cursor
          snap={mode !== 'studio'}
          speed={1.4}
          rotation={[0, 0, 0]}
          polar={[-0.15, 0.25]}
          azimuth={[-Infinity, Infinity]}
        >
          {mode === 'hero' ? (
            <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.5}>
              <Spinner speed={0.35}>
                <Bottle />
              </Spinner>
            </Float>
          ) : mode === 'scroll' ? (
            <Spinner scrollRef={scrollRef}>
              <Bottle />
            </Spinner>
          ) : (
            <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.2}>
              <group rotation-y={studioRotation}>
                <Bottle />
              </group>
            </Float>
          )}
        </PresentationControls>
        <ContactShadows position={[0, -1.12, 0]} opacity={0.45} scale={4} blur={2.4} far={2} color="#5a1a10" />
      </Suspense>
    </Canvas>
  )
}
