export function formatQ(n: number | string | null | undefined) {
  const v = typeof n === 'string' ? Number(n) : (n ?? 0)
  return `Q ${Number(v || 0).toFixed(2)}`
}

