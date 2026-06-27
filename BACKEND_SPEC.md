# SIVET — Especificación Técnica del Backend (v2 · estado real implementado)

> **Documento de contrato API.** Refleja la **realidad exacta** del backend ya construido
> (Spring Boot 4.1 · Java 21 · PostgreSQL · Hibernate/JPA · Spring Security + JWT).
> Reemplaza a la v1 (generada por ingeniería inversa del frontend), que describía el mock
> json-server. Donde la v1 proponía mejoras, aquí se documentan **ya implementadas**.
>
> **Stack del cliente:** Angular (standalone + Signals). `environment.apiUrl = http://localhost:8080`.
> **Paquete base backend:** `com.sivet.api`.

---

## 0. Cambios clave respecto al mock (leer primero)

1. **IDs = UUID v4.** Todas las PK son `UUID` y las asigna el backend. Cualquier `id` que envíe
   el cliente en un `POST` se **ignora**. Todas las FK (`clienteId`, `mascotaId`, `productoId`,
   `recetaId`, `atencionId`, `clinica_id`) son UUID.

2. **Multi-tenant obligatorio.** Cada entidad de negocio cuelga de una `Clinica` (tenant) por una
   columna `clinica_id`, **invisible para el cliente**: el backend la estampa y filtra en cada
   operación a partir del JWT. El frontend nunca envía ni lee `clinica_id`.

3. **Autenticación JWT stateless.** Login real `POST /auth/login` (el antiguo
   `GET /usuarios?username=&password=` **fue eliminado**). El password se almacena **hasheado**
   (BCrypt) y nunca se expone.

4. **Sin archivos ni imágenes.** No hay `multipart/form-data`. `Mascota.foto` es un `string`
   **nullable**. `Estudio` es **solo texto** (sin RX/PDF/ECO adjuntos). Los documentos PDF/Excel
   se **generan** on-the-fly (§4), no se almacenan.

5. **Enums validados.** Los campos enum aceptan/devuelven exactamente los literales del contrato
   (con tildes y espacios, p. ej. `"Consulta general"`, `"Vacunación"`). Un valor fuera del
   conjunto produce `400`.

6. **Formato de fechas.**
  - ISO 8601 con hora (`"2026-05-24T10:30:00"`) en `Atencion.fecha` y `Venta.fecha`.
  - Solo-fecha (`"YYYY-MM-DD"`) en `Cita.fecha`; `"HH:mm"` en `Cita.hora`.
  - `Estudio.fecha` es texto libre (`string`).

---

## 1. Autenticación, Headers y Tenant

### 1.1 Login — `POST /auth/login` (público)

| | |
|---|---|
| **Body** | `{ "credencial": "<username>", "password": "<texto plano>" }` |
| **200** | `{ "token": "<JWT>", "payload": { ... } }` |
| **401** | Credenciales inválidas → `{ "message": "Usuario o contraseña incorrectos." }` (mensaje genérico, no revela si el usuario existe) |

**`payload` (claims del JWT):**
```json
{
  "id_usuario": "<uuid>",
  "nombre": "<string>",
  "rol": "<string>",
  "veterinaria_id": "<uuid del tenant>"
}
```
El JWT se firma con **HMAC (HS384)**, incluye `iat`/`exp` y expira a las **8 horas**. El
frontend persiste la sesión y rehidrata la clínica con `GET /clinicas/{veterinaria_id}`.

### 1.2 Headers obligatorios

| Header | Cuándo | Regla |
|---|---|---|
| `Authorization: Bearer <token>` | **Todas** las rutas excepto `POST /auth/login` y `POST /clinicas` (alta pública de tenant). | JWT válido o `401`. |
| `X-Tenant-ID: <uuid>` | **Todas** las rutas autenticadas **excepto** `/auth/**` y `/clinicas/**`. | Debe **coincidir** con el claim `veterinaria_id` del token. Si falta o difiere ⇒ `403`. El JWT firmado es la autoridad; nunca se confía solo en el header. |

- **Lectura:** cada `GET` se filtra por `clinica_id = veterinaria_id`. Jamás se ven datos de otra clínica.
- **Escritura:** cada `POST/PUT/PATCH/DELETE` estampa/valida el tenant. Operar sobre un registro de
  otra clínica devuelve `404` (no `403`), para no filtrar existencia.
