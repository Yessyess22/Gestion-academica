# Sistema PAI Bolivia — Resumen de Implementación y Guía de Defensa

---

## ¿QUÉ ES ESTE SISTEMA?

Es una **aplicación web fullstack** para gestionar el Programa Ampliado de Inmunización (PAI) del Ministerio de Salud de Bolivia. Permite registrar dosis de vacunas, administrar pacientes, controlar establecimientos de salud y analizar cobertura vacunal por departamento a nivel nacional.

**Tecnologías usadas:**

| Tecnología | Rol en el proyecto |
|---|---|
| Next.js 16 (App Router) | Framework React fullstack — maneja páginas, layouts y API Routes |
| Supabase | Backend como servicio: base de datos PostgreSQL + autenticación + almacenamiento |
| TypeScript | Tipado estático en todo el proyecto |
| Zod | Validación de formularios en cliente y servidor |
| React Hook Form | Manejo de formularios con validación integrada |
| shadcn/ui + Radix UI | Componentes de interfaz accesibles y reutilizables |
| Tailwind CSS | Estilos utilitarios |
| Sonner | Notificaciones toast |

---

## ARQUITECTURA GENERAL

```
Sistema PAI Bolivia
│
├── Frontend (Next.js App Router)
│   ├── app/(auth)/          → Páginas públicas: login, registro
│   ├── app/(dashboard)/     → Páginas protegidas por rol
│   │   ├── admin/           → Panel administrador nacional
│   │   ├── coordinador/     → Panel coordinador departamental
│   │   └── vacunador/       → Panel personal de salud
│   └── app/api/             → API REST interna
│       ├── auth/            → Sesión y perfil
│       ├── admin/           → Operaciones de administrador
│       ├── coordinador/     → Operaciones de coordinador
│       └── vacunador/       → Operaciones de vacunador
│
├── lib/
│   ├── supabase/client.ts   → Cliente Supabase para el navegador
│   ├── supabase/server.ts   → Cliente Supabase para el servidor
│   ├── navigation.ts        → Menú lateral por rol
│   └── validations/         → Schemas Zod (perfil, paciente, registro-vacunacion)
│
├── components/
│   ├── auth/                → Formularios de login y registro
│   ├── dashboard/           → Componentes de panel por rol
│   └── ui/                  → Componentes shadcn/ui (botones, cards, tablas...)
│
└── middleware.ts            → Guarda de rutas: redirige si no hay sesión
```

**Patrón general:** El usuario hace una petición → el middleware verifica la sesión → si es ruta protegida y no hay sesión, redirige a `/login` → si hay sesión, el layout del dashboard carga el perfil y renderiza el sidebar según el rol.

---

## BASE DE DATOS (Supabase / PostgreSQL)

### Tablas principales

**`usuarios_perfil`** — Extiende los usuarios de Supabase Auth
```
id                  UUID (FK → auth.users)
nombre_completo     TEXT
rol                 TEXT  → 'vacunador' | 'coordinador' | 'admin'
telefono            TEXT
ci                  TEXT  (Cédula de identidad)
establecimiento_id  TEXT  (A qué establecimiento pertenece el vacunador)
departamento        TEXT  (A qué departamento pertenece el coordinador)
activo              BOOLEAN
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```
> Constraint: `CHECK (rol IN ('vacunador','coordinador','admin'))`. En versiones anteriores tenía `docente`/`estudiante` del sistema académico base — se migró con una transacción DROP+UPDATE+ADD.

**`pacientes`** — Personas que reciben vacunas
```
paciente_id          TEXT  (formato PAC-<timestamp>)
ci_paciente          TEXT
nombre_paciente      TEXT
apellido_paterno     TEXT
apellido_materno     TEXT
sexo                 CHAR(1)  → 'M' | 'F'
fecha_nacimiento     DATE
municipio_residencia TEXT
comunidad_indigena   BOOLEAN
```

**`establecimientos`** — Centros de salud del SNIS
```
establecimiento_id      TEXT  (formato EST-SC-0001)
nombre_establecimiento  TEXT
tipo_establecimiento    TEXT  → Hospital 3er Nivel | Hospital 2do Nivel | Centro de Salud | Posta de Salud
nivel_atencion          INT   (1, 2 o 3)
zona                    TEXT  → Urbana | Periurbana | Rural
sedes                   TEXT  (SEDES departamental)
red_salud               TEXT
departamento            TEXT
municipio               TEXT
latitud / longitud      NUMERIC (georeferenciación)
tiene_cadena_frio       BOOLEAN
activo                  BOOLEAN
```

