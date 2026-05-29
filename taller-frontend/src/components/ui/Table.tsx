import { clsx } from 'clsx'
import React from 'react'

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('overflow-x-auto rounded-lg border border-gray-200 bg-white', className)}>
      <table className="table">
        {children}
      </table>
    </div>
  )
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead><tr className="bg-gray-50 border-b">{children}</tr></thead>
}

export function Th({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <th className={clsx('th', className)} colSpan={colSpan}>{children}</th>
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="border-b">{children}</tr>
}

export function Td({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td className={clsx('td', className)} colSpan={colSpan}>{children}</td>
}