- `GET /clinicas/{id}` está exento del header `X-Tenant-ID`, pero valida que `id` sea el del propio
  token; si no, `404`.

### 1.3 CORS
Permitido el origen `http://localhost:4200`; métodos `GET, POST, PUT, PATCH, DELETE, OPTIONS`;
headers `Authorization, Content-Type, X-Tenant-ID`; credenciales habilitadas.

### 1.4 Modelo de errores (JSON uniforme)
```json
{ "timestamp": "<ISO>", "status": 422, "error": "Unprocessable Entity",
  "message": "<detalle>", "path": "/ventas", "errors": { "campo": "motivo" } }
```
| Status | Cuándo |
|---|---|
| `400` | Validación de DTO fallida (incluye `errors` por campo) o enum/JSON inválido. |
| `401` | Sin token / token inválido o expirado / credenciales incorrectas. |
| `403` | `X-Tenant-ID` ausente o distinto del tenant del token. |
| `404` | Recurso inexistente **o** perteneciente a otro tenant. |
| `409` | Conflicto de agenda (franja ocupada). |
| `422` | Regla de negocio (stock insuficiente, receta vacía, hora fuera de franja, integridad de inventario). |

---

## 2. Diccionario de Datos

Tipos en TypeScript/JSON. **Obligatorio** = siempre presente. `?` = opcional. Todas las entidades
de negocio tienen además, en la base de datos, una FK `clinica_id` (UUID) **no expuesta** al cliente.

### 2.1 `Usuario` — `usuarios`
| Campo | Tipo | Oblig. | Notas |
|---|---|:---:|---|
| `id` | UUID | ✅ | PK. |
| `username` | string | ✅ | Único por sistema. |
| `password` | string | ✅ (solo entrada) | Se guarda **hasheado** (BCrypt). **Nunca** se devuelve. |
| `nombre` | string | ✅ | Claim `nombre`. |
| `rol` | string | ✅ | p. ej. `"Admin"`, `"Veterinario"`. Claim `rol`. |
| `clinica_id` | UUID | ✅ | FK → `Clinica.id` (tenant). |

### 2.2 `Clinica` — `clinicas` (tenant raíz; sin `clinica_id`)
| `id` UUID ✅ PK · `nombre` ✅ · `sede` ✅ · `ruc` ✅ (11 díg.) · `telefono` ✅ · `email` ✅ · `direccion` ✅ |
|---|

### 2.3 `Cliente` — `clientes`
| `id` UUID ✅ · `nombre` ✅ · `dni` ✅ (8 díg.) · `telefono` ✅ · `email` ✅ · `direccion` ✅ |
|---|

### 2.4 `Mascota` — `mascotas`
| Campo | Tipo | Oblig. | Notas |
|---|---|:---:|---|
| `id` | UUID | ✅ | PK. |
| `nombre` | string | ✅ | |
| `especie` | enum | ✅ | `'Canino' \| 'Felino' \| 'Otros'`. |
| `raza` | string | ✅ | |
| `sexo` | enum | ✅ | `'M' \| 'H'`. |
| `edad` | string | ✅ | Texto, p. ej. `"3 años"`. |
| `peso` | number | ✅ | Kg. |
| `color` | string | ✅ | |
| `clienteId` | UUID | ✅ | FK → `Cliente.id`. |
| `foto` | string \| null | ✅ | **String nullable.** Sin archivos: solo URL o `null`. Siempre presente. |
| `esterilizada` | boolean | ✅ | |
| `microchip` | string | ❌ | Opcional. |

### 2.5 `Atencion` — `atenciones` (evento **inmutable**: sin PUT/DELETE)
| Campo | Tipo | Oblig. | Notas |
|---|---|:---:|---|
| `id` | UUID | ✅ | PK. |
| `mascotaId` | UUID | ✅ | FK → `Mascota.id`. |
| `fecha` | string (ISO c/hora) | ✅ | |
| `tipo` | enum | ✅ | `'Consulta general' \| 'Vacunación' \| 'Desparasitación' \| 'Cirugía'`. |
| `motivo` `diagnostico` `tratamiento` `veterinario` | string | ✅ | |
| `temperatura` | number | ✅ | |
| `frecCardiaca` `frecRespiratoria` | number (entero) | ✅ | |
| `recetaId` | UUID | ❌ | FK → `Receta.id`. Solo si emitió receta. |

