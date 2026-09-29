# Auditoría arquitectónica de Flowdy

**Fecha:** 2026-09-27  
**Fase:** 1 — auditoría; revisión estática, sin cambios en la aplicación.

## Alcance y límites

Se revisaron los manifiestos y configuración de despliegue, puntos de entrada, rutas, controladores, middlewares, servicios, modelos y migraciones, páginas y scripts principales del admin y landing, además del README y ejemplos REST. No se ejecutaron la aplicación, migraciones ni pruebas: no se verificó una base de datos ni se inspeccionaron secretos del entorno. Los hallazgos describen el código observado; las condiciones de despliegue que dependen del proveedor requieren validación en un entorno de staging.

## Evaluación ejecutiva

Flowdy es actualmente un monolito Express pequeño con dos clientes estáticos independientes. La separación landing/admin ya existe a nivel de páginas, pero la API no impone esa frontera en el servidor: controladores concentran HTTP, reglas de negocio, Sequelize e integraciones externas. El riesgo más urgente no es la estructura de carpetas sino el control de acceso: las rutas administrativas y varias respuestas con datos personales no tienen autenticación/autorización verificable en servidor.

La recomendación es evolucionar hacia un **monolito modular**, no microservicios. Mantener contratos y rutas actuales inicialmente; ordenar el código por módulos de negocio y extraer políticas transversales explícitas. Migrar por flujos verticales con pruebas de caracterización y cambios de esquema compatibles hacia atrás.

## Hallazgos priorizados

### Críticos — atender antes de exponer el sistema a producción

1. **No hay autorización de servidor en las rutas administrativas.** Las rutas de usuarios, productos, categorías, estadísticas y mutaciones de pedidos no aplican middleware que verifique JWT ni rol. Las comprobaciones de rol del frontend dependen de `sessionStorage` y son eludibles. Además, el endpoint público de pedidos permite listar, consultar por ID, cambiar estado y borrar. Evidencia: [src/app.js](src/app.js), [src/routes/usuario.routes.js](src/routes/usuario.routes.js), [src/routes/producto.routes.js](src/routes/producto.routes.js), [src/routes/categoria.routes.js](src/routes/categoria.routes.js), [src/routes/pedido.routes.js](src/routes/pedido.routes.js), [src/routes/estadisticas.routes.js](src/routes/estadisticas.routes.js), [client/admin/js/dashboard/dashboard.js](client/admin/js/dashboard/dashboard.js).

2. **Exposición de credenciales y datos personales.** `obtenerUsuarioPorId`, crear y actualizar usuario serializan modelos sin excluir `password`; esto expone el hash bcrypt a quien alcance esas rutas. El historial y consulta individual de pedidos devuelven teléfono, email, cédula/RUC y dirección sin autenticación. Evidencia: [src/controllers/usuario.controller.js](src/controllers/usuario.controller.js), [src/controllers/pedido.controller.js](src/controllers/pedido.controller.js).

3. **Cuenta de administrador sembrada con contraseña pública.** El seeder inserta `adm@correo.com` con contraseña literal `123`; el script de despliegue además ejecuta seeders. Debe eliminarse el secreto conocido y rotarse cualquier credencial que se haya usado en un entorno real. Evidencia: [src/database/seeders/20260419185502-administrador.js](src/database/seeders/20260419185502-administrador.js), [railway.toml](railway.toml).

4. **Fechas interpoladas en SQL.** El filtro `desde`, `hasta` y `año` se inserta en cadenas de `Sequelize.literal` en la consulta de estadísticas. No se validan ni parametrizan esos valores; sustituir por parámetros enlazados/operadores Sequelize y validar formatos y rangos. Evidencia: [src/controllers/estadisticas.controller.js](src/controllers/estadisticas.controller.js).

### Altos — riesgo funcional, privacidad o disponibilidad

5. **El despliegue ejecuta `sequelize.sync()` y seeders al iniciar.** `src/index.js` sincroniza modelos en cada arranque, aunque hay migraciones; esto permite que modelos alteren el esquema sin una migración revisada. Railway también ejecuta migraciones y seeders dentro del comando de inicio. Separar migraciones del arranque de cada instancia y dejar un único mecanismo de evolución del esquema. Evidencia: [src/index.js](src/index.js), [railway.toml](railway.toml).

