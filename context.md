# Contexto del Proyecto: Chatarrería App

Este documento proporciona un resumen técnico del proyecto "Chatarrería App", una aplicación full-stack para la gestión de compra de metales en una chatarrería.

## Resumen General

La aplicación consta de un backend en Node.js/Express y un frontend en React. Permite a los usuarios (administradores y ejecutivos) gestionar sucursales, usuarios, precios de metales y registrar transacciones de compra de chatarra a clientes.

### Tecnologías Principales

-   **Backend**: Node.js, Express, PostgreSQL (con `node-postgres`), JWT para autenticación.
-   **Frontend**: React (con Vite), `react-router-dom` para el enrutamiento, `axios` para las peticiones HTTP y Bootstrap 5 para los estilos.
-   **Base de Datos**: PostgreSQL.

---

## Backend

El backend está construido con Node.js y el framework Express. Se encarga de toda la lógica de negocio y la comunicación con la base de datos.

### Estructura de Ficheros Clave

-   `index.js`: Punto de entrada del servidor Express. Configura middlewares (CORS, body-parser), define las rutas principales de la API y arranca el servidor.
-   `config/db.js`: Configura y exporta la conexión a la base de datos PostgreSQL.
-   `routes/`: Contiene los ficheros que definen los endpoints de la API para cada recurso (autenticación, metales, usuarios, etc.).
-   `controllers/`: Contiene la lógica de negocio para cada ruta. Interactúa con la base de datos para realizar operaciones CRUD y otras lógicas más complejas.
-   `middleware/`: Contiene middlewares personalizados, como `authMiddleware.js` para proteger rutas verificando un token JWT.
-   `database.sql`: Script SQL que define el esquema completo de la base de datos, incluyendo tablas y relaciones.

### Funcionalidades de la API

-   **Autenticación**:
    -   Login de usuarios (`/api/auth/login`).
    -   Generación de JSON Web Tokens (JWT) para sesiones seguras.
-   **Gestión de Recursos (CRUD)**:
    -   Sucursales (`/api/sucursales`)
    -   Usuarios (`/api/usuarios`)
    -   Metales y sus precios (`/api/metales`)
    -   Familias de metales (`/api/familias`)
    -   Precios web (`/api/preciosweb`): listado público + CRUD de administración
-   **Transacciones** (`/api/transacciones`):
    -   Crear nuevas compras (`POST /`). Admite `precio_especial` por material para sobrescribir el valor del kilo.
    -   Listar historial de transacciones con filtros (rango de fechas, material) y paginación.
    -   Anular transacciones (`PUT /:id/anular`, marca `estado='anulada'`).
    -   Tipos de compra: se agregó el modo `romana` además del modo `normal`.
        - `romana` está pensado para balanzas tipo romana: admite uno o más metales por compra y requiere que se envíen `peso_entrada` y `peso_salida` (un único pesaje por transacción).
        - El peso neto (`peso_entrada - peso_salida`) se reparte entre los materiales: la suma de los `peso_kilos` de todos los metales debe coincidir con el neto (tolerancia 0.001).
        - El payload de ejemplo para una compra romana con varios materiales:

            ```json
            {
              "cliente_nombre": "Juan Perez",
              "cliente_rut_dni": "12345678-9",
              "metales": [
                { "metal_id": 5, "peso_kilos": 1.2 },
                { "metal_id": 8, "peso_kilos": 0.8 }
              ],
              "tipo_compra": "romana",
              "peso_entrada": 2.5,
              "peso_salida": 0.5
            }
            ```

        - Validaciones del servidor:
            - Si `tipo_compra` es `romana`, la suma de los `peso_kilos` de los metales debe coincidir con `peso_entrada - peso_salida` (tolerancia 0.001).
            - Requiere `peso_entrada` y `peso_salida` numéricos y mayores que 0.

        - En la UI (`NuevaCompra.jsx`) el checkbox "Romana" muestra los campos `peso entrada` y `peso salida`. Con un solo material el peso neto se autocompleta; con varios, el operador reparte el neto manualmente entre las líneas con ayuda de un indicador de peso restante (neto/asignado/restante), y el registro se habilita sólo cuando la suma cuadra.
                - Ejemplo `curl` para probar el endpoint (requiere token JWT válido):

                        ```bash
                        curl -X POST "http://localhost:3000/api/transacciones" \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer <TU_JWT_AQUI>" \
                            -d '{
                                "cliente_nombre": "Juan Perez",
                                "cliente_rut_dni": "12345678-9",
                                "metales": [
                                    { "metal_id": 5, "peso_kilos": 1.2 },
                                    { "metal_id": 8, "peso_kilos": 0.8 }
                                ],
                                "tipo_compra": "romana",
                                "peso_entrada": 2.5,
                                "peso_salida": 0.5
                            }'
                        ```

                        Respuesta esperada (parcial):

                        ```json
                        {
                            "mensaje": "Compra registrada exitosamente",
                            "voucher": {
                                "correlativo": 123,
                                "tipo_compra": "romana",
                                "peso_entrada": 2.5,
                                "peso_salida": 0.5,
                                "total_pagado": 4000,
                                "detalles": [ ... ]
                            }
                        }
                        ```
