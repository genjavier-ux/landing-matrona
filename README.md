# Landing Matrona (React + Node + MySQL)

Proyecto base para una landing autoadministrable de una matrona en Chile.

## Estructura

- `frontend/`: aplicación React creada para Vite.
- `backend/`: API Node.js/Express con MySQL.
- `backend/sql/schema.sql`: esquema inicial y datos semilla.

## Requisitos

- Node.js 20+
- MySQL 8+

## Configuración rápida

1. Crear BD y tablas ejecutando `backend/sql/schema.sql`.
2. Copiar `backend/.env.example` a `backend/.env` y ajustar credenciales.
3. Instalar dependencias:
   - `cd backend && npm install`
   - `cd frontend && npm install`
4. Ejecutar en desarrollo:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

## Funcionalidades implementadas

- Landing pública con servicios, comentarios, contacto, suscripción y redes.
- Envío de comentarios usando código de validación.
- Login admin con JWT.
- Endpoint admin para editar servicios y moderar comentarios.