6. **Pedidos con validación de negocio insuficiente.** Se valida presencia de algunos objetos, pero no que cada cantidad sea un entero positivo, que el producto esté activo o que el stock alcance. El backend calcula el total a partir del precio actual (correcto como principio), pero hace una consulta secuencial por línea y no reserva/descarga stock. Para ventas concurrentes, definir la política de stock y transacción/bloqueo antes de implementar inventario. El `catch` intenta `rollback()` incluso si la transacción no llegó a crearse; puede ocultar el error original. La aritmética con `Number`/`parseFloat` también puede redondear importes. Evidencia: [src/controllers/pedido.controller.js](src/controllers/pedido.controller.js).

7. **Riesgo de XSS almacenado y de inyección HTML en correo.** Landing y admin interpolan campos de productos/pedidos en `innerHTML`; el correo arma HTML con datos del comprador y productos sin escape. Si campos editables contienen markup, se renderiza como HTML. Renderizar texto con APIs DOM seguras y escapar contenido HTML en la plantilla. Evidencia: [client/landing/js/obtenerProductos.js](client/landing/js/obtenerProductos.js), [client/landing/js/carrito.js](client/landing/js/carrito.js), [client/admin/js/dashboard/productos.js](client/admin/js/dashboard/productos.js), [src/services/email.service.js](src/services/email.service.js).

8. **Subida de archivos solo limita tamaño.** Multer guarda hasta 5 MB en memoria, pero no filtra MIME/contenido ni valida archivo; rutas de producto no requieren autorización. Limitar tipos permitidos mediante inspección real del archivo, proteger la ruta, manejar tamaño/límites y limpiar la imagen anterior solo tras confirmar la nueva subida. Evidencia: [src/middlewares/upload.js](src/middlewares/upload.js), [src/controllers/producto.controller.js](src/controllers/producto.controller.js), [src/services/uploadImage.js](src/services/uploadImage.js).

9. **Autenticación incompleta y throttling desigual.** Login firma JWT con `JWT_SECRET` y expiración del entorno, pero no hay esquema de validación al inicio ni middleware HTTP que verifique el token. El rate limiter se aplica a `/api`, no a `/login` ni `/usuarios`; por tanto no protege contra fuerza bruta de login ni llamadas a usuarios. `cors()` usa configuración abierta por defecto; no hay Helmet. El `trust proxy = 1` fijo debe coincidir con la topología real del proxy para no falsear IPs de rate limiting. Evidencia: [src/controllers/login.controller.js](src/controllers/login.controller.js), [src/app.js](src/app.js), [src/middlewares/rateLimit.js](src/middlewares/rateLimit.js), [src/const/globalConstants.js](src/const/globalConstants.js).

10. **Token WebSocket en query string y política de conexión débil.** El JWT se pasa en `?token=` desde clientes; puede quedar registrado en logs o telemetría. WebSocket acepta conexiones sin token para la landing, sin allowlist de origen visible, y no separa conexión, autenticación, registro ni emisión. El cliente admin carga clientes WebSocket diferentes: dashboard crea uno en productos y Operador carga `webSocket.js`; los manejadores no reflejan consistentemente los eventos que el servidor emite (`producto_*`, `forced_logout`). `webSocket.js` intenta usar `GestorProductos` desde la página de Operador, donde no se carga ese módulo. Acordar protocolo y eventos antes de extraer un cliente reutilizable. Evidencia: [src/services/websocket.js](src/services/websocket.js), [client/admin/js/dashboard/productos.js](client/admin/js/dashboard/productos.js), [client/admin/js/webSocket.js](client/admin/js/webSocket.js), [client/admin/pages/operador.html](client/admin/pages/operador.html), [client/landing/js/websocket.js](client/landing/js/websocket.js).

