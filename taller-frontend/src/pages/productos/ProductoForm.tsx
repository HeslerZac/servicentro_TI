import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../auth/AuthContext'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProductos } from '../../hooks/useProductos'
import { useCatalogos } from '../../hooks/useCatalogos'
import { useBodegas } from '../../hooks/useBodegas'
import { Combobox } from '../../components/ui/Combobox'

const schema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  marcaId: z.string().optional(),
  categoriaId: z.string().optional(),
  medida: z.string().optional(),
  costo: z.coerce.number().min(0, 'El costo debe ser un número positivo'),
  precioA: z.coerce.number().min(0, 'El precio A debe ser un número positivo'),
  precioB: z.coerce.number().min(0, 'El precio B debe ser un número positivo'),
  precioMayorista: z.coerce.number().min(0, 'El precio mayorista debe ser un número positivo'),
  bodegaId: z.string().optional(), stockInicial: z.coerce.number().min(0, "El stock debe ser >= 0").optional(),});

type FormData = z.infer<typeof schema>;

export function ProductoForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const nav = useNavigate();
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';
  const toast = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const { get: getProducto, create: createProducto, update: updateProducto } = useProductos();
  const { marcas, categorias } = useCatalogos();

  const { data: productoData, isLoading: isLoadingProducto } = (mode === 'edit' && id)
    ? (getProducto(id) as any)
    : ({ data: undefined, isLoading: false } as any);
  const { data: marcasList } = marcas();
  const { data: categoriasList } = categorias();
  const { list: listarBodegas } = useBodegas();
  const { data: bodegasList } = listarBodegas();

  const costo = watch('costo');

  useEffect(() => {
    if (mode === 'edit' && productoData) {
      reset({
        codigo: productoData.codigo,
        descripcion: productoData.descripcion,
        marcaId: productoData.marca?.id || '',
        categoriaId: productoData.categoria?.id || '',
        medida: productoData.medida || '',
        costo: Number(productoData.costo),
        precioA: Number(productoData.precioA),
        precioB: Number(productoData.precioB),
        precioMayorista: Number(productoData.precioMayorista),
      });
    }
  }, [mode, productoData, reset]);

  useEffect(() => {
    if (costo !== undefined && !Number.isNaN(costo)) {
      const calc = (mult: number) => Math.round(costo * mult * 100) / 100;
      setValue('precioA', calc(1.5));
      setValue('precioB', calc(1.35));
      setValue('precioMayorista', calc(1.2));
    }
  }, [costo, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      if (mode === 'create') {
        await createProducto.mutateAsync(data);
        toast.success('Producto creado');
      } else if (id) {
        await updateProducto.mutateAsync({ id, dto: data });
        toast.success('Producto actualizado');
      }
      nav('/productos');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Error guardando';
      toast.error(msg);
    }
  };

  if (isLoadingProducto) return <div className="flex items-center gap-2 text-sm text-gray-600"><Spinner /> Cargando...</div>;

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader title={`${mode === 'create' ? 'Nuevo' : 'Editar'} producto`} />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Código</label>
            <input className="input" {...register('codigo')} disabled={mode === 'edit'} />
            {errors.codigo && <p className="text-red-500 text-sm">{errors.codigo.message}</p>}
          </div>
          <div>
            <label className="label">Descripción</label>
            <input className="input" {...register('descripcion')} />
            {errors.descripcion && <p className="text-red-500 text-sm">{errors.descripcion.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Combobox<any>
              label="Marca"
              options={marcasList || []}
              value={watch('marcaId') || ''}
              onChange={(value) => setValue('marcaId', value)}
              displayValue={(item) => item.nombre}
              valueKey={(item) => item.id}
              error={errors.marcaId?.message}
            />
            <Combobox<any>
              label="Categoría"
              options={categoriasList || []}
              value={watch('categoriaId') || ''}
              onChange={(value) => setValue('categoriaId', value)}
              displayValue={(item) => item.nombre}
              valueKey={(item) => item.id}
              error={errors.categoriaId?.message}
            />
          </div>
          <div>
            <label className="label">Medida</label>
            <input className="input" {...register('medida')} />
            {errors.medida && <p className="text-red-500 text-sm">{errors.medida.message}</p>}
          </div>
                    {mode === 'create' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Combobox<any>
                label="Bodega inicial"
                options={bodegasList || []}
                value={watch('bodegaId') || ''}
                onChange={(value) => setValue('bodegaId', value)}
                displayValue={(b) => b.nombre}
                valueKey={(b) => b.id}
                error={(errors as any)?.bodegaId?.message}
              />
              <div>
                <label className="label">Stock inicial</label>
                <input className="input" type="number" step="0.001" {...register('stockInicial', { valueAsNumber: true })} />
                {(errors as any)?.stockInicial && <p className="text-red-500 text-sm">{(errors as any).stockInicial.message}</p>}
              </div>
            </div>
          )}<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Costo</label>
              <input className="input" type="number" step="0.01" {...register('costo', { valueAsNumber: true })} />
              {errors.costo && <p className="text-red-500 text-sm">{errors.costo.message}</p>}
            </div>
            <div>
              <label className="label">Precio A</label>
              <input className="input" type="number" step="0.01" {...register('precioA', { valueAsNumber: true })} disabled={!esAdmin} />
              {errors.precioA && <p className="text-red-500 text-sm">{errors.precioA.message}</p>}
            </div>
            <div>
              <label className="label">Precio B</label>
              <input className="input" type="number" step="0.01" {...register('precioB', { valueAsNumber: true })} disabled={!esAdmin} />
              {errors.precioB && <p className="text-red-500 text-sm">{errors.precioB.message}</p>}
            </div>
            <div>
              <label className="label">Precio Mayorista</label>
              <input className="input" type="number" step="0.01" {...register('precioMayorista', { valueAsNumber: true })} disabled={!esAdmin} />
              {errors.precioMayorista && <p className="text-red-500 text-sm">{errors.precioMayorista.message}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn" type="submit" disabled={isSubmitting}>Guardar</button>
            <button className="btn btn-secondary" type="button" onClick={() => nav('/productos')}>Cancelar</button>
          </div>
        </form>
      </Card>
    </div>
  );
}








