import { clsx } from 'clsx'
import React from 'react'

type Props = {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'error' | 'warning'
}

export function Alert({ children, variant = 'info' }: Props) {
  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  }[variant]
  return (
    <div className={clsx('rounded-md border px-3 py-2 text-sm', styles)}>
      {children}
    </div>
  )
}

