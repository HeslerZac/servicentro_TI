export function EstadoPill({ estado }: { estado: 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA' | string }) {
  const map: Record<string, string> = {
    EN_CURSO: 'bg-blue-50 text-blue-700 border-blue-200',
    FINALIZADA: 'bg-green-50 text-green-700 border-green-200',
    CANCELADA: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  const cls = map[estado] || 'bg-gray-50 text-gray-700 border-gray-200'
  return <span className={`px-2 py-0.5 rounded text-xs border ${cls}`}>{estado}</span>
}