-   **Reportes**:
    -   Reporte diario de compras (`GET /reporte-diario`), agrupado por metal/familia.
    -   Exportar a Excel (`.xlsx`): reporte diario (`GET /reporte-diario/excel`) e historial por rango de fechas (`GET /excel`, hojas "Resumen del Periodo" + "Historial Transacciones").
-   **Precios públicos**:
    -   `GET /api/precios`: mapa de precios por familia, leído de `metales`+`familias`.
    -   `GET /api/preciosweb`: precios de la tabla `preciosweb`, fuente del plugin de WordPress.
-   **Configuración**:
    -   Gestionar datos de la empresa (nombre, dirección, contacto, logo guardado como data URI base64).
-   **Plugin WordPress** (`wp/metal-prices/`):
    -   Shortcode `[display_metal_prices]` (atributo `format="tabla"` para vista en tabla) que muestra precios desde la BD Postgres (PDO) o desde la API JSON.
    -   Menú de administración "Chatarrapp" en wp-admin.

---

## Frontend

El frontend es una Single-Page Application (SPA) desarrollada con React y Vite.

### Estructura de Ficheros Clave

-   `main.jsx`: Punto de entrada de la aplicación React.
-   `App.jsx`: Define el enrutamiento principal de la aplicación utilizando `react-router-dom`. Protege rutas privadas con un componente `RutaPrivada`.
-   `components/`: Directorio que contiene los componentes de React, organizados por funcionalidad:
    -   `Login.jsx`: Formulario de inicio de sesión.
    -   `RutaPrivada.jsx`: Protege las rutas privadas.
    -   `Dashboard.jsx`: Panel principal para usuarios autenticados (vistas internas: reporte, historial, nueva compra y administración).
    -   `GestionMetales.jsx`, `GestionSucursales.jsx`, `GestionUsuarios.jsx`, `Configuracion.jsx`, `PreciosWeb.jsx`: Componentes para la administración de estos recursos.
    -   `NuevaCompra.jsx`: Formulario para registrar una nueva transacción, con impresión de voucher.
    -   `HistorialTransacciones.jsx`: Muestra el listado de transacciones, con detalle en modal y reimpresión de voucher.
    -   `ReporteDiario.jsx`: Muestra el reporte de compras del día.
    -   `Footer.jsx`: Pie de página.
-   `context/`: Contiene contextos de React para gestionar el estado global, como `ConfiguracionContext.jsx`.

### Funcionalidades del Frontend

-   Inicio de sesión y protección de rutas.
-   Un panel de control (Dashboard) que da acceso a las diferentes secciones.
-   Formularios para crear y editar sucursales, usuarios y precios de metales.
-   Un flujo de "Nueva Compra" que permite a un ejecutivo registrar los metales y pesos comprados a un cliente, con impresión de voucher.
-   Visualización de historiales y reportes con capacidad de filtrado y paginación, incluida la exportación a Excel por rango de fechas.
-   Administración de "Precios Web" (sólo ADMIN): los precios que consume el sitio web/plugin de WordPress.
-   Configuración de los datos de la empresa.

---

## Esquema de la Base de Datos

La base de datos PostgreSQL se estructura de la siguiente manera:

-   `sucursales`: Almacena las diferentes sucursales de la empresa.
-   `usuarios`: Contiene a los usuarios con roles de `ADMIN` o `EJECUTIVO`. Un admin general no está asociado a ninguna sucursal.
-   `familias`: Grupos de metales (ej. Aluminios, Cobres).
-   `metales`: Catálogo de metales con su `valor_por_kilo` actualizado, agrupados por familia.
-   `transacciones`: Registra cada operación de compra, asociando al cliente, ejecutivo y sucursal. Incluye `estado` (activa/anulada), `tipo_compra` (normal/romana) y, para romana, `peso_entrada` y `peso_salida`.
-   `transaccion_detalles`: Detalla los metales, pesos y subtotales de cada transacción.
-   `preciosweb`: Precios de materiales para el sitio web (`familia`, `material`, `precio`); alimenta la API pública `/api/preciosweb` y el plugin de WordPress.
-   `configuracion`: Tabla singleton para almacenar la información general de la empresa.

Las relaciones aseguran la integridad de los datos (por ejemplo, una transacción siempre está ligada a una sucursal y un ejecutivo existentes).

El esquema base vive en `database.sql`; los cambios posteriores (tabla `familias`, `estado` en transacciones, campos de romana, tabla `preciosweb`) están en migraciones sueltas `backend/migration_*.sql` que se aplican manualmente sobre la base de datos.