### 2.6 `Receta` — `recetas`
| Campo | Tipo | Oblig. | Notas |
|---|---|:---:|---|
| `id` | UUID | ✅ | PK. |
| `atencionId` | UUID | ✅/❌ | FK → `Atencion.id` (1:1). Puede resolverse al crear la atención. |
| `items` | RecetaItem[] | ✅ | Embebido, **≥ 1**. Tabla hija `receta_items`. |

**RecetaItem** (embebido, sin id): `medicamento` ✅ · `dosis` ✅ · `via` ✅ · `duracion` ✅ · `indicaciones` ✅.

### 2.7 `Producto` — `productos`
| Campo | Tipo | Oblig. | Notas |
|---|---|:---:|---|
| `id` | UUID | ✅ | PK. |
| `codigo` | string | ✅ | SKU. |
| `nombre` | string | ✅ | |
| `categoria` | enum | ✅ | `'Medicamento' \| 'Antiparasitario' \| 'Antiinflamatorio' \| 'Vacuna' \| 'Alimento' \| 'Accesorio' \| 'Servicio'`. |
| `precio` | number | ✅ | PEN. |
| `stock` | number \| null | ✅ | **`null` si `'Servicio'`.** |
| `stockMin` | number \| null | ✅ | **`null` si `'Servicio'`.** |
| `unidad` | string | ✅ | |

> **Integridad (validada, `422`):** `Servicio` ⇒ `stock`/`stockMin` = `null`; cualquier otra
> categoría ⇒ ambos numéricos. Stock crítico ⇔ `stock != null && stockMin != null && stock <= stockMin`.

### 2.8 `Venta` — `ventas`
| Campo | Tipo | Oblig. | Notas |
|---|---|:---:|---|
| `id` | UUID | ✅ | PK. |
| `fecha` | string (ISO c/hora) | ✅ | Si no se envía, la fija el servidor. |
| `clienteId` | UUID | ✅ | FK → `Cliente.id`. |
| `items` | VentaItem[] | ✅ | Embebido, **≥ 1**. Tabla hija `venta_items`. |
| `total` | number | ✅ | PEN. |
| `metodoPago` | enum | ✅ | `'Efectivo' \| 'Tarjeta' \| 'Yape' \| 'Plin'`. |
| `estado` | enum | ✅ | `'completada' \| 'anulada'`. Al crear, **siempre** `'completada'` (lo fija el backend). |
| `vendedor` | string | ✅ | |
| `motivoAnulacion` | string | ❌ | Solo si `'anulada'`. |

**VentaItem** (embebido, snapshot): `productoId` ✅ (UUID) · `nombre` ✅ · `cantidad` ✅ · `precio` ✅.

### 2.9 `Cita` — `citas`
| Campo | Tipo | Oblig. | Notas |
|---|---|:---:|---|
| `id` | UUID | ✅ | PK. |
| `mascotaId` | UUID | ✅ | FK → `Mascota.id`. |
| `clienteId` | UUID | ✅ | FK → `Cliente.id`. |
| `fecha` | string (`YYYY-MM-DD`) | ✅ | |
| `hora` | string (`HH:mm`) | ✅ | Franjas de 30 min, `09:00`…`18:00`. |
| `motivo` | string | ✅ | |
| `estado` | enum | ✅ | `'pendiente' \| 'completada' \| 'cancelada'`. Al crear, **siempre** `'pendiente'`. |

### 2.10 `Estudio` — `estudios` (**solo texto**)
| `id` UUID ✅ · `mascotaId` UUID ✅ (FK) · `titulo` ✅ · `tag` ✅ (`"RX"\|"LAB"\|"ECO"`) · `fecha` string ✅ · `veterinario` ✅ |
|---|

### 2.11 Read models del Dashboard (solo lectura, calculados por tenant)
- **`FlujoPaciente`**: `{ dia: string, total: number }` — atenciones por día (últimos 7 días).
- **`ResumenMetodoPago`**: `{ metodo, monto, color (HEX), porcentaje (0–100) }` — ventas completadas por método.
- **`CitaHoy`**: `{ hora, mascota, cliente, tipo, vet }` — citas de hoy no canceladas.
  > Limitación actual: `Cita` no almacena `tipo` ni `vet`; se proyecta `tipo = motivo` y `vet = ""`.

