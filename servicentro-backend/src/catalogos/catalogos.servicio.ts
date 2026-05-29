import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Categoria } from './categoria.entidad';
import { Marca } from './marca.entidad';
import { CategoriaMarca } from './categoria-marca.entidad';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
import { CrearMarcaDto } from './dto/crear-marca.dto';
import { ActualizarMarcaDto } from './dto/actualizar-marca.dto';

@Injectable()
export class CatalogosServicio {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriasRepo: Repository<Categoria>,
    @InjectRepository(Marca) private readonly marcasRepo: Repository<Marca>,
    @InjectRepository(CategoriaMarca)
    private readonly categoriasMarcasRepo: Repository<CategoriaMarca>,
  ) {}

  // Categorias
  async crearCategoria(dto: CrearCategoriaDto) {
    const nombre = dto.nombre.trim();
    const existente = await this.categoriasRepo.findOne({ where: { nombre } });
    if (existente) {
      throw new BadRequestException('La categoria ya existe');
    }
    const categoria = this.categoriasRepo.create({
      nombre,
      descripcion: dto.descripcion,
      estaActiva: dto.estaActiva ?? true,
    });
    return this.categoriasRepo.save(categoria);
  }

  listarCategorias(incluirInactivas = false) {
    const where = incluirInactivas ? {} : { estaActiva: true };
    return this.categoriasRepo.find({ where, order: { nombre: 'ASC' } });
  }

  async actualizarCategoria(id: string, dto: ActualizarCategoriaDto) {
    const categoria = await this.categoriasRepo.findOne({ where: { id } });
    if (!categoria) {
      throw new NotFoundException('Categoria no encontrada');
    }

    if (dto.nombre && dto.nombre.trim() !== categoria.nombre) {
      const existente = await this.categoriasRepo.findOne({
        where: { nombre: dto.nombre.trim() },
      });
      if (existente) {
        throw new BadRequestException('La categoria ya existe');
      }
      categoria.nombre = dto.nombre.trim();
    }

    if (dto.descripcion !== undefined) categoria.descripcion = dto.descripcion;
    if (dto.estaActiva !== undefined) categoria.estaActiva = dto.estaActiva;

    return this.categoriasRepo.save(categoria);
  }

  // Marcas
  async crearMarca(dto: CrearMarcaDto) {
    const nombre = dto.nombre.trim();
    const existente = await this.marcasRepo.findOne({ where: { nombre } });
    if (existente) {
      throw new BadRequestException('La marca ya existe');
    }
    const marca = this.marcasRepo.create({
      nombre,
      descripcion: dto.descripcion,
      estaActiva: dto.estaActiva ?? true,
    });
    return this.marcasRepo.save(marca);
  }

  listarMarcas(incluirInactivas = false) {
    const where = incluirInactivas ? {} : { estaActiva: true };
    return this.marcasRepo.find({ where, order: { nombre: 'ASC' } });
  }

  async actualizarMarca(id: string, dto: ActualizarMarcaDto) {
    const marca = await this.marcasRepo.findOne({ where: { id } });
    if (!marca) {
      throw new NotFoundException('Marca no encontrada');
    }

    if (dto.nombre && dto.nombre.trim() !== marca.nombre) {
      const repetida = await this.marcasRepo.findOne({
        where: { nombre: dto.nombre.trim() },
      });
      if (repetida) {
        throw new BadRequestException('La marca ya existe');
      }
      marca.nombre = dto.nombre.trim();
    }

    if (dto.descripcion !== undefined) marca.descripcion = dto.descripcion;
    if (dto.estaActiva !== undefined) marca.estaActiva = dto.estaActiva;

    return this.marcasRepo.save(marca);
  }

  // Relaciones Categoria-Marca
  async listarMarcasPorCategoria(categoriaId: string) {
    const categoria = await this.categoriasRepo.findOne({
      where: { id: categoriaId },
    });
    if (!categoria) {
      throw new NotFoundException('Categoria no encontrada');
    }
    const relaciones = await this.categoriasMarcasRepo.find({
      where: { categoria: { id: categoriaId }, desactivadoEn: IsNull() },
      relations: ['marca'],
      order: { marca: { nombre: 'ASC' } },
    });
    return relaciones.map((relacion) => relacion.marca);
  }

  async asignarMarcaACategoria(categoriaId: string, marcaId: string) {
    const categoria = await this.categoriasRepo.findOne({
      where: { id: categoriaId },
    });
    if (!categoria) {
      throw new NotFoundException('Categoria no encontrada');
    }
    const marca = await this.marcasRepo.findOne({ where: { id: marcaId } });
    if (!marca) {
      throw new NotFoundException('Marca no encontrada');
    }

    const existente = await this.categoriasMarcasRepo.findOne({
      where: { categoria: { id: categoriaId }, marca: { id: marcaId } },
      withDeleted: false as any,
    } as any);
    if (existente) {
      if ((existente as any).desactivadoEn) {
        (existente as any).desactivadoEn = null;
        await this.categoriasMarcasRepo.save(existente);
        return { asignado: true, reactivado: true };
      }
      throw new BadRequestException('La marca ya esta asociada a la categoria');
    }

    const relacion = this.categoriasMarcasRepo.create({ categoria, marca });
    await this.categoriasMarcasRepo.save(relacion);
    return { asignado: true };
  }

  async removerMarcaDeCategoria(categoriaId: string, marcaId: string) {
    const relacion = await this.categoriasMarcasRepo.findOne({
      where: { categoria: { id: categoriaId }, marca: { id: marcaId } },
    });
    if (!relacion || (relacion as any).desactivadoEn) {
      throw new NotFoundException('La marca no esta asociada a la categoria');
    }
    (relacion as any).desactivadoEn = new Date();
    await this.categoriasMarcasRepo.save(relacion);
    return { desactivado: true };
  }
}
