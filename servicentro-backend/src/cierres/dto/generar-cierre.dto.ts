import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

enum PeriodoCierre {
  DIARIO = 'DIARIO',
  SEMANAL = 'SEMANAL',
  MENSUAL = 'MENSUAL',
}

export class GenerarCierreDto {
  @IsEnum(PeriodoCierre)
  periodo: PeriodoCierre;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
