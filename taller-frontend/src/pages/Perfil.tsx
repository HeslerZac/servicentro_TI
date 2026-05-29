import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'
import { useUsuarios } from '../hooks/useUsuarios'
import { useAuth } from '../auth/AuthContext'

const schema = z.object({
  passwordActual: z.string().min(1, 'La contraseña actual es requerida'),
  nuevaPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmarPassword: z.string(),
}).refine((data) => data.nuevaPassword === data.confirmarPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarPassword'],
});

type FormData = z.infer<typeof schema>;

export function Perfil() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });
  const toast = useToast();
  const { usuario } = useAuth();
  const { changePassword } = useUsuarios();

  const onSubmit = async (data: FormData) => {
    try {
      await changePassword.mutateAsync({ ...data, id: usuario!.id });
      toast.success('Contraseña actualizada correctamente');
      reset();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error actualizando la contraseña');
    }
  };

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader title="Cambiar mi Contraseña" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Contraseña Actual</label>
            <input className="input" type="password" {...register('passwordActual')} />
            {errors.passwordActual && <div className="text-sm text-red-600">{errors.passwordActual.message}</div>}
          </div>
          <div>
            <label className="label">Nueva Contraseña</label>
            <input className="input" type="password" {...register('nuevaPassword')} />
            {errors.nuevaPassword && <div className="text-sm text-red-600">{errors.nuevaPassword.message}</div>}
          </div>
          <div>
            <label className="label">Confirmar Nueva Contraseña</label>
            <input className="input" type="password" {...register('confirmarPassword')} />
            {errors.confirmarPassword && <div className="text-sm text-red-600">{errors.confirmarPassword.message}</div>}
          </div>
          <div className="flex gap-2">
            <button className="btn" disabled={isSubmitting}>Actualizar Contraseña</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
