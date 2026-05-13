# Flowdy

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express.js-API-black)
![Sequelize](https://img.shields.io/badge/Sequelize-ORM-blue)
![MySQL](https://img.shields.io/badge/MySQL-Database-orange)
![WebSockets](https://img.shields.io/badge/WebSockets-Realtime-purple)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20Storage-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

**Flowdy** es una aplicación web orientada a la **gestión de pedidos para negocios gastronómicos o comercio digital**, compuesta por una **landing pública para clientes** y un **panel administrativo para operadores**.
El sistema permite visualizar productos, realizar pedidos y gestionar el flujo operativo en tiempo real.

---

# Características

* Gestión de **productos y categorías**
* Registro de **pedidos de clientes**
* **Panel administrativo** para control operativo
* **Estadísticas en tiempo real**
* **WebSockets** para actualización instantánea de pedidos
* **Envío automático de correos de confirmación**
* **Carga de imágenes** mediante Cloudinary
* **Sistema de autenticación de usuarios**
* **Rate limiting** para protección de la API

---

# Arquitectura del Sistema

El proyecto sigue una arquitectura **cliente–servidor** separada.

```
Cliente (Landing)
        │
        │ HTTP / WebSocket
        ▼
Backend API (Node.js + Express)
        │
        │ ORM
        ▼
Base de Datos (Postgresql)
```

Componentes principales:

* **Landing page**: interfaz pública donde los clientes exploran productos y realizan pedidos.
* **Panel administrativo**: dashboard para gestión interna.
* **API REST**: lógica de negocio y acceso a base de datos.

---

# Estructura del Proyecto

```
flowdy
│
├── client
│   ├── landing        # Sitio público para clientes
│   └── admin          # Panel administrativo
│
├── src
│   ├── controllers    # Lógica de negocio
│   ├── routes         # Endpoints API
│   ├── services       # Servicios externos
│   ├── middlewares    # Seguridad y validaciones
│   ├── database
│   │   ├── models
│   │   ├── migrations
│   │   └── seeders
│   └── config
│
├── api-rest           # Archivos para probar endpoints
│
├── package.json
└── railway.toml
```

---

# Tecnologías

## Backend

* Node.js
* Express
* Sequelize ORM
* MySQL / MariaDB
* Nodemailer
* WebSockets
* Cloudinary

## Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js

## Infraestructura

* Railway
* Render
* SMTP Email Services (Brevo)

---

# Base de Datos

La base de datos se gestiona mediante **Sequelize CLI** utilizando:

* **Models**
* **Migrations**
* **Seeders**

Tablas principales:

* categorias
* productos
* clientes
* pedidos
* detalle_pedidos
* pagos
* usuarios
* estados_pedido

---

# Instalación

## 1. Clonar el repositorio

```
git clone https://github.com/tu-usuario/flowdy.git
cd flowdy
```

## 2. Instalar dependencias

```
npm install
```

---

# Configuración

Crear archivo `.env` en la raíz del proyecto.

```
PORT=3000

DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

BREVO_SMTP_USER=
BREVO_SMTP_PASS=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# Migraciones y Seeders

Ejecutar migraciones de base de datos:

```
npx sequelize-cli db:migrate
```

Crear datos iniciales (administrador):

```
npx sequelize-cli db:seed:all
```

---

# Ejecución

Modo desarrollo:

```
npm run dev
```

Modo producción:

```
npm start
```

---

# Pruebas de API

La carpeta **api-rest** contiene archivos `.rest` para probar endpoints.

Compatible con:

* REST Client (VSCode)
* Postman
* Insomnia

Ejemplo:

```
api-rest/productos.rest
api-rest/pedido.rest
```

---

# Funcionalidades en Tiempo Real

El sistema implementa **WebSockets** para:

* actualización automática de pedidos
* notificaciones al panel administrativo
* sincronización entre operadores

---

# Flujo de Pedido

1. Cliente visualiza productos en la landing.
2. Añade productos al carrito.
3. Envía pedido.
4. Backend registra pedido en base de datos.
5. Se envía **correo de confirmación al cliente**.
6. El panel administrativo recibe actualización en tiempo real.

---

# Despliegue

El proyecto incluye configuración para **Railway**.

Archivo:

```
railway.toml
```

También puede desplegarse en:

* Render
* Railway
* VPS Node.js
* Docker

---

# Seguridad

Medidas implementadas:

* Rate limiting
* Validación de email
* Sanitización de datos
* Separación de capas (controller / service)

---

# Mejoras Futuras

* Integración de pagos online
* Panel de reportes avanzado
* Autenticación con JWT refresh tokens
* Implementación de Docker
* Dashboard analítico avanzado

---

# Autor

Daniel
Ingeniero en Tecnologías de la Información y Comunicación

Especialidad: desarrollo backend, APIs REST y arquitectura web.
