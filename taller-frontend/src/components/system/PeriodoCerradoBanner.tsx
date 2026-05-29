import { usePeriodoCerrado } from '../../hooks/useCierresEstado'

export default function PeriodoCerradoBanner() {
  const { ultimoCierre } = usePeriodoCerrado()
  if (!ultimoCierre) return null
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-900 text-sm">
      <div className="mx-auto max-w-7xl px-4 py-2">
        Período cerrado del {ultimoCierre.desde} al {ultimoCierre.hasta}. Las operaciones con fechas en ese rango están bloqueadas.
      </div>
    </div>
  )
}