**`vacunas_catalogo`** — Catálogo oficial del esquema PAI boliviano
```
vacuna_id           TEXT
vacuna_nombre       TEXT
dosis_descripcion   TEXT  (ej: "1ra dosis", "Refuerzo")
via_administracion  TEXT  (intramuscular, oral, subcutánea...)
activa              BOOLEAN
```

**`lotes_vacuna`** — Lotes de vacunas disponibles por establecimiento
```
lote_id             TEXT  (formato LOT-<timestamp>)
vacuna_id           TEXT  (FK → vacunas_catalogo)
lote_codigo         TEXT  (código oficial del lote, ej: BIO-2024-001)
fecha_vencimiento   DATE
cantidad_dosis      INT
activo              BOOLEAN
created_at          TIMESTAMPTZ
```
> Esta tabla la gestiona el administrador desde `/admin/lotes`. El vacunador la consulta al seleccionar una vacuna — solo aparecen lotes activos y no vencidos de esa vacuna.

**`registros_vacunacion`** — Dosis aplicadas (tabla central del sistema)
```
registro_id              TEXT   (formato REG-<timestamp>)
paciente_id              TEXT   (FK → pacientes)
vacunador_id             UUID   (FK → auth.users)
vacuna_id                TEXT   (FK → vacunas_catalogo)
vacuna_nombre            TEXT   (desnormalizado para reportes)
numero_dosis             INT    (tomado del catálogo)
establecimiento_id       TEXT   (tomado del perfil del vacunador)
nombre_establecimiento   TEXT   (desnormalizado)
departamento             TEXT   (desnormalizado para filtros)
fecha_vacunacion         DATE
lote_vacuna              TEXT   (código del lote seleccionado)
temperatura_conservacion NUMERIC
via_administracion       TEXT
aplicacion_oportuna      BOOLEAN  (null = no determinado)
edad_dias_aplicacion     INT    (calculado automáticamente)
created_at               TIMESTAMPTZ
```

> **Por qué desnormalizar** `vacuna_nombre`, `nombre_establecimiento` y `departamento`: los reportes consultan miles de filas. Evitar JOINs en tiempo real mejora el rendimiento de las consultas de cobertura. Es una decisión de diseño consciente, no un error.

---

## FLUJO DE AUTENTICACIÓN (detallado)

```
Usuario → POST /api/auth/... (supabase.auth.signInWithPassword)
       ↓
Supabase devuelve JWT + cookie de sesión
       ↓
LoginForm lee el rol desde usuarios_perfil
       ↓
window.location.href = "/admin" | "/coordinador" | "/vacunador"
       ↓
HTTP request completo → middleware.ts ejecuta
       ↓
middleware: supabase.auth.getUser() con la cookie
       ↓
Si hay sesión → permite acceso
Si no hay sesión → redirect a /login
       ↓
DashboardLayout → segunda verificación + carga perfil para el sidebar
```

**Por qué `window.location.href` y no `router.push()`:**
Next.js App Router navega en modo SPA (Single Page Application). En SPA, el navegador no hace un HTTP request real, entonces la cookie de sesión no llega al servidor y el middleware rechaza el acceso. `window.location.href` fuerza una recarga completa donde la cookie sí viaja en los headers.

**Cierre de sesión:**
El botón de logout en el sidebar inferior llama a `supabase.auth.signOut()` y luego redirige con `window.location.href = "/login"` por el mismo motivo — forzar un HTTP request limpio sin cookie.

---

## ROLES Y PERMISOS

### Tabla de acceso por rol

| Recurso | Vacunador | Coordinador | Admin |
|---|---|---|---|
| Sus propios registros | Leer + Crear | — | Leer |
| Registros de su departamento | — | Leer | Leer |
| Todos los registros | — | — | Leer |
| Pacientes | Leer + Crear | — | Leer + Crear |
| Establecimientos | — | Ver (depto) | CRUD completo |
| Vacunas PAI | Leer | Leer | CRUD completo |
| Lotes de vacunas | Leer (al vacunar) | — | CRUD completo |
| Usuarios | — | — | CRUD completo |
| Reportes | — | Su departamento | Nacional |
| Análisis cobertura | — | Su departamento | Nacional |

