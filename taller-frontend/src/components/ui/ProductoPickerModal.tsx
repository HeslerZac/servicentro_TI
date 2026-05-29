import { useState, useMemo } from 'react';
import { useProductos } from '../../hooks/useProductos';
import { useBodegas } from '../../hooks/useBodegas';
import { DataTable } from './DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { useDebounce } from '../../lib/useDebounce';

interface ProductoPickerModalProps {
  onClose: () => void;
  onSelect: (producto: any, bodega: any) => void;
}

export function ProductoPickerModal({ onClose, onSelect }: ProductoPickerModalProps) {
  const [filters, setFilters] = useState({ search: '', brand: '', category: '' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(filters.search, 300);
  const { data: bodegasResp } = useBodegas().list();

  const { data, isLoading, error } = useProductos().list({
    ...filters,
    search: debouncedSearch,
    page,
    limit,
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / (limit || 1)));

  const columns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: 'codigo', header: 'Código' },
    { accessorKey: 'descripcion', header: 'Descripción' },
    { accessorFn: (row) => (typeof row.marca === 'string' ? row.marca : row.marca?.nombre), header: 'Marca' },
    {
      header: 'Stock por Bodega',
            cell: ({ row }) => (
        <div>
          <ul className="mb-2">
            {row.original.stockPorBodega.map((stock: any) => (
              <li key={stock.bodegaId} className="flex justify-between items-center">
                <span>
                  {stock.nombreBodega}: {Number(stock.cantidad || 0).toFixed(3)}
                </span>
                <button
                  className="btn btn-sm ml-2"
                  onClick={() => onSelect(row.original, { id: stock.bodegaId, nombre: stock.nombreBodega })}
                >
                  Seleccionar
                </button>
              </li>
            ))}
          </ul>
          <div className="flex justify-end">
            <button
              className="btn btn-sm"
              onClick={() => {
                const fallback = row.original.stockPorBodega[0]
                  ? { id: row.original.stockPorBodega[0].bodegaId, nombre: row.original.stockPorBodega[0].nombreBodega }
                  : ((bodegasResp && bodegasResp[0]) ? { id: bodegasResp[0].id, nombre: bodegasResp[0].nombre } : null);
                if (!fallback) return;
                onSelect(row.original, fallback);
                onClose();
              }}
            >
              Seleccionar
            </button>
          </div>
        </div>
      ),
    },
  ], [onSelect]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Buscar Producto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Buscar por código o descripción..."
            className="input"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Marca"
            className="input"
            value={filters.brand}
            onChange={(e) => setFilters((prev) => ({ ...prev, brand: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Categoría"
            className="input"
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          />
        </div>

        {isLoading && <p>Cargando...</p>}
        {error && <p className="text-red-500">Error al cargar productos</p>}

        {!isLoading && !error && (
          <>
            <DataTable columns={columns} data={items} />
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Total: {total} • Página {page} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-600">Por página</label>
                <select
                  className="input w-24"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <button
                  className="btn btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <button
                  className="btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}

        <div className="mt-4 flex justify-end">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}







