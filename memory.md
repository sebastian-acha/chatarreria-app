# Memory — Chatarrería App

Guía de orientación rápida del repo. Detalle adicional en `context.md` (explica el modo "romana").
App full-stack en español para gestionar la compra de metales/chatarra en una chatarrería chilena.

## Stack

- **Backend** (`backend/`): Node.js + Express 5, PostgreSQL (`pg` Pool), JWT, bcryptjs, Multer (logos), `xlsx` (reportes Excel). CommonJS. Tests: Jest + Supertest.
- **Frontend** (`frontend/`): React 19 + Vite, react-router-dom 7, axios, Bootstrap 5, lucide-react. SPA (no hay rutas por recurso; Dashboard es un shell con tabs internos).
- **WP plugin** (`wp/metal-prices/`): plugin WordPress que muestra precios de metales vía shortcode `[display_metal_prices]`; lee de la misma BD Postgres (PDO) o de una fuente JSON.

## Estructura clave

- `backend/index.js` — entrada Express: CORS (whitelist hardcodeada), monta las 8 rutas, sirve `/uploads`, `GET /test-db`. Exporta `app` para tests.
- `backend/config/db.js` — Pool de `pg` con `DATABASE_URL`; SSL solo si no es localhost. `db.query` directo en la mayoría de controllers.
- `backend/routes/` — un router por recurso (`authRoutes`, `metales`, `familias`, `sucursales`, `usuarios`, `transacciones`, `configuracion`, `precios`).
- `backend/controllers/` — lógica de negocio (el más complejo: `transaccionController.js`, ~600 líneas).
- `backend/middleware/` — `authMiddleware` (verifica JWT, deja `req.user` con `{id, email, rol, sucursal_id}`), `adminMiddleware` (restringe a `rol === 'ADMIN'`).
- `backend/database.sql` — esquema base. Migraciones sueltas en `backend/migration_*.sql` (aplicar manualmente).
- `backend/seed.js` — crea admin por defecto: `admin@chatarreria.com` / `admin123`.
- `backend/get-token.js` — genera un JWT de admin hardcodeado para pruebas.
- `frontend/src/api/axios.js` — instancia axios con base `VITE_API_URL || '/'`; interceptor añade `Bearer` token de `localStorage`; en 401/403 limpia sesión y redirige a `/`.
- `frontend/src/App.jsx` — rutas: `/login`, `/dashboard`, `/configuracion`, `/` → `/dashboard`. `RutaPrivada` protege.
- `frontend/src/components/` — `Dashboard.jsx` (shell con navbar y switch de vistas), `Login`, `RutaPrivada`, `NuevaCompra`, `HistorialTransacciones`, `ReporteDiario`, `GestionMetales`, `GestionSucursales`, `GestionUsuarios`, `Configuracion`, `Footer`.
- `frontend/src/context/ConfiguracionContext.jsx` — provee datos de la empresa (`configuracion`) globalmente.

## Base de datos

Tablas (`database.sql` + migraciones):
- `sucursales(id, nombre, direccion)`
- `usuarios(id, sucursal_id NULL=admin general, nombres, apellido_paterno, apellido_materno, email UNIQUE, password_hash, rol[ADMIN|EJECUTIVO], activo)`
- `familias(id, nombre UNIQUE)` — grupos de metales (ej. Aluminios, Cobres)
- `metales(id, familia_id FK ON DELETE SET NULL, nombre, valor_por_kilo DECIMAL, updated_at, UNIQUE(familia_id, nombre))`
- `transacciones(id, sucursal_id, ejecutivo_id, cliente_nombre, cliente_rut_dni, total_pagar, fecha_hora, estado[activa|anulada] DEFAULT 'activa', tipo_compra[normal|romana] DEFAULT 'normal', peso_entrada, peso_salida)`
- `transaccion_detalles(id, transaccion_id FK CASCADE, metal_id, peso_kilos, valor_kilo_aplicado, valor_kilo_oficial, subtotal)`
- `configuracion(id=1 singleton, nombre_empresa, direccion, telefono, email, logo_url)`

## API endpoints