---

## POLÍTICAS DE SEGURIDAD (RLS — Row Level Security)

RLS es una característica de PostgreSQL que aplica filtros de seguridad **a nivel de base de datos**, no solo en el código. Aunque alguien saltara la API, la base de datos aplica sus propias reglas.

### `usuarios_perfil`

```sql
-- Cualquier usuario autenticado puede ver perfiles
CREATE POLICY "usuarios_autenticados_ver_perfiles"
ON usuarios_perfil FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Cada usuario solo puede editar su propio perfil
CREATE POLICY "usuario_editar_propio"
ON usuarios_perfil FOR UPDATE
USING (auth.uid() = id);
```

> Se eliminó una política `coordinador_ver_perfiles` que hacía una sub-consulta a la misma tabla que estaba protegiendo — PostgreSQL entraba en recursión infinita y devolvía error 500.

### `registros_vacunacion`

```sql
-- Vacunador: solo ve sus propios registros
CREATE POLICY "vacunador_ver_propios"
ON registros_vacunacion FOR SELECT
USING (vacunador_id = auth.uid());

-- Coordinador: ve todos los registros de su departamento
CREATE POLICY "coordinador_ver_depto"
ON registros_vacunacion FOR SELECT
USING (
  departamento = (
    SELECT departamento FROM usuarios_perfil
    WHERE id = auth.uid()
  )
);

-- Admin: ve todo
CREATE POLICY "admin_ver_todo"
ON registros_vacunacion FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfil
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Solo vacunadores pueden insertar registros
CREATE POLICY "vacunador_insertar"
ON registros_vacunacion FOR INSERT
WITH CHECK (vacunador_id = auth.uid());
```

### `pacientes`

```sql
-- Cualquier autenticado puede buscar pacientes
CREATE POLICY "autenticados_ver_pacientes"
ON pacientes FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Solo vacunador y admin pueden registrar pacientes nuevos
-- (se verifica rol en la API antes de llegar a la BD)
```

### `establecimientos` y `vacunas_catalogo`

```sql
-- Lectura pública para autenticados
CREATE POLICY "autenticados_ver_establecimientos"
ON establecimientos FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Solo admin puede modificar (verificado en API con doble check de rol)
```

---

## SEGURIDAD EN API ROUTES

Cada endpoint aplica **dos capas de verificación** independientes:

```typescript
// Capa 1: ¿Hay sesión activa?
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

// Capa 2: ¿Tiene el rol correcto?
const { data: perfil } = await supabase
  .from("usuarios_perfil").select("rol").eq("id", user.id).single()
if (perfil?.rol !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 })
```

El admin usa adicionalmente `SUPABASE_SERVICE_ROLE_KEY` (clave de servicio secreta, solo en servidor) para operaciones privilegiadas como crear o eliminar usuarios de Supabase Auth — esta clave nunca se expone al cliente.

**Diferencia entre 401 y 403:**
- `401 Unauthorized` → No hay sesión (no sabemos quién eres)
- `403 Forbidden` → Hay sesión pero no tienes permiso (sabemos quién eres, pero no puedes)

**Manejo de errores en todos los fetches:**
Todos los componentes del cliente usan `try/catch` con `finally { setLoading(false) }` en sus llamadas fetch. Esto garantiza que un error de red o de API nunca deja la UI en estado de carga infinita y siempre muestra un toast descriptivo al usuario.

---

## VALIDACIONES (Zod v4)

Las validaciones se definen una sola vez y se usan tanto en el formulario del cliente como en la API del servidor.

### Schema de Paciente (`lib/validations/paciente.ts`)
```typescript
export const pacienteSchema = z.object({
  ci_paciente:          z.string().min(4).max(20).optional().or(z.literal("")),
  nombre_paciente:      z.string().min(2, "El nombre es obligatorio").max(100),
  apellido_paterno:     z.string().min(2, "El apellido paterno es obligatorio").max(100),
  apellido_materno:     z.string().max(100).optional().or(z.literal("")),
  sexo:                 z.enum(["M", "F"], { message: "Selecciona el sexo" }),
  fecha_nacimiento:     z.string().min(1, "La fecha de nacimiento es obligatoria"),
  municipio_residencia: z.string().min(2).max(100).optional().or(z.literal("")),
  comunidad_indigena:   z.boolean(),
})
```