11. **Deriva entre migraciones y modelos.** La migración define `estados_pedido.orden` como `STRING` y `color` como obligatorio/único; el modelo define `orden` como entero y `color` nullable/no único. En migración de usuarios el rol por defecto es `admin`, en el modelo es `lector`. `pedidos.estado_id` no declara FK aunque la asociación de Sequelize sí relaciona ambos modelos. El cargador de modelos y `sync()` pueden ocultar esta deriva en desarrollo. Comparar el esquema desplegado antes de preparar migraciones correctivas. Evidencia: [src/database/migrations/20260422152534-create-estados-pedido.js](src/database/migrations/20260422152534-create-estados-pedido.js), [src/database/models/estados_pedido.js](src/database/models/estados_pedido.js), [src/database/migrations/20260420195513-create-usuarios.js](src/database/migrations/20260420195513-create-usuarios.js), [src/database/models/usuarios.model.js](src/database/models/usuarios.model.js), [src/database/migrations/20260420194553-create-pedidos.js](src/database/migrations/20260420194553-create-pedidos.js), [src/database/models/index.js](src/database/models/index.js).

### Medios — mantenibilidad, escalabilidad y DX

12. **Controladores con demasiadas responsabilidades y acceso directo a ORM.** Todos los controladores consultan/actualizan modelos; el flujo de pedidos incluye transacción, snapshots, suma de totales, email y respuesta HTTP. Producto coordina Cloudinary y WebSocket. No existen servicios de negocio ni repositorios para aislar persistencia; las pruebas unitarias requieren Express/DB o mocks de modelos globales. Evidencia: [src/controllers](src/controllers), [src/services](src/services).

13. **Contratos HTTP inconsistentes y validación fragmentaria.** Conviven `{mensaje}`, `{message}`, `{error}`, `{success, pedidos}`, respuestas directas de Sequelize y códigos 500 que incluyen `error.message`. La validación dedicada se limita principalmente al email de pedido y algunas comprobaciones inline. Hay un middleware de error general, pero no errores tipados ni respuesta consistente; tampoco hay paginación en listados de productos, usuarios o pedidos. El manejador actual sí oculta el mensaje general en 500, pero ciertos controladores lo exponen explícitamente.

14. **Esquema sin estrategia temporal/audit clara.** Todas las entidades desactivan timestamps de Sequelize; cliente registra `fecha_registro` y pedido/pago tienen `fecha`, pero no hay `updatedAt` ni historial de cambios. Los snapshots en `detalle_pedidos` y `pedidos` son una buena base para historial. La asociación Cliente→Pedidos permite `CASCADE`, por lo que borrar un cliente puede borrar pedidos históricos. No se debe añadir `deletedAt` indiscriminadamente: conservar el estado/desactivación de usuarios ya modelado, evitar borrar pedidos pagados/operativos, y decidir borrado lógico selectivo para catálogo; cambiar reglas de borrado requiere migración y plan de datos.

15. **Frontend sin capa de API ni módulos ES coherentes.** Hay varios `fetch` dispersos, módulos IIFE/variables globales, handlers inline en HTML y un `window.cerrarSesion`. No hay separación clara entre API, estado, renderizado y eventos; WebSocket, DOM y recargas se mezclan en módulos. Mantener las apps vanilla por ahora y convertir cada página a módulos ES con entradas explícitas, API client y eventos UI.

16. **Dependencias y documentación desalineadas.** `package.json` se llama `landingpage-postres`; README indica MySQL, pero configuración usa PostgreSQL. Hay `package-lock.json`, `pnpm-lock.yaml` y Railway utiliza pnpm; el `pnpm-workspace.yaml` no declara paquetes cliente, así que no hay evidencia de un workspace multi-paquete. Scripts invocan `sequelize-cli`, pero no está declarado en dependencias; `validateEmail.js` importa `validator` sin dependencia directa declarada (aparece como dependencia transitiva en el lock de npm). No hay scripts o suites de test/lint/build definidos ni archivos de test encontrados. No borrar lockfiles hasta acordar gestor: la recomendación inicial es pnpm por alineación con Railway, con instalación reproducible y comandos CLI declarados explícitamente.

