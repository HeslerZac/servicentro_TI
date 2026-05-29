import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'

type ToastKind = 'info' | 'success' | 'error' | 'warning'

type ToastItem = {
  id: number
  kind: ToastKind
  message: string
  duration: number
}

type ToastContextValue = {
  show: (kind: ToastKind, message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(1)

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((kind: ToastKind, message: string, duration = 3500) => {
    const id = idRef.current++
    const item: ToastItem = { id, kind, message, duration }
    setToasts((prev) => [...prev, item])
    window.setTimeout(() => remove(id), duration)
  }, [remove])

  const value = useMemo<ToastContextValue>(() => ({
    show,
    info: (m, d) => show('info', m, d),
    success: (m, d) => show('success', m, d),
    error: (m, d) => show('error', m, d),
    warning: (m, d) => show('warning', m, d),
  }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function Toast({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const colors = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    success: 'border-green-200 bg-green-50 text-green-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
  }[item.kind]

  return (
    <div className={clsx('pointer-events-auto rounded-md border px-3 py-2 shadow-md min-w-64 max-w-sm', colors)}>
      <div className="flex items-start gap-3">
        <div className="flex-1 text-sm">{item.message}</div>
        <button className="text-xs text-gray-600 hover:text-gray-800" onClick={onClose}>×</button>
      </div>
    </div>
  )
}