### Schema de Registro de Vacunación (`lib/validations/registro-vacunacion.ts`)
```typescript
export const registroVacunacionSchema = z.object({
  paciente_id:              z.string().min(1, "Selecciona un paciente"),
  vacuna_id:                z.string().min(1, "Selecciona una vacuna"),
  fecha_vacunacion:         z.string().min(1, "La fecha es obligatoria"),
  lote_vacuna:              z.string().min(2, "El lote es obligatorio").max(50),
  temperatura_conservacion: z.number().min(-10).max(30).optional().nullable(),
  via_administracion:       z.string().min(2).max(50),
  aplicacion_oportuna:      z.boolean().optional().nullable(),
})
```

> **Nota Zod v4:** No usar `.default()` en schemas que se usan con `react-hook-form`. `.default("")` hace que el input sea `string | undefined` pero el output sea `string`, creando una incompatibilidad de tipos en el resolver. En su lugar, proveer los valores en `defaultValues` del formulario.

---

## MÓDULOS POR ROL

### VACUNADOR (`/vacunador`)

**Dashboard** — Muestra estadísticas del vacunador actual:
- Dosis aplicadas hoy
- Dosis aplicadas en el mes
- Pacientes únicos atendidos
- Accesos rápidos: Registrar Vacuna, Nuevo Paciente, Mis Registros

**Registrar Vacuna** (`/vacunador/vacunar`) — Formulario en 2 pasos:

*Paso 1 — Buscar paciente:*
- Input de CI con búsqueda por Enter o botón lupa
- Lista desplegable de resultados con nombre, edad y sexo
- Al seleccionar, muestra tarjeta de confirmación del paciente

*Paso 2 — Datos de la vacunación:*
- **Establecimiento y departamento** → mostrados como info de solo lectura (tomados automáticamente del perfil del vacunador, no se ingresan manualmente)
- **Vacuna** → Select con catálogo PAI completo (nombre + descripción de dosis)
- **Fecha de aplicación** → input date, por defecto hoy
- **Lote de vacuna** → Select que se habilita solo después de elegir la vacuna; carga los lotes activos de esa vacuna desde `lotes_vacuna`; muestra código, fecha de vencimiento y cantidad disponible; si no hay lotes muestra aviso para que el admin los cargue
- **Temperatura de conservación** → numérico en °C (rango -10 a 30)
- **Vía de administración** → pre-llenado automáticamente con el valor del catálogo al elegir la vacuna
- **Aplicación oportuna** → Select con tres opciones: "No determinado" / "Sí — dentro del calendario" / "No — fuera de fecha"

Al enviar, el sistema calcula automáticamente `edad_dias_aplicacion` (diferencia en días entre fecha de nacimiento del paciente y fecha de vacunación) y graba todos los campos desnormalizados en `registros_vacunacion`.

**Mis Pacientes** (`/vacunador/pacientes`) — Búsqueda y registro:
- Tabla filtrable por nombre o CI
- Dialog con formulario completo para registrar nuevo paciente (validado con Zod)
- Campos: nombre, apellido paterno/materno, CI, sexo, fecha de nacimiento, municipio, comunidad indígena

**Mis Registros** (`/vacunador/registros`) — Historial personal:
- Solo registros donde el vacunador es el autor (`vacunador_id = user.id` via RLS)
- Filtros por texto libre y período (hoy / últimos 7 días / este mes / todos)
- Muestra: fecha, paciente, vacuna, dosis número, lote, indicador de oportuna (verde/rojo)

**Mi Perfil** — Edita nombre completo y teléfono

---

### COORDINADOR (`/coordinador`)

**Dashboard** — Estadísticas de su departamento:
- Dosis aplicadas en el mes
- Dosis acumuladas históricas
- Establecimientos activos en su depto
- Vacunas únicas aplicadas
- Accesos rápidos: Ver Registros, Análisis de Cobertura

**Registros** (`/coordinador/registros`) — Vista completa departamental:
- Todos los registros de su departamento (RLS filtra por `departamento`)
- Filtros por texto libre y período (este mes / últimos 90 días / este año / todos)
- Columnas: fecha, paciente, vacuna, establecimiento, sexo del paciente, oportuna
- Solo lectura — no puede modificar ni eliminar

**Cobertura** (`/coordinador/cobertura`) — Análisis por vacuna:
- Para cada vacuna: total aplicado, oportunas, % oportuno
- Badge de color: verde ≥90%, amarillo ≥70%, rojo <70%
- Herramienta clave para reportar al Ministerio de Salud

