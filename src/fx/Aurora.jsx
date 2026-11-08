import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

// Fondo "amanecer" animado en WebGL (inspirado en Aurora de React Bits).
const vert = /* glsl */ `
attribute vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`
const frag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uD;

vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float t = uTime * 0.06;
  float n1 = snoise(vec2(uv.x * 1.6 + t, uv.y * 0.9 - t * 0.6));
  float n2 = snoise(vec2(uv.x * 3.0 - t * 1.3, uv.y * 2.2 + t));
  float h = uv.y + n1 * 0.12 + n2 * 0.05;
  // de abajo (sol) hacia arriba (cielo)
  vec3 col = mix(uA, uB, smoothstep(0.0, 0.38, h));
  col = mix(col, uC, smoothstep(0.32, 0.7, h));
  col = mix(col, uD, smoothstep(0.62, 1.05, h));
  // halo de sol
  vec2 sp = vec2(0.5 + sin(t * 2.0) * 0.08, 0.06);
  float d = distance(vec2(uv.x * uRes.x / uRes.y, uv.y), vec2(sp.x * uRes.x / uRes.y, sp.y));
  col += vec3(1.0, 0.75, 0.4) * smoothstep(0.75, 0.0, d) * 0.35;
  // grano
  float gr = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
  col += (gr - 0.5) * 0.035;
  gl_FragColor = vec4(col, 1.0);
}
`

const hex = (h) => {
  const n = parseInt(h.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export default function Aurora({ colors = ['#ffcf73', '#f27b2b', '#c8233f', '#2a1450'], className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1.5), alpha: false })
    const gl = renderer.gl
    el.appendChild(gl.canvas)
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    gl.canvas.style.display = 'block'
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uA: { value: hex(colors[0]) },
        uB: { value: hex(colors[1]) },
        uC: { value: hex(colors[2]) },
        uD: { value: hex(colors[3]) },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight)
      program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight]
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()
    let raf
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)
    const loop = (ms) => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      program.uniforms.uTime.value = reduce ? 10 : ms * 0.001
      renderer.render({ scene: mesh })
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      el.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors.join('|')])
  return <div ref={ref} className={className} aria-hidden />
}
