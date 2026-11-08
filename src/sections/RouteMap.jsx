import { useEffect, useMemo, useRef, useState } from 'react'
import { geoNaturalEarth1, geoPath, geoInterpolate, geoGraticule10 } from 'd3-geo'
import { feature } from 'topojson-client'
import world from 'world-atlas/countries-110m.json'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Coordenadas [lon, lat]
const PUEBLA = [-98.2063, 19.0414]
const MANZANILLO = [-104.3188, 19.0522]
const YOKOHAMA = [139.6380, 35.4437]
const TOKYO = [139.6917, 35.6895]
// Carretera aproximada: 150D → Arco Norte → 15D → Guadalajara → 54D → Manzanillo
const ROAD = [
  PUEBLA,
  [-98.62, 19.62],
  [-99.35, 19.78],
  [-99.95, 19.83],
  [-100.65, 19.78],
  [-101.19, 19.70],
  [-102.0, 20.12],
  [-102.75, 20.48],
  [-103.33, 20.6],
  [-103.47, 20.2],
  [-103.72, 19.25],
  [-104.05, 19.12],
  MANZANILLO,
]

const countries = feature(world, world.objects.countries)
const MX = countries.features.find((f) => f.id === '484')
const JP = countries.features.find((f) => f.id === '392')

function seaRoute() {
  // Derrota aproximada: salida al oeste y arco de gran círculo hacia Yokohama
  const start = [-106.2, 18.6]
  const ip = geoInterpolate(start, [141.2, 34.6])
  const pts = [MANZANILLO, start]
  for (let i = 1; i <= 120; i++) pts.push(ip(i / 120))
  pts.push([139.75, 35.15], YOKOHAMA)
  return pts
}

