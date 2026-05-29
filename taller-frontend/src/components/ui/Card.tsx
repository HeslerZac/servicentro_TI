import { clsx } from 'clsx'
import React from 'react'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx('card', className)}>{children}</div>
}

export function CardHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}

