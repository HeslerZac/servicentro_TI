import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('salud')
@Controller('salud')
export class SaludControlador {
  @Get()
  estado() {
    return { estado: true, marcaDeTiempo: new Date().toISOString() };
  }
}
