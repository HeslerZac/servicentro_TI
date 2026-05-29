import { IsUUID } from 'class-validator';

export class AsignarMarcaDto {
  @IsUUID()
  marcaId: string;
}