---

## 3. Mapa de Endpoints

> Salvo `POST /auth/login` y `POST /clinicas`, todas exigen `Authorization` + (donde aplica) `X-Tenant-ID`.

### 3.1 Auth y Tenant
| Método | Ruta | Body / Query | Respuesta |
|---|---|---|---|
| `POST` | `/auth/login` | `{ credencial, password }` | `{ token, payload }` |
| `POST` | `/clinicas` | `Clinica` | `Clinica` creada (alta de tenant, **pública**) |
| `GET` | `/clinicas/{id}` | — | `Clinica` (solo la propia; si no, `404`) |
| `POST` | `/usuarios` | `Usuario` (sin `clinica_id`) | `Usuario` creado (sin `password`) |

### 3.2 Clientes — `/clientes`
`GET /clientes` · `GET /clientes/{id}` · `POST /clientes` · `PUT /clientes/{id}` · `DELETE /clientes/{id}`

### 3.3 Mascotas — `/mascotas`
`GET /mascotas` (opcional `?clienteId=<uuid>`) · `GET /mascotas/{id}` · `POST` · `PUT /mascotas/{id}` · `DELETE /mascotas/{id}`

### 3.4 Atenciones — `/atenciones`
`GET /atenciones` (opcional `?mascotaId=<uuid>`, orden desc por fecha) · `GET /atenciones/{id}` ·
`POST /atenciones`.
> El `POST` soporta **dos modos** (§5.4): `recetaId` de una receta existente, **o** una `receta`
> embebida (`{ ...atencion, "receta": { "items": [...] } }`) que crea atención + receta de forma atómica.

### 3.5 Recetas — `/recetas`
`GET /recetas` · `GET /recetas/{id}` · `POST /recetas` · **`GET /recetas/{id}/pdf`** (§4).

### 3.6 Productos — `/productos`
`GET /productos` · `GET /productos/{id}` · `POST` · `PUT /productos/{id}` ·
`PATCH /productos/{id}` con `{ "stock": number }` (ajuste de inventario).

### 3.7 Ventas — `/ventas`
`GET /ventas` · `GET /ventas/{id}` · `POST /ventas` ·
`PATCH /ventas/{id}` con `{ "estado": "anulada", "motivoAnulacion": string }` ·
**`GET /ventas/{id}/comprobante.pdf`** (§4).

### 3.8 Citas — `/citas`
`GET /citas` (opcional `?fecha=YYYY-MM-DD`) · `GET /citas/{id}` · `POST /citas` ·
`PATCH /citas/{id}` con `{ "estado": "pendiente"|"completada"|"cancelada" }`.

### 3.9 Estudios — `/estudios`
`GET /estudios` (opcional `?mascotaId=<uuid>`) · `GET /estudios/{id}` · `POST /estudios`.

### 3.10 Dashboard — solo `GET`
`GET /flujoPacientes` · `GET /metodosPago` · `GET /citasHoy`.

---

## 4. Generación de Documentos (PDF / Excel)

Todos protegidos por JWT + filtro de tenant. Si el recurso pertenece a otra clínica ⇒ `404`.
Responden con `Content-Disposition: attachment; filename="..."`.

| Método | Ruta | Estado | Content-Type | Contenido |
|---|---|---|---|---|
| `GET` | `/ventas/{id}/comprobante.pdf` | ✅ Implementado | `application/pdf` | Ticket: cabecera de la clínica (nombre, RUC, sede, dirección, tel), datos de venta y cliente, tabla de ítems, total, método de pago; sello **ANULADA** + motivo si aplica. |
| `GET` | `/recetas/{id}/pdf` | ✅ Implementado | `application/pdf` | Receta A4: cabecera de clínica, datos de mascota y dueño, veterinario y fecha (de la atención), tabla de `RecetaItem`, espacio de **Firma y Sello**. |
| `GET` | `/reportes/ventas.xlsx` | ✅ Implementado | `…spreadsheetml.sheet` | Query `?rango=hoy\|semana\|mes` **o** `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`. Hoja **Ventas** (fecha, cliente, ítems, total, método, vendedor, estado) + hoja **Resumen (KPIs)** (recaudación, n.º de ventas, ticket promedio y desglose por método; solo completadas). |
| `GET` | `/reportes/pacientes.xlsx` | ⏳ Planificado | `…spreadsheetml.sheet` | Mascotas con dueño (nombre, especie, raza, sexo, edad, peso, microchip, cliente); opcional `?q=`. |
| `GET` | `/reportes/catalogo.xlsx` | ⏳ Planificado | `…spreadsheetml.sheet` | Inventario (código, nombre, categoría, precio, stock, stockMin, unidad), marcando stock crítico. |

