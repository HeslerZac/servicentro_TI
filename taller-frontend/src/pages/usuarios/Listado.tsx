import { useUsuarios } from '../../hooks/useUsuarios'
import { Card, CardHeader } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { useState, useMemo } from 'react'
import { RequireRole } from '../../auth/RequireRole'
import { Link } from 'react-router-dom'
import { DataTable } from '../../components/ui/DataTable'
import type { ColumnDef } from '@tanstack/react-table'

type Usuario = {
  id: string
  nombreUsuario: string
  nombre?: string
  telefono?: string
  direccion?: string
  rol: string
  estaActivo: boolean
}

export default function UsuariosListado() {
  return (
    <RequireRole roles={["ADMINISTRADOR"]}>
      <UsuariosAdmin />
    </RequireRole>
  )
}

function UsuariosAdmin() {
  const { list, cambiarRol, cambiarEstado } = useUsuarios()
  const toast = useToast()
  const [mostrarDesactivados, setMostrarDesactivados] = useState(false)
  const q = list({ includeInactive: mostrarDesactivados })
  const items = q.data || []

  const onRol = async (u: Usuario) => {
    const rol = window.prompt('Nuevo rol (ADMINISTRADOR|SECRETARIA|VENDEDOR)', u.rol)
    if (!rol) return
    try { await cambiarRol.mutateAsync({ id: u.id, rol }); toast.success('Rol actualizado') } catch (e: any) { toast.error(e?.response?.data?.message || 'Error') }
  }

  const onEstado = async (u: Usuario) => {
    try { await cambiarEstado.mutateAsync({ id: u.id, estaActivo: !u.estaActivo }); toast.success('Estado actualizado') } catch (e: any) { toast.error(e?.response?.data?.message || 'Error') }
  }

  const columns = useMemo<ColumnDef<Usuario>[]>(() => [
    { accessorKey: 'nombreUsuario', header: 'Usuario' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'telefono', header: 'Teléfono' },
    { accessorKey: 'direccion', header: 'Dirección' },
    { accessorKey: 'rol', header: 'Rol' },
    {
      id: 'acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => onRol(row.original)}>Cambiar rol</button>
          <button className="btn btn-danger" onClick={() => onEstado(row.original)}>Desactivar</button>
        </div>
      ),
    },
  ], [])

  return (
    <Card>
      <CardHeader title={`Usuarios (${items.length})`} actions={<div className="flex items-center gap-3"><Link className="btn" to="/usuarios/nuevo">Nuevo</Link><label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={mostrarDesactivados} onChange={(e) => setMostrarDesactivados(e.target.checked)} /> Mostrar desactivados</label></div>} />
      <DataTable columns={columns} data={items} />
    </Card>
  )
}