**Mi Perfil** — Edita nombre y teléfono

---

### ADMINISTRADOR (`/admin`)

**Dashboard** — Vista nacional:
- Total dosis históricas en el país
- Dosis del mes actual
- Total pacientes registrados
- Establecimientos activos
- Establecimientos sin cadena de frío (alerta crítica)
- Accesos rápidos: Gestionar Usuarios, Establecimientos, Ver Registros, Reportes

**Usuarios** (`/admin/usuarios`) — CRUD completo:
- Lista todos los usuarios con email (consulta Supabase Auth Admin API)
- Crear usuario: email, contraseña, nombre, rol, establecimiento_id (si vacunador) o departamento (si coordinador)
- Activar/desactivar usuarios
- Usa `SUPABASE_SERVICE_ROLE_KEY` para operaciones de Auth en servidor
- Rollback: si falla el insert en `usuarios_perfil`, elimina el usuario de Auth para mantener consistencia

**Establecimientos** (`/admin/establecimientos`):
- Lista de todos los centros de salud del SNIS con filtro
- Columnas: nombre, tipo, nivel de atención, departamento, red de salud, cadena de frío, estado
- El indicador de cadena de frío aparece en rojo cuando el establecimiento no la tiene

**Vacunas PAI** (`/admin/vacunas`):
- Catálogo de vacunas del esquema boliviano
- Dialog para agregar nueva vacuna: nombre, descripción de dosis, vía de administración

**Lotes** (`/admin/lotes`):
- Gestión de los lotes de vacunas físicas disponibles
- Dialog para registrar nuevo lote: selección de vacuna (Select), código de lote (auto-mayúsculas), fecha de vencimiento, cantidad de dosis
- Botón de baja (papelera) para desactivar un lote (`activo = false`, soft delete)
- Badge de estado: Activo / Vencido (calculado en tiempo real comparando con la fecha actual)
- Los lotes registrados aquí son los que aparecen en el Select del formulario del vacunador

**Pacientes** (`/admin/pacientes`) — Vista global:
- Todos los pacientes registrados en el sistema con filtro por nombre o CI
- Dialog para registrar nuevo paciente (mismo formulario que el vacunador)

**Registros** (`/admin/registros`) — Vista global:
- Todas las dosis aplicadas en el país
- Columnas: fecha, paciente, vacuna, departamento, establecimiento, lote, oportuna

**Reportes** (`/admin/reportes`):
- Cobertura por departamento: total dosis, % oportuna con color
- Dosis por vacuna a nivel nacional: ranking de vacunas más aplicadas

---

## PROBLEMAS RESUELTOS (útil para defender el proceso)

### 1. Login que rebotaba a `/login` después de autenticarse correctamente

**Síntoma:** El servidor devolvía 200 OK pero el usuario volvía a la pantalla de login.

**Causa:** Se usaba `router.push("/admin")` de Next.js. Este método hace navegación SPA (el navegador no hace un HTTP request real). El middleware de Next.js necesita leer la cookie de sesión en el servidor, pero en navegación SPA esa cookie no viaja en los headers.

**Solución:** Cambiar a `window.location.href = "/admin"`. Esto fuerza una recarga HTTP completa donde la cookie sí se envía al servidor y el middleware puede verificar la sesión.

---

### 2. Error 500 al consultar `usuarios_perfil` (RLS recursivo)

**Síntoma:** Cualquier consulta a la tabla devolvía error interno del servidor.

**Causa:** Existía una política RLS que para verificar si el usuario era coordinador, hacía una sub-consulta a `usuarios_perfil` — la misma tabla que estaba protegiendo. PostgreSQL detecta esto como recursión infinita y aborta con error 500.

**Solución:** Eliminar esa política. La política `usuarios_autenticados_ver_perfiles` (cualquier usuario autenticado) ya cubría el caso sin recursión.

---

### 3. Error de TypeScript con `.default()` en Zod + React Hook Form

**Síntoma:** El build fallaba con error de tipos en el resolver de Zod en los formularios de perfil y paciente.

**Causa:** `.default("")` en Zod hace que el input sea `string | undefined` pero el output sea `string`. `react-hook-form` espera el mismo tipo para input y output, generando incompatibilidad.

**Solución:** Eliminar `.default()` del schema y proveer los valores en `defaultValues` del formulario. El tipo queda `string` consistente en ambas direcciones.

