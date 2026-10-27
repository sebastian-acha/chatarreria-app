# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Chatarrería App — Frontend

SPA en React 19 + Vite para la gestión de una chatarrería: registro de compras de metales (modo normal y romana), reportes con exportación a Excel, historial con vouchers, y administración de metales, familias, sucursales, usuarios, precios web y datos de la empresa.

- **Scripts**: `npm run dev` (Vite, puerto 5173), `npm run build`, `npm run lint` (eslint), `npm run preview`.
- **Variables de entorno**: `VITE_API_URL` (si está vacía → `/`; en dev Vite proxya `/api` a `http://localhost:3000`).
- **Vistas** (tabs internas del Dashboard): Reporte Diario (default), Historial, Nueva Compra; admin: Precios Materiales, Precios Web, Usuarios, Sucursales, Datos empresa.
- **Deploy**: Vercel; `vercel.json` rewrites `/api/*` al backend en Render, el resto a `index.html` (SPA).

## Nueva funcionalidad: Modo "Romana" en `NuevaCompra`

Se agregó una opción en el formulario de `NuevaCompra` para registrar compras en modo `romana`.

- Interfaz: checkbox "Romana" que muestra los campos `Peso Entrada` y `Peso Salida`.
- Admite uno o más metales por compra: el peso neto (entrada - salida) se reparte entre las líneas. Con una sola línea el peso se autocompleta; con varias, el operador lo asigna manualmente guiado por un indicador de peso restante (neto / asignado / restante).
- "Registrar Compra" permanece deshabilitado hasta que la suma de pesos de los materiales cuadra exactamente con el peso neto.
- El frontend envía `tipo_compra: 'romana'`, `peso_entrada` y `peso_salida` al endpoint de transacciones.
