# Servicentro Backend

Backend de gestión para un taller/servicentro: catálogo de productos y marcas, clientes y vehículos, órdenes de servicio, inventario, compras, ventas/facturación, cierres de venta, caja y dashboard. Construido con NestJS + TypeORM sobre PostgreSQL. Incluye Docker para desarrollo/ejecución rápida.

## Tecnologías

- Node.js + TypeScript
- NestJS 11, @nestjs/typeorm
- TypeORM 0.3 + PostgreSQL
- JWT para autenticación

## Inicialización rápida

1) Clonar y configurar variables de entorno (opcional, `docker-compose.yml` trae valores por defecto):

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASS`, `DATABASE_NAME`
- `API_PREFIX` (por defecto `/api/v1`)
- `JWT_SECRETO`, `JWT_EXPIRACION`

2) Con Docker (recomendado):

```bash
docker compose up -d --build api
```

3) Aplicar migraciones (desde el contenedor o local):

```bash
# Dentro del contenedor
docker compose exec -T api node ./node_modules/typeorm/cli.js -d dist/database/data-source.js migration:run

# Local (si corres sin Docker)
npm run build
npm run migration:run
```

## Scripts útiles

- `npm run start:dev`: Nest en watch mode
- `npm run build`: compila a `dist/`
- `npm run migration:run|revert`: ejecutar/revertir migraciones TypeORM
- `npm run seed`: script de seeding (`src/database/seeds/seed.ts`)

## Módulos y funcionalidades

- Autenticación y seguridad (`seguridad`): login JWT, guards de roles.
- Catálogos (`catalogos`): marcas y categorías de productos.
- Productos (`productos`):
  - Entidad `Producto` con relaciones ManyToOne a `Marca` y `Categoría` (`marcaId`/`categoriaId`).
  - Precios y costos como DECIMAL; el servicio los maneja en string para precisión.
  - Crear/actualizar/listar y búsqueda paginada (responde `{ items, total, page, limit }`).
  - Soporte opcional en creación: `bodegaId` + `stockInicial` para registrar inventario inicial.
- Inventarios (`inventarios`):
  - Existencias por bodega (`existencias`), movimientos (`movimientos_inventario`).
  - Reserva/liberación de stock.
  - Ajustes de inventario (entrada/salida) con validaciones.
- Bodegas (`bodegas`): mantenimiento de bodegas.
- Clientes y Vehículos (`clientes`, `vehiculos`).
- Órdenes de servicio (`ordenes`):
  - Crear orden con productos (reserva de stock) y servicios.
  - Finalizar orden: consume reserva y puede generar venta.
- Ventas y Facturación (`ventas`, `facturacion`): emisión de facturas, totales y estados de venta.
- Caja y Cierres (`caja`, `cierres`): sesiones de caja, cierres de venta y KPIs de dashboard.

## Notas de implementación

- Prefijo de API: `API_PREFIX` (por defecto `/api/v1`).
- Validación estricta (ValidationPipe con whitelist). Los DTO rechazan propiedades desconocidas.
- Órdenes: los DTO de detalles esperan strings en campos monetarios y cantidades (se formatean internamente). Ejemplo de payload de creación:

```json
{
  "numero": "ORD-20250101-120000",
  "clienteId": "<uuid>|null",
  "vehiculoId": "<uuid>|null",
  "usuarioId": "<uuid>",
  "observaciones": "...",
  "productos": [
    {"productoId":"<uuid>","bodegaId":"<uuid>","cantidad":"2","costoUnitario":"0","precioUnitario":"450"}
  ],
  "servicios": [
    {"descripcion":"mano de obra","costo":"0","precio":"100"}
  ]
}
``;

## Migraciones relevantes

- `1760594847567-Init.ts`: esquema base.
- `20251023060000-ProductoMarcaCategoriaFK_v2.ts`: agrega `marcaId`/`categoriaId` y FKs en `productos`.
- `20251023052000-FixMissingEntities_v2.ts`: asegura campos/tablas requeridas (e.g., `ventas.anulada_en`, `proveedores`).

## Cambios recientes y correcciones

- Productos: relaciones a Marca/Categoría y listado con joins seguros.
- Productos: creación acepta `bodegaId` + `stockInicial` (se registra movimiento ENTRADA).
- Inventario: `obtenerExistencia(..., {bloquear:true})` usa QueryBuilder sin LEFT JOIN para evitar error Postgres `FOR UPDATE cannot be applied to the nullable side of an outer join`.
- Órdenes: documentación de payload (strings en cantidades/precios) y uso de `usuarioId`.

## Desarrollo y contribución

- Mantener consistencia de DTOs y ValidationPipe.
- Para consultas con locking, evitar filtros por relaciones en `findOne` (preferir QueryBuilder por FKs).
- Abrir PRs pequeños y con contexto. Correr `npm run build` antes de subir.

