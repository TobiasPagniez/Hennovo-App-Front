# Hennovo App — Frontend

Aplicación web de gestión comercial y logística para Hennovo, construida en React + Vite. Permite administrar clientes, productos, precios, pedidos, rutas de reparto, vehículos, remitos, pagos, cheques, gastos, pérdidas, control horario y más, con control de acceso por roles (`ADMIN` / `EMPLEADO`).

## Stack técnico

- **React 19** + **Vite** como bundler y servidor de desarrollo
- **React Router v7** para el ruteo y las rutas protegidas
- **Axios** para el consumo de la API (con interceptores de JWT y manejo de sesión expirada)
- **React Hook Form** para los formularios
- **Recharts** para reportes y gráficos
- **Lucide React** para iconografía
- CSS plano organizado por módulo (sin framework de estilos)
- **ESLint** + **Prettier** para calidad y formato de código

## Requisitos previos

- Node.js 18 o superior
- Un backend de Hennovo corriendo (o accesible) que exponga la API REST consumida por esta app

## Instalación

```bash
git clone <url-del-repositorio>
cd hennovo-app-front
npm install
```

## Variables de entorno

Copiá el archivo de ejemplo y completá la URL del backend:

```bash
cp .env.example .env
```

```env
# URL pública del backend para el entorno correspondiente.
# No incluir tokens, contraseñas ni otras credenciales en variables VITE_*.
VITE_API_URL=http://localhost:8080
```

## Scripts disponibles

| Comando           | Descripción                                      |
| ------------------ | ------------------------------------------------ |
| `npm run dev`       | Levanta el servidor de desarrollo de Vite         |
| `npm run build`     | Genera el build de producción en `dist/`          |
| `npm run preview`   | Sirve localmente el build de producción           |
| `npm run lint`      | Corre ESLint sobre todo el proyecto               |

## Estructura del proyecto

```
src/
├── assets/            # Imágenes e iconos estáticos
├── components/        # Componentes reutilizables (Navbar, Sidebar, Modal, etc.)
├── context/           # Contextos globales (Auth, Diálogos de confirmación/aviso)
├── hooks/              # Hooks propios (ej. useDebounce)
├── layouts/            # Layouts de la app (MainLayout con Navbar + Sidebar)
├── pages/              # Páginas/módulos, uno por dominio de negocio
├── services/           # Capa de acceso a la API (un archivo por recurso)
├── styles/             # Estilos globales y variables CSS
└── utils/               # Utilidades (formateo de moneda, fechas, validadores, etc.)
```

## Módulos principales

La navegación está organizada por áreas, cada una con control de acceso por rol:

- **Comercial**: Clientes, Categorías de cliente, Productos, Precios, Pedidos, Pedidos habituales, Planilla de ventas
- **Logística**: Rutas, Vehículos, Croquis de carga, Remitos
- **Finanzas**: Pagos, Cheques, Gastos, Pérdidas
- **Administración**: Usuarios, Control horario

Algunos módulos (Categorías de cliente, Precios, Usuarios, Cheques) están restringidos al rol `ADMIN`.

## Autenticación

La app usa autenticación por JWT contra el endpoint `/api/auth/login` del backend:

- El token y los datos del usuario se guardan en `localStorage`.
- `AuthContext` rehidrata la sesión al recargar la app.
- Las rutas se protegen con el componente `ProtectedRoute`, que además soporta restricción por roles (`rolesPermitidos`).
- Ante una respuesta `401` del backend, la sesión se limpia automáticamente y se redirige a `/login`.

## Desarrollo

```bash
npm run dev
```

La aplicación queda disponible por defecto en `http://localhost:5173` y se conecta a la API definida en `VITE_API_URL`.

## Build de producción

```bash
npm run build
npm run preview
```

Los archivos generados quedan en la carpeta `dist/`, listos para desplegar en cualquier servidor de archivos estáticos.
