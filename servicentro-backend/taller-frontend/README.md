# Taller Frontend

Aplicación React + Vite para el panel de gestión del servicentro: productos, inventario, órdenes, compras, ventas, clientes, proveedores, bodegas, catálogos, cierres, dashboard y autenticación.

## Tecnologías

- React + TypeScript + Vite
- TailwindCSS (estilos utilitarios)
- TanStack Query (datos remotos y caché)
- Axios (cliente HTTP, `src/lib/api.ts`)

## Configuración

- Variables de entorno:
  - `VITE_API_BASE_URL` (por defecto usa ruta relativa `/api/v1` y Vite hace proxy en dev)

- Scripts:
  - `npm run dev` → servidor de desarrollo
  - `npm run build` → compila para producción
  - `npm run preview` → vista previa de build

## Estructura destacada

- `src/pages/*` → páginas (productos, inventarios, órdenes, etc.)
- `src/components/ui/*` → componentes UI reutilizables (DataTable, Combobox, Modal, etc.)
- `src/hooks/*` → hooks por dominio (productos, inventarios, órdenes, …)
- `src/lib/api.ts` → cliente Axios + interceptor de auth
- `src/auth/*` → contexto y guards de autenticación

## Funcionalidades

- Autenticación (contexto de usuario y guards de ruta)
- Productos:
  - Listado paginado (espera `{ items, total, page, limit }`)
  - Crear/editar producto con Marca/Categoría
  - En “Nuevo producto” se puede indicar Bodega inicial + Stock inicial (opcional)
  - Buscador de producto en modal con filtros, stock por bodega y botón “Seleccionar” por fila
- Inventarios:
  - Existencias por bodega
  - Ajustes (entrada/salida) con validación
  - Movimientos (listado y filtros)
- Compras:
  - Registrar compra: proveedor, fecha y renglones de productos (muestra subtotal y total)
- Órdenes:
  - Crear orden: cliente/vehículo, productos (cantidad y precio), servicios
  - Envío de payload conforme al backend (números como string donde corresponde y `usuarioId`)
- Clientes, Proveedores, Bodegas, Catálogos (Marcas/Categorías)
- Cierres de venta: listado con totales de venta/costo/ganancia
- Dashboard (KPIs, últimos movimientos)

## Integración con backend

- Prefijo de API: `/api/v1` (ajustable por `VITE_API_BASE_URL`)
- Autenticación: header `Authorization: Bearer <token>` lo maneja `src/lib/api.ts`
- Notas importantes de validación del backend:
  - Órdenes de servicio (POST /ordenes):
    - `usuarioId` obligatorio (UUID)
    - Los campos monetarios/cantidades se envían como string (el backend formatea y valida):
      - productos[].cantidad, productos[].costoUnitario, productos[].precioUnitario
      - servicios[].costo, servicios[].precio
  - Productos (GET /productos): respuesta paginada `{ items, total, page, limit }`

## Cambios recientes

- Modal de búsqueda de producto:
  - Botón “Seleccionar” disponible en todas las filas (cierra el modal y devuelve producto/bodega)
  - Fallback de bodega: si un producto no tiene existencias, usa la primera bodega del catálogo
- Registrar compra:
  - Visualiza descripción de producto y bodega seleccionada
  - Subtotal por renglón y total general
- Nuevo producto:
  - Campos Bodega inicial + Stock inicial (compatibles con el backend)

## Desarrollo

- Mantén los hooks sincronizados con el shape de la API (paginación, DTOs).
- Si el backend valida estrictamente (whitelist), evita enviar propiedades adicionales.
- Para números que el backend espera como string (p. ej. órdenes), castear en el payload antes del POST.

