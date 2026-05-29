import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { Usuario, RolUsuario } from '../../usuarios/usuario.entidad';
import { Bodega } from '../../bodegas/bodega.entidad';
import { Producto } from '../../productos/producto.entidad';
import * as bcrypt from 'bcryptjs';

async function run() {
  await AppDataSource.initialize();
  const usuariosRepo = AppDataSource.getRepository(Usuario);
  const bodegasRepo = AppDataSource.getRepository(Bodega);
  const productosRepo = AppDataSource.getRepository(Producto);

  // 1. Usuario admin por defecto
  let adminUser = await usuariosRepo.findOne({
    where: { nombreUsuario: 'admin' },
  });
  if (!adminUser) {
    const contrasenaHash = await bcrypt.hash('admin123', 10);
    adminUser = usuariosRepo.create({
      nombreUsuario: 'admin',
      nombre: 'Administrador del Sistema',
      contrasenaHash,
      rol: RolUsuario.ADMINISTRADOR,
    });
    await usuariosRepo.save(adminUser);
    console.log('✅ Usuario admin creado: admin / admin123');
  } else {
    console.log('ℹ️ Usuario admin ya existe');
  }

  // 2. Bodega Central
  let bodegaCentral = await bodegasRepo.findOne({
    where: { codigo: 'CENTRAL' },
  });
  if (!bodegaCentral) {
    bodegaCentral = bodegasRepo.create({
      codigo: 'CENTRAL',
      nombre: 'Bodega Central',
      ubicacion: 'Sede Principal',
    });
    await bodegasRepo.save(bodegaCentral);
    console.log('✅ Bodega CENTRAL creada');
  } else {
    console.log('ℹ️ Bodega CENTRAL ya existe');
  }

  // 3. Productos Demo
  const producto1 = await productosRepo.findOne({
    where: { codigo: 'ACE-001' },
  });
  if (!producto1) {
    const nuevo = productosRepo.create({
      codigo: 'ACE-001',
      descripcion: 'Aceite Sintético 5W-30 (Galón)',
      precioA: '350',
      precioB: '320',
      precioMayorista: '300',
      costo: '250',
    });
    await productosRepo.save(nuevo);
    console.log('✅ Producto ACE-001 creado');
  } else {
    console.log('ℹ️ Producto ACE-001 ya existe');
  }

  const producto2 = await productosRepo.findOne({
    where: { codigo: 'FIL-001' },
  });
  if (!producto2) {
    const nuevo = productosRepo.create({
      codigo: 'FIL-001',
      descripcion: 'Filtro de Aire para Sedán Compacto',
      precioA: '150',
      precioB: '135',
      precioMayorista: '120',
      costo: '90',
    });
    await productosRepo.save(nuevo);
    console.log('✅ Producto FIL-001 creado');
  } else {
    console.log('ℹ️ Producto FIL-001 ya existe');
  }

  console.log('\n🌱 Proceso de seeding finalizado.');
  await AppDataSource.destroy();
}

run().catch(async (err) => {
  console.error('❌ Error durante el seeding:', err);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
