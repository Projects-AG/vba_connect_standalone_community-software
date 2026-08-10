/**
 * Loop brand mark — animated SVG (no black PNG plate).
 * sizes: 'sm' | 'md' | 'lg' | 'hero'
 */
export default function LoopMark({ size = 'md', className = '', animated = true }) {
  const dims = { sm: 28, md: 40, lg: 72, hero: 112 }
  const s = dims[size] || dims.md
  const animClass = animated ? 'loop-mark--animated' : ''

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`loop-mark ${animClass} ${className}`.trim()}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="loopRingGrad" x1="8" y1="70" x2="92" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2B7BFF" />
          <stop offset="0.45" stopColor="#7B3FE4" />
          <stop offset="1" stopColor="#E03CA8" />
        </linearGradient>
        <linearGradient id="loopNodeGrad" x1="20" y1="50" x2="80" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2B7BFF" />
          <stop offset="0.5" stopColor="#7B3FE4" />
          <stop offset="1" stopColor="#E03CA8" />
        </linearGradient>
      </defs>

      {/* Solid arc (left → top → bottom-left) */}
      <path
        className="loop-mark__arc"
        d="M50 14 A36 36 0 1 0 78.5 72"
        stroke="url(#loopRingGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Dotted completion (top-right → right) */}
      <g className="loop-mark__dots" stroke="url(#loopRingGrad)" fill="url(#loopNodeGrad)">
        <circle cx="66" cy="17.5" r="2.2" />
        <circle cx="74" cy="23" r="2.1" />
        <circle cx="80.5" cy="31" r="2" />
        <circle cx="84.5" cy="40.5" r="1.9" />
        <circle cx="85.5" cy="50.5" r="1.8" />
        <circle cx="83.5" cy="60.5" r="1.7" />
      </g>

      {/* Orbiting nodes */}
      <g className="loop-mark__nodes">
        <circle cx="18" cy="42" r="4.2" fill="url(#loopNodeGrad)" className="loop-mark__node" />
        <circle cx="50" cy="14" r="4.2" fill="url(#loopNodeGrad)" className="loop-mark__node" />
        <circle cx="50" cy="86" r="4.2" fill="url(#loopNodeGrad)" className="loop-mark__node" />
      </g>

      {/* Person silhouette */}
      <g className="loop-mark__person" fill="#0B1638">
        <circle cx="50" cy="42" r="11" />
        <path d="M28 72c0-11.6 9.8-18 22-18s22 6.4 22 18v2H28v-2z" />
      </g>
    </svg>
  )
}
