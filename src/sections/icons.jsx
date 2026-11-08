// Íconos y azulejo de Talavera en SVG (dibujados a mano, sin librerías)

export function TileSVG({ className = '' }) {
  const petals = Array.from({ length: 8 })
  return (
    <svg viewBox="0 0 100 100" className={`tile ${className}`} aria-hidden>
      <rect width="100" height="100" fill="#f6ecd6" />
      {[[0, 0], [100, 0], [100, 100], [0, 100]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="20" fill="#1c3f94" />
      ))}
      <g transform="translate(50 50)">
        {petals.map((_, i) => (
          <ellipse key={i} cx="0" cy="-20" rx="7" ry="17" fill={i % 2 ? '#122a66' : '#1c3f94'} transform={`rotate(${i * 45})`} />
        ))}
        <circle r="9" fill="#e0a526" />
        <circle r="3.5" fill="#f6ecd6" />
        {[45, 135, 225, 315].map((a) => (
          <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 36} cy={Math.sin((a * Math.PI) / 180) * 36} r="3.5" fill="#e0a526" />
        ))}
      </g>
    </svg>
  )
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function Icon({ name }) {
  switch (name) {
    case 'orange':
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="26" r="15" {...stroke} />
          <path d="M24 11 c0 -4 4 -6 8 -5 c-1 4 -4 6 -8 5" {...stroke} />
          <circle cx="19" cy="22" r="1.4" fill="currentColor" />
          <circle cx="28" cy="30" r="1.4" fill="currentColor" />
          <circle cx="22" cy="32" r="1.4" fill="currentColor" />
        </svg>
      )
    case 'lime':
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r="17" {...stroke} />
          <circle cx="24" cy="24" r="12" {...stroke} strokeWidth="1.6" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4
            return <line key={i} x1="24" y1="24" x2={24 + Math.cos(a) * 12} y2={24 + Math.sin(a) * 12} {...stroke} strokeWidth="1.6" />
          })}
        </svg>
      )
    case 'berry':
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          {[[18, 26], [30, 26], [24, 34], [24, 18]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="7" {...stroke} />
          ))}
          <path d="M24 11 C24 7 28 5 31 6" {...stroke} />
        </svg>
      )
    case 'dried':
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <path d="M14 30 C10 20 18 10 26 12 C36 14 40 26 32 34 C26 40 17 37 14 30 Z" {...stroke} />
          <path d="M18 26 c3 -1 5 1 8 0 M22 32 c3 -1 5 1 8 0 M20 20 c3 -1 5 1 8 0" {...stroke} strokeWidth="1.6" />
        </svg>
      )
    case 'zero':
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <ellipse cx="22" cy="26" rx="9" ry="13" {...stroke} />
          <circle cx="36" cy="13" r="4" {...stroke} />
        </svg>
      )
    case 'glass':
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <path d="M20 6 h8 v6 c0 3 6 5 6 10 v18 a2 2 0 0 1 -2 2 h-16 a2 2 0 0 1 -2 -2 v-18 c0 -5 6 -7 6 -10 z" {...stroke} />
          <path d="M18 30 a6 6 0 1 0 12 0" {...stroke} strokeWidth="1.8" />
          <path d="M28 30 l2 0 l-1 -2.4" {...stroke} strokeWidth="1.8" />
        </svg>
      )
    case 'cap':
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <rect x="12" y="14" width="24" height="12" rx="3" {...stroke} />
          <path d="M16 14 v12 M20 14 v12 M24 14 v12 M28 14 v12 M32 14 v12" {...stroke} strokeWidth="1.4" />
          <path d="M18 34 h12 M24 30 v8" {...stroke} />
        </svg>
      )
    case 'box':
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <path d="M8 16 L24 8 L40 16 L40 34 L24 42 L8 34 Z" {...stroke} />
          <path d="M8 16 L24 24 L40 16 M24 24 V42" {...stroke} />
        </svg>
      )
    default:
      return null
  }
}