export default function RouteMap({ t }) {
  const wrap = useRef(null)
  const svgRef = useRef(null)
  const [w, setW] = useState(900)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [])
  const mobile = w < 640
  const h = Math.round(mobile ? w * 0.82 : w * 0.5)

  const geo = useMemo(() => {
    const sea = { type: 'LineString', coordinates: seaRoute() }
    const road = { type: 'LineString', coordinates: ROAD }
    const proj = geoNaturalEarth1().rotate([-200, mobile ? -26 : -24])
    const pad = mobile ? 26 : 40
    proj.fitExtent(
      [
        [pad, pad + (mobile ? 30 : 10)],
        [w - pad, h - pad - (mobile ? 10 : 0)],
      ],
      { type: 'MultiPoint', coordinates: mobile ? [[-89, 21], [-107, 15], [125, 37], [143, 31], [180, 48], [-150, 18]] : [[-86, 28], [-107, 13], [127, 43], [146, 30], [180, 50], [-160, 12]] },
    )
    const path = geoPath(proj)
    const P = (c) => proj(c)
    return {
      land: path(countries),
      mx: path(MX),
      jp: path(JP),
      grat: path(geoGraticule10()),
      sea: path(sea),
      road: path(road),
      tokyoLeg: path({ type: 'LineString', coordinates: [YOKOHAMA, TOKYO] }),
      pts: { puebla: P(PUEBLA), manz: P(MANZANILLO), yoko: P(YOKOHAMA), tokyo: P(TOKYO) },
      zoomMx: proj([-101, 19.5]),
    }
  }, [w, h, mobile])

  // Animación con el scroll: carretera → barco cruzando el Pacífico → llegada
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const ctx = gsap.context(() => {
      const road = svg.querySelector('.rm-road')
      const sea = svg.querySelector('.rm-sea')
      const leg = svg.querySelector('.rm-leg')
      const ship = svg.querySelector('.rm-ship')
      const truck = svg.querySelector('.rm-truck')
      const lr = road.getTotalLength()
      const ls = sea.getTotalLength()
      const ll = leg.getTotalLength()
      gsap.set(road, { strokeDasharray: lr, strokeDashoffset: lr })
      gsap.set(sea, { strokeDasharray: `${ls}`, strokeDashoffset: ls })
      gsap.set(leg, { strokeDasharray: ll, strokeDashoffset: ll })
      gsap.set('.rm-pop', { scale: 0, transformOrigin: 'center', transformBox: 'fill-box' })
      const place = (el, path, len) => (p) => {
        const a = path.getPointAtLength(p * len)
        const b = path.getPointAtLength(Math.min(len, p * len + 1))
        const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
        el.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang})`)
      }
      const moveTruck = place(truck, road, lr)
      const moveShip = place(ship, sea, ls)
      const st = { r: 0, s: 0 }
      moveTruck(0)
      moveShip(0)
      const tl = gsap.timeline({
        scrollTrigger: { trigger: svg, start: 'top 75%', end: 'bottom 35%', scrub: 0.7 },
      })
      tl.to('.rm-pop.p1', { scale: 1, duration: 0.05, ease: 'back.out(3)' })
        .to(road, { strokeDashoffset: 0, duration: 0.18, ease: 'none' }, '<')
        .to(st, { r: 1, duration: 0.18, ease: 'none', onUpdate: () => moveTruck(st.r) }, '<')
        .to('.rm-pop.p2', { scale: 1, duration: 0.05, ease: 'back.out(3)' })
        .to('.rm-truck', { opacity: 0, duration: 0.03 })
        .to('.rm-ship', { opacity: 1, duration: 0.03 }, '<')
        .to(sea, { strokeDashoffset: 0, duration: 0.55, ease: 'none' })
        .to(st, { s: 1, duration: 0.55, ease: 'none', onUpdate: () => moveShip(st.s) }, '<')
        .to('.rm-pop.p3', { scale: 1, duration: 0.05, ease: 'back.out(3)' })
        .to(leg, { strokeDashoffset: 0, duration: 0.06, ease: 'none' })
        .to('.rm-pop.p4', { scale: 1, duration: 0.05, ease: 'back.out(3)' })
    }, svg)
    return () => ctx.revert()
  }, [geo])

  const { pts } = geo
  const fs = mobile ? 12 : 15
  const label = (p, txt, sub, dx, dy, anchor = 'start', cls = '') => (
    <g transform={`translate(${p[0] + dx} ${p[1] + dy})`}>
      <g className={`rm-label rm-pop ${cls}`}>
      <text textAnchor={anchor} fontSize={fs} className="rm-l1">
        {txt}
      </text>
      {sub && (
        <text textAnchor={anchor} fontSize={fs * 0.78} y={fs * 1.1} className="rm-l2">
          {sub}
        </text>
      )}
      </g>
    </g>
  )

  return (
    <div className="route" ref={wrap}>
      <svg ref={svgRef} width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="route-svg" role="img" aria-label={t.title}>
        <defs>
          <linearGradient id="rmSea" x1="0" x2="1">
            <stop offset="0" stopColor="#f27b2b" />
            <stop offset="1" stopColor="#c8233f" />
          </linearGradient>
          <radialGradient id="rmGlow">
            <stop offset="0" stopColor="#f27b2b" stopOpacity=".45" />
            <stop offset="1" stopColor="#f27b2b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={w} height={h} rx="24" className="rm-ocean" />
        <path d={geo.grat} className="rm-grat" />
        <path d={geo.land} className="rm-land" />
        <path d={geo.mx} className="rm-country" />
        <path d={geo.jp} className="rm-country" />
        <text x={(pts.manz[0] + pts.yoko[0]) / 2} y={h * (mobile ? 0.86 : 0.88)} textAnchor="middle" className="rm-oceanlabel" fontSize={mobile ? 11 : 14}>
          OCÉANO PACÍFICO · 太平洋
        </text>

        <path d={geo.road} className="rm-road" />
        <path d={geo.sea} className="rm-sea-ghost" />
        <path d={geo.sea} className="rm-sea" />
        <path d={geo.tokyoLeg} className="rm-leg" />

        {[
          ['p1', pts.puebla],
          ['p2', pts.manz],
          ['p3', pts.yoko],
          ['p4', pts.tokyo],
        ].map(([k, p]) => (
          <g key={k} transform={`translate(${p[0]} ${p[1]})`}>
            <g className={`rm-pop ${k}`}>
              <circle r={mobile ? 16 : 22} fill="url(#rmGlow)" />
              <circle r={mobile ? 4 : 5.5} className={k === 'p4' || k === 'p1' ? 'rm-dot-main' : 'rm-dot'} />
            </g>
          </g>
        ))}

        {label(pts.puebla, t.from, 'MÉXICO', 4, -30, 'middle', 'p1')}
        {label(pts.manz, t.port, 'MXZLO', -10, 22, 'end', 'p2')}
        {label(pts.yoko, t.arrive, 'JPYOK', mobile ? 6 : -10, mobile ? 26 : 20, mobile ? 'start' : 'end', 'p3')}
        {label(pts.tokyo, t.to, '東京', 10, -12, 'start', 'p4')}

        {/* camión */}
        <g className="rm-truck">
          <g transform="translate(-9 -6)">
            <rect width="12" height="10" rx="1.5" fill="#1a2a6e" />
            <rect x="12" y="3" width="6" height="7" rx="1.5" fill="#f27b2b" />
            <circle cx="4" cy="11" r="2" fill="#2a2340" />
            <circle cx="14" cy="11" r="2" fill="#2a2340" />
          </g>
        </g>
        {/* barco portacontenedores */}
        <g className="rm-ship" opacity="0">
          <g transform="translate(-14 -8) scale(1.1)">
            <path d="M0 8 h26 l-4 7 h-19 z" fill="#1a2a6e" />
            <rect x="4" y="2" width="5" height="6" fill="#c8233f" />
            <rect x="9.5" y="3" width="5" height="5" fill="#f27b2b" />
            <rect x="15" y="1" width="5" height="7" fill="#e0a526" />
            <rect x="20" y="-2" width="3" height="10" fill="#f6ecd6" />
          </g>
        </g>
      </svg>

      <div className="route-legs">
        {t.legs.map((l) => (
          <div key={l.k} className={`leg leg-${l.k}`}>
            <span className="leg-ic" aria-hidden>
              <LegIcon k={l.k} />
            </span>
            <div>
              <small>{l.t}</small>
              <b>{l.v}</b>
              <span>{l.d}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="route-note">{t.note}</p>
    </div>
  )
}

function LegIcon({ k }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (k === 'truck')
    return (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M2 6h11v10H2zM13 10h4l3 3v3h-7z" {...p} />
        <circle cx="6" cy="17.5" r="1.8" {...p} />
        <circle cx="17" cy="17.5" r="1.8" {...p} />
      </svg>
    )
  if (k === 'ship')
    return (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M3 14h18l-3 5H6zM6 14V9h12v5M10 9V5h4v4" {...p} />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" {...p} />
      <circle cx="12" cy="10" r="2.2" {...p} />
    </svg>
  )
}
