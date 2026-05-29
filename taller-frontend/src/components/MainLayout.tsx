import { Link, Outlet } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { Sidebar } from './Sidebar'
import { useAuth } from '../auth/AuthContext'
import { PeriodoCerradoProvider } from '../hooks/useCierresEstado'
import PeriodoCerradoBanner from './system/PeriodoCerradoBanner'
import { User } from 'lucide-react'
import { useCaja } from '../hooks/useCaja'
import { Modal, ModalHeader } from '../components/ui/Modal'
import { useToast } from './ui/Toast'

const STORAGE_KEY = 'ui.sidebar.collapsed'

export function MainLayout() {
  const { isAuthenticated, usuario, logout } = useAuth()
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const { getSesionActual, abrir, cerrar } = useCaja()
  const sesionQuery = getSesionActual()
  const sesion = sesionQuery.data

  const [openAbrir, setOpenAbrir] = useState(false)
  const [openCerrar, setOpenCerrar] = useState(false)
  const [saldoInicial, setSaldoInicial] = useState('0.00')
  const [saldoReal, setSaldoReal] = useState('0.00')
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0') } catch {}
  }, [collapsed])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownRef])

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((s) => !s)} />

      <div className="flex-1 flex min-w-0 flex-col">
        <PeriodoCerradoProvider>
          <header className="h-14 border-b bg-white">
            <div className="h-full mx-auto max-w-7xl px-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">{isAuthenticated ? 'Panel de gestión' : 'Bienvenido'}</div>
              <div className="flex items-center gap-3 text-sm">
                {isAuthenticated && (
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${sesion ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      Caja: {sesion ? 'ABIERTA' : 'CERRADA'}
                    </span>
                    {sesion ? (
                      <button className="btn btn-secondary btn-xs" onClick={() => setOpenCerrar(true)} disabled={cerrar.isPending}>
                        Cerrar caja
                      </button>
                    ) : (
                      <button className="btn btn-primary btn-xs" onClick={() => setOpenAbrir(true)} disabled={abrir.isPending}>
                        Abrir caja
                      </button>
                    )}
                  </div>
                )}
                {isAuthenticated && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100"
                    >
                      <User size={18} />
                      <span className="text-gray-700 hidden sm:inline">
                        {(usuario as any)?.nombre || usuario?.nombreUsuario} ({usuario?.rol})
                      </span>
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <Link to="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Mi Perfil
                        </Link>
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Modales de Caja */}
          <Modal open={openAbrir} onClose={() => setOpenAbrir(false)}>
            <ModalHeader title="Abrir caja" onClose={() => setOpenAbrir(false)} />
            <div className="space-y-3">
              <div>
                <label className="label">Saldo inicial (efectivo)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="btn"
                  onClick={async () => {
                    try {
                      await abrir.mutateAsync({ saldoInicialEfectivo: (Number(saldoInicial || 0)).toFixed(2) })
                      toast.success('Caja abierta')
                      setOpenAbrir(false)
                    } catch (e: any) {
                      toast.error(e?.response?.data?.message || 'No se pudo abrir caja')
                    }
                  }}
                >
                  Abrir
                </button>
                <button className="btn btn-secondary" onClick={() => setOpenAbrir(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>

          <Modal open={openCerrar} onClose={() => setOpenCerrar(false)}>
            <ModalHeader title="Cerrar caja" onClose={() => setOpenCerrar(false)} />
            <div className="space-y-3">
              <div>
                <label className="label">Saldo real contado (efectivo)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={saldoReal}
                  onChange={(e) => setSaldoReal(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Observaciones (opcional)</label>
                <input className="input" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button
                  className="btn"
                  onClick={async () => {
                    try {
                      await cerrar.mutateAsync({
                        saldoRealEfectivo: (Number(saldoReal || 0)).toFixed(2),
                        observaciones: observaciones || undefined,
                      })
                      toast.success('Caja cerrada')
                      setOpenCerrar(false)
                    } catch (e: any) {
                      toast.error(e?.response?.data?.message || 'No se pudo cerrar caja')
                    }
                  }}
                >
                  Cerrar
                </button>
                <button className="btn btn-secondary" onClick={() => setOpenCerrar(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>

          <PeriodoCerradoBanner />
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-6">
              <Outlet />
            </div>
          </main>
        </PeriodoCerradoProvider>
      </div>
    </div>
  )
}