---

### 4. Roles académicos (`docente`/`estudiante`) en una tabla que debería tener roles PAI

**Síntoma:** Al intentar actualizar usuarios a rol `vacunador` o `coordinador`, PostgreSQL devolvía error de violación de constraint.

**Causa:** La tabla `usuarios_perfil` tenía un `CHECK` constraint de la versión académica anterior: `CHECK (rol IN ('estudiante','docente','admin'))`.

**Solución:** Transacción SQL en tres pasos:
```sql
BEGIN;
ALTER TABLE usuarios_perfil DROP CONSTRAINT usuarios_perfil_rol_check;
UPDATE usuarios_perfil SET rol = 'admin' WHERE rol IN ('admin', 'docente', 'estudiante');
ALTER TABLE usuarios_perfil ADD CONSTRAINT usuarios_perfil_rol_check
  CHECK (rol IN ('vacunador','coordinador','admin'));
COMMIT;
```

---

### 5. `SelectTrigger must be used within Select` (error en tiempo de ejecución)

**Síntoma:** Al entrar a la pantalla de vacunación, la aplicación crasheaba con un error de React en consola.

**Causa:** En el campo de "Lote de vacuna", cuando no había vacuna seleccionada todavía, se renderizaba un `<SelectTrigger disabled>` como componente suelto, fuera de cualquier `<Select>`. Radix UI (la librería base de shadcn) requiere estrictamente que `SelectTrigger` esté dentro de un `Select` padre — si no, lanza un error que tumba el componente.

**Solución:** Reemplazar el `<SelectTrigger disabled>` huérfano con un `<Input disabled>` simple que muestra el placeholder "Primero selecciona la vacuna". El Select real solo se monta cuando hay una vacuna seleccionada.

---

### 6. Lote de vacuna era un campo de texto libre (error humano garantizado)

**Síntoma/Requerimiento:** El vacunador tenía que escribir manualmente el código del lote. Con códigos como `BIO-2024-001-SC`, cualquier typo generaba un dato incorrecto en la BD.

**Solución:** Se creó la tabla `lotes_vacuna` gestionada por el administrador. El formulario del vacunador ahora tiene un `Select` que carga los lotes activos filtrados por la vacuna elegida, mostrando código + fecha de vencimiento + cantidad disponible. El vacunador nunca escribe el código — lo selecciona de una lista validada.

---

### 7. Campos de establecimiento, departamento y aplicación oportuna faltaban en el formulario

**Síntoma:** El registro se guardaba sin `aplicacion_oportuna` (quedaba `null` siempre). El vacunador tampoco podía ver en qué establecimiento y departamento estaba registrando.

**Causa:** El campo `aplicacion_oportuna` no estaba en el schema Zod ni en el formulario. Los campos de establecimiento se calculaban en el servidor pero nunca se mostraban al usuario para confirmación.

**Solución:**
- Se agregó `aplicacion_oportuna: z.boolean().optional().nullable()` al schema
- Se añadió un Select en el formulario con tres opciones: "No determinado" / "Sí — dentro del calendario" / "No — fuera de fecha"
- El endpoint `/api/vacunador/vacunas` ahora también devuelve los datos del establecimiento del vacunador (nombre y departamento) consultando la tabla `establecimientos` en la misma petición
- El formulario muestra una barra de solo lectura con Establecimiento y Departamento para que el vacunador confirme visualmente dónde está registrando la dosis

---

## GUÍA DE DEFENSA EN CLASE

### Preguntas frecuentes y cómo responderlas

---

**¿Por qué eligieron Next.js y no otro framework?**

Next.js 16 con App Router nos da renderizado en servidor (SSR) de forma nativa, lo que significa que la verificación de sesión y los permisos se evalúan en el servidor antes de enviar cualquier HTML al cliente. Esto es más seguro que una SPA pura donde la lógica de acceso vive en el cliente y puede ser evadida. Además, las API Routes permiten construir el backend en el mismo proyecto sin necesitar un servidor separado.

---

**¿Por qué Supabase y no una base de datos propia?**

Supabase nos provee autenticación robusta (JWT, manejo de sesiones, cookies HTTPOnly), Row Level Security integrada en PostgreSQL, y la Supabase Auth Admin API para gestión de usuarios desde el servidor. Construir todo eso desde cero requeriría semanas adicionales. Para un sistema de salud real, la gestión de sesiones debe ser segura — Supabase cumple con esos estándares.

