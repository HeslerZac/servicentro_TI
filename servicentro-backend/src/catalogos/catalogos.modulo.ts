import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './categoria.entidad';
import { Marca } from './marca.entidad';
import { CategoriaMarca } from './categoria-marca.entidad';
import { CatalogosServicio } from './catalogos.servicio';
import { CatalogosControlador } from './catalogos.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria, Marca, CategoriaMarca])],
  controllers: [CatalogosControlador],
  providers: [CatalogosServicio],
  exports: [TypeOrmModule, CatalogosServicio],
})
export class CatalogosModulo {}