> Branding por tenant: los documentos se rotulan con los datos reales de la `Clinica` del token.
> Moneda en soles (`S/`), formato es-PE.

---

## 5. Reglas de Negocio (garantizadas por el backend)

### 5.1 Aislamiento multi-tenant
El header `X-Tenant-ID` se valida contra `veterinaria_id` del JWT (≠ ⇒ `403`). Toda lectura filtra
por `clinica_id`; toda escritura lo estampa desde el token. Acceso cruzado entre clínicas ⇒ `404`.

### 5.2 Inventario en ventas (transaccional, `@Transactional`)
**Crear (`POST /ventas`):** valida que cada `productoId` exista en el tenant; por ítem inventariado
(`stock != null`, no `'Servicio'`) descuenta `stock -= cantidad` y **rechaza con `422` si
`cantidad > stock`**; los servicios se ignoran; `estado` se fija en `'completada'`; todo en una sola
transacción (todo-o-nada). Los `VentaItem` guardan **snapshot** de `nombre`/`precio`.
**Anular (`PATCH /ventas/{id}`):** **idempotente** (si ya está `'anulada'` no re-restaura); marca
`'anulada'` + `motivoAnulacion`; restaura `stock += cantidad` por ítem inventariado; una transacción.

### 5.3 Colisión de agenda (`POST /citas`)
La franja `(clinica, fecha, hora)` está ocupada si existe una cita con `estado != 'cancelada'`.
Si ya existe ⇒ **`409`**. Las canceladas liberan la franja. `hora` debe pertenecer a
`09:00, 09:30, …, 18:00` (si no, `422`). Al crear, `estado = 'pendiente'`.

### 5.4 Atención + receta (transaccional)
Modo embebido: crea atención y receta y las enlaza 1:1 (`Atencion.recetaId ↔ Receta.atencionId`) en
una transacción. Modo `recetaId`: enlaza una receta existente del tenant. Una receta exige **≥ 1 ítem**
(si no, `422`). La atención es **inmutable** (no hay `PUT`/`DELETE`).

### 5.5 Integridad de inventario de productos
`Servicio` ⇒ `stock`/`stockMin` se fuerzan a `null`; otras categorías exigen ambos numéricos (`422`).
`PATCH /productos/{id}` de stock se rechaza (`422`) sobre un `'Servicio'`.

### 5.6 Dashboard (agregaciones por tenant)
`flujoPacientes`, `metodosPago` y `citasHoy` se calculan on-the-fly respetando el tenant (§2.11).

---

## 6. Resumen de recursos

| Entidad | Recurso | Operaciones implementadas |
|---|---|---|
| Auth | `/auth/login` | POST |
| Clinica | `/clinicas` | POST (público), GET `/{id}` |
| Usuario | `/usuarios` | POST |
| Cliente | `/clientes` | GET, GET `/{id}`, POST, PUT, DELETE |
| Mascota | `/mascotas` | GET (`?clienteId`), GET `/{id}`, POST, PUT, DELETE |
| Atencion | `/atenciones` | GET (`?mascotaId`), GET `/{id}`, POST |
| Receta | `/recetas` | GET, GET `/{id}`, POST, GET `/{id}/pdf` |
| Producto | `/productos` | GET, GET `/{id}`, POST, PUT, PATCH (stock) |
| Venta | `/ventas` | GET, GET `/{id}`, POST, PATCH (anular), GET `/{id}/comprobante.pdf` |
| Cita | `/citas` | GET (`?fecha`), GET `/{id}`, POST, PATCH (estado) |
| Estudio | `/estudios` | GET (`?mascotaId`), GET `/{id}`, POST |
| Dashboard | `/flujoPacientes`, `/metodosPago`, `/citasHoy` | GET |
| Reportes | `/reportes/ventas.xlsx` | GET ✅ · `pacientes.xlsx`, `catalogo.xlsx` ⏳ |
