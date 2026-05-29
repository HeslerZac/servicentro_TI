import { PartialType } from '@nestjs/mapped-types';
import { CrearVehiculoDto } from './crear-vehiculo.dto';

export class ActualizarVehiculoDto extends PartialType(CrearVehiculoDto) {}
