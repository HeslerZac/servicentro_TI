// no react import needed with react-jsx

type Props = {
  values: number[]
  width?: number
  height?: number
  strokeClassName?: string
}

export function Sparkline({ values, width = 300, height = 60, strokeClassName = 'stroke-blue-600' }: Props) {
  if (!values.length) return <svg width={width} height={height} />
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = 4
  const W = width - pad * 2
  const H = height - pad * 2
  const range = max - min || 1
  const step = W / Math.max(values.length - 1, 1)
  const points = values.map((v, i) => {
    const x = pad + i * step
    const y = pad + H - ((v - min) / range) * H
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="block">
      <polyline
        fill="none"
        strokeWidth={2}
        className={strokeClassName}
        points={points}
      />
    </svg>
  )
}
