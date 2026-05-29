import { PartialType } from '@nestjs/mapped-types';
import { CrearMarcaDto } from './crear-marca.dto';

export class ActualizarMarcaDto extends PartialType(CrearMarcaDto) {}
