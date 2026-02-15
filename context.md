# Contexto del Proyecto: Chatarrería App

Este documento proporciona un resumen técnico del proyecto "Chatarrería App", una aplicación full-stack para la gestión de compra de metales en una chatarrería.

## Resumen General

La aplicación consta de un backend en Node.js/Express y un frontend en React. Permite a los usuarios (administradores y ejecutivos) gestionar sucursales, usuarios, precios de metales y registrar transacciones de compra de chatarra a clientes.

### Tecnologías Principales

-   **Backend**: Node.js, Express, PostgreSQL (con `node-postgres`), JWT para autenticación.
-   **Frontend**: React (con Vite), `react-router-dom` para el enrutamiento, `axios` para las peticiones HTTP y Tailwind CSS para los estilos.
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
-   **Transacciones**:
    -   Crear nuevas compras (`/api/transacciones/crear`).
    -   Listar historial de transacciones con filtros y paginación.
-   **Reportes**:
    -   Generar reportes diarios de compras.
    -   Exportar reportes a formato Excel (`.xlsx`).
-   **Configuración**:
    -   Gestionar datos de la empresa (nombre, logo, etc.).

---

## Frontend

El frontend es una Single-Page Application (SPA) desarrollada con React y Vite.

### Estructura de Ficheros Clave

-   `main.jsx`: Punto de entrada de la aplicación React.
-   `App.jsx`: Define el enrutamiento principal de la aplicación utilizando `react-router-dom`. Protege rutas privadas con un componente `RutaPrivada`.
-   `components/`: Directorio que contiene los componentes de React, organizados por funcionalidad:
    -   `Login.jsx`: Formulario de inicio de sesión.
    -   `Dashboard.jsx`: Panel principal para usuarios autenticados.
    -   `GestionMetales.jsx`, `GestionSucursales.jsx`, `GestionUsuarios.jsx`: Componentes para la administración de estos recursos.
    -   `NuevaCompra.jsx`: Formulario para registrar una nueva transacción.
    -   `HistorialTransacciones.jsx`: Muestra el listado de transacciones.
    -   `ReporteDiario.jsx`: Muestra el reporte de compras del día.
-   `context/`: Contiene contextos de React para gestionar el estado global, como `ConfiguracionContext.jsx`.

### Funcionalidades del Frontend

-   Inicio de sesión y protección de rutas.
-   Un panel de control (Dashboard) que da acceso a las diferentes secciones.
-   Formularios para crear y editar sucursales, usuarios y precios de metales.
-   Un flujo de "Nueva Compra" que permite a un ejecutivo registrar los metales y pesos comprados a un cliente.
-   Visualización de historiales y reportes con capacidad de filtrado y paginación.
-   Configuración de los datos de la empresa.

---

## Esquema de la Base de Datos

La base de datos PostgreSQL se estructura de la siguiente manera:

-   `sucursales`: Almacena las diferentes sucursales de la empresa.
-   `usuarios`: Contiene a los usuarios con roles de `ADMIN` o `EJECUTIVO`. Un admin general no está asociado a ninguna sucursal.
-   `metales`: Catálogo de metales con su `valor_por_gramo` actualizado.
-   `transacciones`: Registra cada operación de compra, asociando al cliente, ejecutivo y sucursal.
-   `transaccion_detalles`: Detalla los metales y pesos de cada transacción.
-   `configuracion`: Tabla singleton para almacenar la información general de la empresa.

Las relaciones aseguran la integridad de los datos (por ejemplo, una transacción siempre está ligada a una sucursal y un ejecutivo existentes).