17. **Configuración y despliegue acoplados a nombres/puertos distintos.** `PORT` se lee con fallback 3001, README documenta 3000, ejemplos REST y un WebSocket usan 5001, y un cliente hardcodea `www.flowdy.fit`; otros derivan host actual. Producción usa `DATABASE_URL`, mientras desarrollo requiere `DB_*`; configuración no valida variables obligatorias. TLS de PostgreSQL establece `rejectUnauthorized: false`. Consolidar configuración, validar al iniciar, respetar el `PORT` del proveedor y revisar topología TLS/proxy. El despliegue sirve estáticos desde Express y además incluye una sección `[deploy.static]` en Railway; aclarar si esa sección se usa o es configuración obsoleta.

18. **Logging y mantenimiento de imágenes.** Se usa `console.*` directamente y faltan logs correlacionados por petición/evento. En fallo de eliminación Cloudinary se suprime el error; al actualizar imagen se elimina primero la anterior y luego se sube la nueva, por lo que un fallo de subida puede dejar el producto apuntando a una imagen ya borrada. Existe función de corrección de cédula que se importa pero no se monta en ruta. Evidencia: [src/services/uploadImage.js](src/services/uploadImage.js), [src/routes/pedido.routes.js](src/routes/pedido.routes.js), [src/controllers/pedido.controller.js](src/controllers/pedido.controller.js).

## Mapa actual de dependencias

| Área | Flujo observado | Acoplamiento principal |
|---|---|---|
| HTTP | `app.js` → rutas → controladores | Rutas importan controladores globales; controladores envían respuesta y capturan errores localmente. |
| Persistencia | Controladores → `database/models` → Sequelize/PostgreSQL | No hay repositorios; modelos y asociaciones centralizados en `models/index.js`. |
| Integraciones | Controladores → Cloudinary/email/WebSocket | Servicios externos mezclados con casos de uso; eventos se emiten directamente después de CRUD. |
| Admin | HTML clásico → scripts globales → `fetch`/DOM/WS | Roles de UI en almacenamiento del navegador; varios puntos de entrada y clientes WS. |
| Landing | HTML clásico → carrito/API/DOM/WS | Estado de carrito en `localStorage`; sin API central ni verificación de precios local. |
| Datos | migrations + models + `sync()` + seeder | Más de una fuente puede modificar/definir el esquema. |

## Arquitectura objetivo propuesta

Adoptar un **monolito modular por capacidad de negocio**, conservando CommonJS inicialmente para evitar combinar una migración de módulos con la reingeniería funcional. Una forma destino razonable:

```text
src/
  config/                 # lectura y validación de entorno
  database/               # Sequelize, migraciones, seeders, conexión
  modules/
    auth/                 # login, JWT, authenticate/authorize
    usuarios/
    productos/
    categorias/
    pedidos/
    estadisticas/
  infrastructure/
    cloudinary/
    email/
    websocket/            # autenticación, conexiones, eventos, adapter
  shared/
    errors/               # errores de aplicación y errorHandler
    http/                 # async handler y respuestas, solo si reduce duplicación
    validation/           # integración de schemas
    logging/
  app.js                  # composición Express
  server.js               # lifecycle DB/HTTP/WebSocket y shutdown
client/
  admin/js/{core,api,modules,pages,websocket}/
  landing/js/{core,api,modules,pages,websocket}/
```

Dependencias permitidas por defecto: **route → controller → service → repository → model/DB**. El servicio recibe dependencias por composición/inyección simple; el repositorio contiene consultas Sequelize y no decide políticas del negocio. Controladores traducen request/response, servicios coordinan reglas/transacciones y publican eventos de aplicación mediante un puerto, e infraestructura adapta eventos a WebSocket/email/Cloudinary. Los eventos deben emitirse después del commit. Evitar un event bus distribuido o capas genéricas que no resuelvan una necesidad actual.

Para validación recomiendo **Zod** como única librería de schemas de body/params/query y configuración, por su API composable y posibilidad de compartir conceptos con frontend sin compartir código de confianza. Mantener validación real de archivos en el borde de upload. Para pruebas recomiendo **Vitest** con servicios puros primero, repositorios con PostgreSQL de test cuando exista infraestructura, y pruebas HTTP de flujos esenciales. Para logging estructurado recomiendo **Pino**; agregar identificador de request y no registrar contraseñas, JWT, PII completa ni contenido de archivos.

