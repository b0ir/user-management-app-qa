# App de Gestión de Usuarios

Aplicación web desarrollada en TypeScript para la gestión de usuarios.

## Instalación y Configuración

### Prerrequisitos

- Node.js 18.x o superior
- npm 9.x o superior

### Instalación Local

1. **Clonar el repositorio**

```bash
git clone https://github.com/username/user-management-app-qa.git
cd user-management-app-qa
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Ejecutar en modo desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Construcción para Producción

```bash
npm run build
npm run preview
```

## Arquitectura del Proyecto

```
src/
├── components/         # Componentes React reutilizables
│   ├── UserForm.tsx    # Formulario de creación/edición
│   └── UserList.tsx    # Lista de usuarios
├── services/           # Lógica de API y servicios
│   └── api.ts          # Simulación de API REST
├── types/              # Definiciones de TypeScript
│   └── User.ts         # Interfaces y tipos de usuario
├── utils/              # Utilidades y helpers
│   └── validation.ts   # Validaciones (RUT, email, etc.)
└── App.tsx             # Componente principal
```