---

**¿Qué es Row Level Security y por qué es importante?**

RLS es una característica de PostgreSQL que permite definir políticas de acceso a nivel de fila directamente en la base de datos. Aunque alguien comprometa la API o el servidor, la base de datos aplica sus propias reglas y nunca devuelve datos que el usuario no debería ver. En nuestro sistema, un vacunador que intentara consultar directamente la BD solo vería sus propios registros — la política `vacunador_ver_propios` lo garantiza sin importar cómo llegó la consulta.

---

**¿Cómo garantizan que un vacunador no vea datos de otro departamento?**

En dos niveles:
1. **API Route:** Cada endpoint verifica `perfil.rol` y filtra por `vacunador_id = user.id` para vacunadores.
2. **RLS:** La política `vacunador_ver_propios` en PostgreSQL filtra a nivel de base de datos por `vacunador_id = auth.uid()`. Son dos barreras independientes.

---

**¿Cómo funciona el control de lotes de vacunas?**

Existe una tabla `lotes_vacuna` que el administrador gestiona desde `/admin/lotes`. Cada lote tiene un código oficial, está asociado a una vacuna específica del catálogo PAI, tiene fecha de vencimiento y cantidad de dosis disponibles. Cuando el vacunador va a registrar una dosis, primero elige la vacuna y el sistema carga automáticamente los lotes activos (no vencidos) de esa vacuna. El vacunador selecciona de una lista — nunca escribe el código a mano, eliminando errores de tipeo en datos críticos de trazabilidad.

---

**¿Cómo maneja el sistema la cadena de frío?**

Cada establecimiento tiene un campo `tiene_cadena_frio: boolean`. El vacunador registra la `temperatura_conservacion` de la vacuna al momento de aplicarla (rango válido: -10°C a 30°C, validado por Zod). El dashboard del administrador muestra un indicador de alerta con cuántos establecimientos activos no tienen cadena de frío — dato crítico porque las vacunas pierden efectividad fuera de la cadena de frío.

---

**¿Qué significa "aplicación oportuna" y cómo se registra?**

Una vacuna es "oportuna" cuando se aplica dentro del rango de edad correcto según el esquema PAI boliviano (ej: la BCG debe darse al nacer, no a los 6 meses). En el formulario, el vacunador selecciona una de tres opciones: "Sí — dentro del calendario", "No — fuera de fecha", o "No determinado". Adicionalmente, el sistema calcula automáticamente `edad_dias_aplicacion` (días entre nacimiento y vacunación) para que el coordinador pueda hacer análisis estadístico. El indicador de cobertura oportuna en el panel del coordinador usa ese campo para evaluar si el departamento cumple las metas del Ministerio.

---

**¿Qué es el análisis de cobertura del coordinador?**

La cobertura vacunal mide qué porcentaje de dosis fueron aplicadas dentro del rango de edad correcto según el esquema PAI (aplicación oportuna). El sistema calcula para cada vacuna: total aplicado, cuántas fueron oportunas, y el porcentaje. Esto permite al coordinador departamental identificar vacunas con baja cobertura oportuna y tomar acciones antes de reportar al Ministerio. Los badges cambian de color: verde (≥90%), amarillo (≥70%), rojo (<70%).

---

**¿Cómo se crea un nuevo usuario en el sistema?**

Solo el administrador puede crear usuarios desde `/admin/usuarios`. El proceso:
1. El admin llena el formulario con email, contraseña, nombre, rol y (si es vacunador) el establecimiento, o (si es coordinador) el departamento
2. La API llama a `supabaseAdmin.auth.admin.createUser()` con la `SERVICE_ROLE_KEY` — crea el usuario en Supabase Auth con email confirmado
3. Luego inserta el perfil en `usuarios_perfil` con el rol y datos adicionales
4. Si el insert del perfil falla, se elimina el usuario de Auth para mantener consistencia (rollback manual)

---

**¿Por qué no tienen registro público (sin admin)?**

En un sistema de salud, los usuarios no se registran solos — son personal autorizado del Ministerio. El control total de altas de usuarios por el administrador garantiza que solo personal verificado tenga acceso al sistema y los datos de pacientes.

---

**¿Cómo protegen los datos de los pacientes?**

