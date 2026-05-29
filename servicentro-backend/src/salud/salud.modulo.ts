import { Module } from '@nestjs/common';
import { SaludControlador } from './salud.controlador';

@Module({
  controllers: [SaludControlador],
})
export class SaludModulo {}
