/** Local SVG avatar — no external CDN required. */
const COLORS = [
  '#2563EB', '#0891B2', '#059669', '#D97706',
  '#DC2626', '#7C3AED', '#DB2777', '#4F46E5',
]

function hashSeed(seed) {
  const s = String(seed ?? '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function initialsFromName(name = '?') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function avatarDataUri(name, seed = name) {
  const initials = initialsFromName(name)
  const bg = COLORS[hashSeed(seed) % COLORS.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
  <rect width="150" height="150" fill="${bg}"/>
  <text x="75" y="75" dy="0.35em" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="56" font-weight="600">${initials}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
