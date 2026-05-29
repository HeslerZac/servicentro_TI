import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader } from '../../components/ui/Card';
import { useProveedores } from '../../hooks/useProveedores';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  nit: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ProveedorForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const { create } = useProveedores();
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      await create.mutateAsync(data);
      toast.success('Proveedor creado');
      navigate('/proveedores');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error creando proveedor');
    }
  };

  return (
    <Card>
      <CardHeader title="Nuevo Proveedor" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Nombre</label>
          <input className="input" {...register('nombre')} />
          {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className="label">NIT</label>
          <input className="input" {...register('nit')} />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input className="input" {...register('telefono')} />
        </div>
        <div>
          <label className="label">Dirección</label>
          <input className="input" {...register('direccion')} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/proveedores')}>Cancelar</button>
          <button type="submit" className="btn">Guardar</button>
        </div>
      </form>
    </Card>
  );
}