## Decisiones de datos y compatibilidad

- Mantener PostgreSQL, Sequelize, rutas REST y forma/semántica existente durante la primera migración. Antes de unificar envelopes API, registrar cada contrato consumido por admin y landing y cubrirlo con pruebas.
- Desactivar `sequelize.sync()` como mecanismo de esquema; conservar migraciones como fuente única. Primero comparar producción/staging con migraciones y modelos; corregir drift mediante migraciones aditivas, respaldadas y reversibles cuando sea viable.
- Añadir índices con evidencia de consultas: claves foráneas, estado/fecha de pedido, y claves de búsqueda aprobadas. No crear índices indiscriminadamente. Revisar unicidad de cédula y email según reglas reales del negocio.
- No usar timestamps automáticos a ciegas porque las tablas existentes no los tienen y las fechas actuales son parte del contrato. Añadir campos de creación/actualización mediante migraciones selectivas y preservar `fecha`/`fecha_registro`; justificar campos de auditoría por entidad.
- Usar constraints para invariantes (precio/total no negativos, cantidad positiva, FK de estado) una vez saneados los datos. Preferir restricción/estado de cancelación sobre borrar pedidos; proteger referencias históricas y revisar cascadas Cliente→Pedido y Categoría→Producto.
- En pedidos, validar cada línea, resolver productos en lote dentro de la transacción, recalcular precios en backend y definir una política explícita de stock concurrente. Mantener snapshots para que cambios del catálogo no alteren ventas históricas.

## Secuencia sugerida tras aprobación

1. **Contención de seguridad:** exigir `authenticate` y `authorize` por ruta, cerrar exposición de hash/PII, limitar login, restringir CORS, validar entorno, rotar credenciales conocidas y parametrizar fechas. Mantener landing pública solo para catálogo y creación de pedido.
2. **Caracterización:** documentar rutas/respuestas/eventos actuales y añadir pruebas de login, permisos, catálogo y pedido; introducir error handler/validación/logging sin migrar todos los módulos de golpe.
3. **Base y arranque:** separar `app` de lifecycle de servidor, quitar `sync()`, fijar configuración y un flujo único de migraciones. Inspeccionar esquema real antes de modificar constraints o defaults.
4. **Módulos backend verticales:** migrar autenticación/usuarios, productos/categorías y después pedidos/estadísticas; por cada módulo comprobar contratos, datos, pruebas y eventos antes de avanzar.
5. **WebSocket e interfaces:** definir protocolo de eventos estable; extraer conexión/reconexión/suscripciones; modularizar API y páginas vanilla progresivamente. Mantener dos apps e identidad CSS; no introducir React sin necesidad medible.
6. **Cierre operativo:** alinear pnpm/locks/scripts, `.env.example`, README, CI de tests y smoke tests de staging; validar carga de archivos, emails, WebSocket y despliegue detrás de proxy.

## Criterios de aceptación para la refactorización

- Toda ruta administrativa y de datos privados está protegida y probada por rol; la landing conserva catálogo y checkout públicos definidos.
- Respuestas no exponen hashes, stack traces, secretos ni datos de clientes fuera del alcance autorizado.
- Ninguna aplicación productiva depende de `sequelize.sync()`; migrations reproducibles contra una copia de la base existente.
- Requests inválidos fallan consistentemente antes de llegar a reglas/consultas; filtros de fecha parametrizados.
- Flujos actuales de CRUD, login, checkout, subida de imágenes, estadísticas y eventos conservan contratos o tienen cambios documentados antes/después.
- Pruebas automatizadas cubren auth/authorization, pedidos, validación, consultas críticas y eventos principales; ejecución de despliegue comprobada en staging.
- Admin y landing mantienen identidad visual, módulos de página con APIs centralizadas y WebSocket sin lógica de DOM dentro del transporte.

---

**Estado:** auditoría entregada para revisión. No se ha iniciado la refactorización. La siguiente fase debe comenzar únicamente después de aprobar este diagnóstico y sus prioridades.
