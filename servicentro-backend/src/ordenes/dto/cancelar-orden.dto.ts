import { IsOptional, IsString } from 'class-validator';

export class CancelarOrdenDto {
  @IsOptional()
  @IsString()
  motivo?: string;
}
