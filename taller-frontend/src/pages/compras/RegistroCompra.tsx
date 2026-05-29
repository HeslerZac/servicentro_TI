import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader } from '../../components/ui/Card';
import { useProveedores } from '../../hooks/useProveedores';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { ProductoPickerModal } from '../../components/ui/ProductoPickerModal';
import { useCompras } from '../../hooks/useCompras';

const schema = z.object({
  proveedorId: z.string().min(1, 'Proveedor es requerido'),
  fecha: z.string().min(1, 'Fecha es requerida'),
  detalles: z.array(z.object({
    productoId: z.string(),
    bodegaId: z.string(),
    cantidad: z.number().positive(),
    costoUnitario: z.number().min(0),
  })).min(1, 'Debe agregar al menos un producto'),
});

type FormData = z.infer<typeof schema>;

export function RegistroCompra() {
  const { register, control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({ resolver: zodResolver(schema) as any });
  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' });
  
  const { data: proveedores } = useProveedores().list();
  const { create: createCompra } = useCompras();
  
  const toast = useToast();
  const navigate = useNavigate();
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [detalleUI, setDetalleUI] = useState<Array<{ producto: string; bodega: string }>>([]);

  const handleSelectProducto = (producto: any, bodega: any) => {
    append({ productoId: producto.id, bodegaId: bodega.id, cantidad: 1, costoUnitario: 0 });
    setDetalleUI((prev) => [...prev, { producto: producto.descripcion, bodega: bodega.nombre }]);
    setPickerOpen(false);
  };

  

  const onSubmit = async (data: FormData) => {
    try {
      await createCompra.mutateAsync(data);
      toast.success('Compra registrada con éxito');
      navigate('/compras'); // Assuming a list view for purchases will be created
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error registrando la compra');
    }
  };

  return (
    <>
      <Card>
        <CardHeader title="Registrar Compra a Proveedor" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Proveedor</label>
              <select className="input" {...register('proveedorId')}>
                <option value="">Seleccione un proveedor</option>
                {proveedores?.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              {errors.proveedorId && <p className="text-red-500 text-sm">{errors.proveedorId.message}</p>}
            </div>
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="input" {...register('fecha')} />
              {errors.fecha && <p className="text-red-500 text-sm">{errors.fecha.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Productos</h3>
              <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}>Buscar Producto</button>
            </div>
            {fields.map((field, index) => {
              const cantidad = Number(watch(`detalles.${index}.cantidad`) || 0);
              const costo = Number(watch(`detalles.${index}.costoUnitario`) || 0);
              const subtotal = (cantidad * costo).toFixed(2);
              return (
                <div key={field.id} className="grid grid-cols-6 gap-2 items-center">
                  <div className="col-span-2 text-sm">
                    <div className="font-medium">{detalleUI[index]?.producto || 'Producto seleccionado'}</div>
                    <div className="text-gray-600">{detalleUI[index]?.bodega || ''}</div>
                  </div>
                  <input type="number" className="input" placeholder="Cantidad" {...register(`detalles.${index}.cantidad`, { valueAsNumber: true })} />
                  <input type="number" className="input" placeholder="Costo Unitario" {...register(`detalles.${index}.costoUnitario`, { valueAsNumber: true })} />
                  <div className="text-right">Q {subtotal}</div>
                  <button type="button" className="btn btn-danger" onClick={() => { remove(index); setDetalleUI((prev) => prev.filter((_, i) => i !== index)); }}>Quitar</button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-8 items-center border-t pt-3 mt-4 text-sm">
            <div className="text-gray-600">
              Total: <span className="font-semibold">Q {fields.reduce((acc, _f, i) => acc + Number(watch(`detalles.${i}.cantidad`) || 0) * Number(watch(`detalles.${i}.costoUnitario`) || 0), 0).toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancelar</button>
              <button type="submit" className="btn">Guardar Compra</button>
            </div>
          </div>
        </form>
      </Card>
      {isPickerOpen && <ProductoPickerModal onClose={() => setPickerOpen(false)} onSelect={handleSelectProducto} />}
    </>
  );
}












