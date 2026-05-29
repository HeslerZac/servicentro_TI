import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { useProveedores } from '../../hooks/useProveedores';

type Proveedor = { id: string; nombre: string; nit?: string; telefono?: string };

export function ProveedoresList() {
  const { list: proveedoresQuery } = useProveedores();
  const { data: items, isLoading, error } = proveedoresQuery();

  const columns = useMemo<ColumnDef<Proveedor>[]>(() => [
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'nit', header: 'NIT' },
    { accessorKey: 'telefono', header: 'Teléfono' },
  ], []);

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;

  return (
    <Card>
      <CardHeader title="Proveedores" actions={<Link className="btn" to="/proveedores/nuevo">Nuevo</Link>} />
      <DataTable columns={columns} data={items || []} />
    </Card>
  );
}