- Los datos de pacientes viven en Supabase con RLS activado
- Solo usuarios autenticados pueden leer pacientes
- Solo vacunadores y admin pueden crear pacientes
- Las cookies de sesión son HTTPOnly (el JavaScript del cliente no puede leerlas, protege contra XSS)
- Las claves secretas (`SERVICE_ROLE_KEY`) solo existen en variables de entorno del servidor, nunca en el cliente
- Toda comunicación va por HTTPS

---

**¿Cómo escalaría este sistema a nivel nacional?**

La arquitectura ya está preparada:
- **Filtro por departamento:** El coordinador solo carga datos de su departamento — no consulta toda la tabla
- **Datos desnormalizados en registros_vacunacion:** `departamento` y `nombre_establecimiento` están en la tabla de registros para evitar JOINs en consultas masivas
- **Supabase:** Escala horizontalmente, tiene pool de conexiones y edge functions para regiones distribuidas
- **Next.js:** Puede desplegarse en Vercel con CDN global o en un servidor propio

---

**¿Qué mejorarían con más tiempo?**

1. **Esquema de vacunación por paciente:** Ver qué vacunas le faltan a un paciente según su edad — carnet de vacunación digital
2. **Notificaciones:** Alertas al coordinador cuando un establecimiento supera X días sin registrar dosis
3. **Exportación PDF/Excel** de reportes directamente desde el dashboard
4. **Alertas de vencimiento de lotes:** El admin ve en el dashboard qué lotes vencen en los próximos 30 días
5. **App móvil offline** para vacunadores en zonas rurales sin internet (sync cuando hay conexión)
6. **FHIR** (estándar internacional de interoperabilidad en salud) para integración con otros sistemas del Ministerio

---

### Diagrama de flujo para explicar en clase

```
USUARIO → /login
    │
    ▼
LoginForm
    │ supabase.auth.signInWithPassword()
    ▼
Supabase Auth → JWT + Cookie de sesión
    │
    │ Consulta usuarios_perfil → obtiene rol
    ▼
window.location.href según rol:
  vacunador   → /vacunador
  coordinador → /coordinador
  admin       → /admin
    │
    ▼
middleware.ts intercepta la petición
    │ supabase.auth.getUser() con la cookie
    ▼
  ¿Hay sesión?
  NO → redirect /login
  SÍ → permite continuar
    │
    ▼
DashboardLayout
    │ Segunda verificación + carga perfil
    ▼
AppSidebar → menú según rol + botón logout
    │
    ▼
Página del rol con datos filtrados por RLS
```

### Flujo de registro de una dosis

```
Vacunador → /vacunador/vacunar
    │
    ▼
[Paso 1] Buscar paciente por CI
    │ GET /api/vacunador/pacientes?ci=...
    ▼
Selecciona paciente de la lista
    │ GET /api/vacunador/vacunas → también devuelve info del establecimiento
    ▼
[Paso 2] Ver establecimiento y departamento (solo lectura)
    │
    ▼
Selecciona vacuna del catálogo PAI
    │ GET /api/vacunador/lotes?vacuna_id=...
    ▼
Selecciona lote activo de la lista desplegable
    │
    ▼
Completa: fecha, temperatura, vía de administración, aplicación oportuna
    │
    ▼
POST /api/vacunador/registros
    │ Verifica sesión + rol vacunador
    │ Valida con Zod
    │ Calcula edad_dias_aplicacion
    │ Obtiene nombre_establecimiento y departamento del perfil
    ▼
INSERT en registros_vacunacion (con todos los campos desnormalizados)
    │
    ▼
Toast de éxito → formulario se resetea
```

---

### Puntos clave para mencionar siempre

1. **Seguridad en capas:** middleware + API + RLS — tres barreras independientes
2. **Separación de responsabilidades:** cada rol ve exactamente lo que necesita, ni más ni menos
3. **Validación en cliente Y servidor:** Zod valida en el formulario (UX inmediata) Y en la API (seguridad)
4. **El problema de la cookie:** solución no obvia que requiere entender cómo funciona SSR con Supabase
5. **RLS recursivo:** error real encontrado y resuelto — demuestra comprensión profunda de PostgreSQL
6. **Desnormalización consciente:** decisión de diseño justificada por rendimiento en reportes
7. **Lotes como catálogo controlado:** elimina errores humanos en datos críticos de trazabilidad
8. **Rollback manual en creación de usuarios:** garantiza consistencia entre Supabase Auth y `usuarios_perfil`
