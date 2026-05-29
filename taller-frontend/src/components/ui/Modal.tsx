import React from 'react'
import { clsx } from 'clsx'

export function Modal({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: React.ReactNode; className?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={clsx('relative z-10 w-full max-w-lg rounded-xl bg-white p-4 shadow-xl', className)}>
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
    </div>
  )
}

