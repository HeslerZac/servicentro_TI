import { Test } from '@nestjs/testing';
import { AutenticacionServicio } from './autenticacion.servicio';
import { UsuariosServicio } from '../usuarios/usuarios.servicio';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RolUsuario } from '../usuarios/usuario.entidad';
import { BadRequestException } from '@nestjs/common';

describe('AutenticacionServicio', () => {
  let servicio: AutenticacionServicio;
  const usuariosServicio = {
    validarCredenciales: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };
  const configService = {
    get: jest.fn(() => '3600'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AutenticacionServicio,
        { provide: UsuariosServicio, useValue: usuariosServicio },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    servicio = module.get(AutenticacionServicio);
  });

  it('deberia emitir token cuando las credenciales son validas', async () => {
    const usuarioMock = {
      id: 'uuid',
      nombreUsuario: 'admin',
      rol: RolUsuario.ADMINISTRADOR,
      estaActivo: true,
    } as any;
    usuariosServicio.validarCredenciales.mockResolvedValue(usuarioMock);
    jwtService.signAsync.mockResolvedValue('token-falso');

    const resultado = await servicio.iniciarSesion({
      usuario: 'admin',
      contrasena: '1234',
    });

    expect(usuariosServicio.validarCredenciales).toHaveBeenCalledWith(
      'admin',
      '1234',
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      {
        sub: usuarioMock.id,
        nombreUsuario: usuarioMock.nombreUsuario,
        rol: usuarioMock.rol,
      },
      { expiresIn: 3600 },
    );
    expect(resultado.token).toBe('token-falso');
    expect(resultado.usuario.nombreUsuario).toBe('admin');
  });

  it('deberia rechazar si el usuario esta desactivado', async () => {
    const usuarioMock = {
      id: 'uuid',
      nombreUsuario: 'admin',
      rol: RolUsuario.ADMINISTRADOR,
      estaActivo: false,
    } as any;
    usuariosServicio.validarCredenciales.mockResolvedValue(usuarioMock);

    await expect(
      servicio.iniciarSesion({ usuario: 'admin', contrasena: '1234' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
