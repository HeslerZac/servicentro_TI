import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolUsuario } from './usuario.entidad';
import * as bcrypt from 'bcryptjs';

type DatosCrearUsuario = {
  nombreUsuario: string;
  nombre: string;
  telefono: string;
  direccion: string;
  contrasena: string;
  rol?: RolUsuario;
};

@Injectable()
export class UsuariosServicio {
  private readonly rondasHash = 10;

  constructor(
    @InjectRepository(Usuario)
    private readonly repositorio: Repository<Usuario>,
  ) {}

  async crearUsuario(datos: DatosCrearUsuario) {
    const existente = await this.repositorio.findOne({
      where: { nombreUsuario: datos.nombreUsuario },
    });
    if (existente) {
      throw new BadRequestException('El nombre de usuario ya esta en uso');
    }

    const contrasenaHash = await this.hashear(datos.contrasena);
    const usuario = this.repositorio.create({
      nombreUsuario: datos.nombreUsuario,
      nombre: datos.nombre,
      telefono: datos.telefono,
      direccion: datos.direccion,
      contrasenaHash,
      rol: datos.rol ?? RolUsuario.SECRETARIA,
    });
    return this.repositorio.save(usuario);
  }

  listar() {
    return this.repositorio.find({ order: { creadoEn: 'DESC' } });
  }

  listarConInactivos() {
    return this.repositorio.find({
      withDeleted: true,
      order: { creadoEn: 'DESC' },
    } as any);
  }

  async buscarPorId(id: string) {
    const usuario = await this.repositorio.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async buscarPorNombreUsuario(nombreUsuario: string) {
    return this.repositorio.findOne({ where: { nombreUsuario } });
  }

  async validarCredenciales(nombreUsuario: string, contrasenaPlano: string) {
    const usuario = await this.repositorio.findOne({
      where: { nombreUsuario },
    });
    if (!usuario) {
      throw new BadRequestException('Usuario o contrasena invalidos');
    }

    const valido = await bcrypt.compare(
      contrasenaPlano,
      usuario.contrasenaHash,
    );
    if (!valido) {
      throw new BadRequestException('Usuario o contrasena invalidos');
    }
    return usuario;
  }

  async cambiarPassword(id: string, passActual: string, passNueva: string) {
    const usuario = await this.buscarPorId(id);
    const valido = await bcrypt.compare(passActual, usuario.contrasenaHash);
    if (!valido) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }
    usuario.contrasenaHash = await this.hashear(passNueva);
    return this.repositorio.save(usuario);
  }

  async actualizarContrasena(id: string, contrasenaNueva: string) {
    const usuario = await this.buscarPorId(id);
    usuario.contrasenaHash = await this.hashear(contrasenaNueva);
    return this.repositorio.save(usuario);
  }

  async actualizarRol(id: string, rol: RolUsuario) {
    const usuario = await this.buscarPorId(id);
    usuario.rol = rol;
    return this.repositorio.save(usuario);
  }

  async actualizarPerfil(
    id: string,
    dto: { nombre?: string; telefono?: string; direccion?: string },
  ) {
    const usuario = await this.buscarPorId(id);
    if (dto.nombre !== undefined) usuario.nombre = dto.nombre;
    if (dto.telefono !== undefined) usuario.telefono = dto.telefono;
    if (dto.direccion !== undefined) usuario.direccion = dto.direccion;
    return this.repositorio.save(usuario);
  }

  async eliminar(id: string) {
    await this.buscarPorId(id);
    await this.repositorio.softDelete(id);
    return { desactivado: true };
  }

  async actualizarEstado(id: string, estaActivo: boolean) {
    // Si estaActivo=false -> soft delete; si true -> restore
    await this.buscarPorId(id);
    if (estaActivo) {
      await this.repositorio.restore(id);
      return { desactivado: false };
    }
    await this.repositorio.softDelete(id);
    return { desactivado: true };
  }

  private hashear(contrasena: string) {
    return bcrypt.hash(contrasena, this.rondasHash);
  }
}
