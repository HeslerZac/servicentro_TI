import { PartialType } from '@nestjs/mapped-types';
import { CrearBodegaDto } from './crear-bodega.dto';

export class ActualizarBodegaDto extends PartialType(CrearBodegaDto) {}