| Recurso | Endpoints | Protección |
|---|---|---|
| Auth | `POST /api/auth/login`, `GET /api/auth/verify` | verify: JWT |
| Metales | `GET /api/metales` (agrupado por familia), `POST`, `PUT /:id` | POST/PUT: JWT |
| Familias | `GET`, `POST`, `PUT /:id`, `DELETE /:id` | GET: JWT; resto: JWT+ADMIN |
| Sucursales | `GET`, `POST`, `PUT /:id` | GET: JWT; POST/PUT: JWT+ADMIN |
| Usuarios | `POST`, `GET` (todo el router con JWT+ADMIN) | JWT+ADMIN |
| Transacciones | `POST /` (crear compra), `GET /` (historial), `GET /:id`, `PUT /:id/anular`, `GET /reporte-diario`, `GET /reporte-diario/excel`, `GET /excel` | JWT |
| Configuración | `GET /`, `PUT /` (multipart logo) | PUT: JWT+ADMIN |
| Precios | `GET /api/precios` (mapa `{familia: [{nombre, precio}]}`) | pública |

### Detalles de transacciones

- **Crear compra** (`POST /api/transacciones`): body `{cliente_nombre, cliente_rut_dni, metales:[{metal_id, peso_kilos, precio_especial?}], tipo_compra?, peso_entrada?, peso_salida?}`. El ejecutivo/sucursal sale del token. Usa transacción SQL, valida que todos los metales existan, soporta `precio_especial` (precio por kilo override). Respuesta `201` con objeto `voucher` (incluye `correlativo`, `detalles`, `logo_url`).
- **Modo romana**: requiere exactamente 1 metal + `peso_entrada` y `peso_salida`; el peso declarado debe coincidir con `peso_entrada - peso_salida` (tolerancia 0.001). Detalle completo en `context.md`.
- **Historial** (`GET /api/transacciones`): query params `page`, `limit`, `sort[id|fecha_hora|cliente_nombre|total_pagar|estado]`, `order[ASC|DESC]`, `metal_id`, `fecha_inicio`, `fecha_fin`. Devuelve `{data, pagination}` con `detalles` embebidos (json_agg).
- **Anular**: `PUT /:id/anular` setea `estado='anulada'`. Los reportes/excel filtran `estado='activa'`.
- **Reporte diario**: agrupa por metal/familia con `SUM(peso_kilos)`, `SUM(subtotal)`, `COUNT(DISTINCT transaccion_id)` del día en zona `America/Santiago`.
- **Exportar Excel**: 2 endpoints; el de historial genera 2 hojas ("Resumen del Periodo" + "Historial Transacciones") con formato de miles/moneda.

## Convenciones y gotchas

- **Fechas**: el backend convierte con `fecha_hora AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago'` (col `TIMESTAMP` sin tz). No romper este patrón.
- **Moneda**: `valor_por_kilo` se redondea a entero al crear/editar metales (`Math.round(parseFloat(...))`).
- **Precios especiales**: en `crearTransaccion`, si `precio_especial > 0` se usa como `valor_kilo_aplicado`; el oficial siempre se guarda aparte.
- **Roles**: solo ADMIN ve el menú de Configuración en el frontend (navbar) y accede a rutas protegidas por `adminMiddleware`. EJECUTIVO crea compras/ve reportes.
- **Errores PostgreSQL**: código `23505` = duplicado (email / familia / metal-en-familia).
- **Frontend**: sin router por recurso; `Dashboard.jsx` alterna vistas con `useState('vistaActual')` y un switch. Vistas admin: metales, usuarios, sucursales, configuracion.
- **Auth en frontend**: token y usuario en `localStorage` (`token`, `usuario`). El interceptor redirige a `/` en 401/403.

## Variables de entorno

- Backend: `DATABASE_URL` (Postgres), `JWT_SECRET`, `JWT_EXPIRATION_TIME` (default `12h`).
- Frontend: `VITE_API_URL` (si vacío → `/`, que en dev Vite proxya a `http://localhost:3000`).

## Deploy

- **Backend**: Render → `https://chatarreria-app.onrender.com` (destino del rewrite de Vercel). CORS whitelist en `backend/index.js` (incluye `cromat.cl`, vercel domains, localhost:5173).
- **Frontend**: Vercel, `vercel.json` rewrites: `/api/*` → Render; todo lo demás → `index.html` (SPA).

## Comandos

- Backend tests: `cd backend && npm test` (Jest; mockean `config/db` y `authMiddleware`).
- Frontend: `npm run dev` (Vite, puerto 5173), `npm run build`, `npm run lint` (eslint).

## Testing

- `backend/tests/metales.test.js`, `backend/tests/transacciones.test.js` — Supertest sobre `app` importada de `index.js`, con `db` y `authMiddleware` mockeados. No requieren BD real.
