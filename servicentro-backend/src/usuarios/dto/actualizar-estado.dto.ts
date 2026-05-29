import { IsBoolean } from 'class-validator';

export class ActualizarEstadoDto {
  @IsBoolean()
  estaActivo: boolean;
}
