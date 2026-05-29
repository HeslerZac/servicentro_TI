export function exportToCsv(filename: string, rows: any[], columns: { key: string; header: string }[]) {
  const esc = (s: any) => {
    const v = String(s ?? '')
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v
  }
  const get = (obj: any, path: string) => path.split('.').reduce((acc: any, k: string) => (acc ? acc[k] : undefined), obj)
  const header = columns.map(c => esc(c.header)).join(',')
  const lines = [header]
  for (const r of rows) {
    lines.push(columns.map(c => esc(get(r, c.key))).join(','))
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

