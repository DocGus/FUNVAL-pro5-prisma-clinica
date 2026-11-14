# Clínica Salud Integral

API REST para administrar pacientes, médicos, especialidades, citas y cuentas de acceso. La documentación funcional y el plan de implementación están en [`docs/`](./docs/).

## Requisitos locales

- Node.js `>=20.19.0`.
- pnpm `12.18.0`.
- PostgreSQL.

## Instalación y configuración

1. Instala las dependencias:

   ```sh
   pnpm install
   ```

2. Crea en PostgreSQL una base local llamada `clinica_salud_integral`.
3. Copia `.env.example` a `.env` y configura `DATABASE_URL` y `JWT_SECRET`. Usa un secreto local propio; no subas `.env` al repositorio.
4. Cuando se complete la etapa de modelado (schema, migración y configuración de Prisma), aplica la migración inicial:

   ```sh
   pnpm prisma migrate dev --name init
   ```

5. Cuando exista el seed de la etapa de modelado, carga los datos iniciales:

   ```sh
   pnpm exec tsx prisma/seed.ts
   ```

6. Cuando se implemente la herramienta de alta inicial de la etapa de autenticación, crea la cuenta inicial GERENCIA una sola vez:

   ```sh
   pnpm exec tsx prisma/create-initial-manager.ts
   ```

   El comando solicita la contraseña sin mostrarla y se detiene sin cambios si ya existe GERENCIA.

7. Inicia el servidor:

   ```sh
   pnpm dev
   ```

En el estado actual de la plantilla, el servidor ofrece `GET /health`. Las operaciones de la API, migraciones, seed y alta inicial de GERENCIA se implementarán en las etapas indicadas en [`docs/06.0_architecture.md`](./docs/06.0_architecture.md); `/api/docs` se completará entonces.

## Variables de entorno

- `DATABASE_URL`: URL de conexión obligatoria a PostgreSQL.
- `JWT_SECRET`: secreto obligatorio para firmar y verificar JWT.
- `TEST_DATABASE_URL`: conexión opcional usada únicamente por las pruebas de integración. Debe apuntar a `clinica_salud_integral_test`, separada de `DATABASE_URL`.
- `PORT`: puerto HTTP; por defecto `3000`.
- `NODE_ENV`: entorno de ejecución; por defecto `development`.

## Base de datos de pruebas

Prepara una base PostgreSQL independiente llamada `clinica_salud_integral_test` y configura `TEST_DATABASE_URL`. El soporte de pruebas verificará que esa URL sea distinta de `DATABASE_URL` y la aplicará al proceso antes de importar la aplicación. Las pruebas y sus datos usarán así la conexión de test; no uses la base de desarrollo para ejecutarlas.

Para preparar esa base desde Bash sin cambiar permanentemente la URL de desarrollo, carga `.env` y sobrescribe `DATABASE_URL` solo durante los comandos de migración y seed:

```sh
set -a
. ./.env
set +a
DATABASE_URL="$TEST_DATABASE_URL" pnpm prisma migrate deploy
DATABASE_URL="$TEST_DATABASE_URL" pnpm exec tsx prisma/seed.ts
```

Al terminar los módulos, las pruebas se ejecutarán con `pnpm test` y `pnpm test:integration`. Estos scripts y sus dependencias se agregarán en la etapa final; no forman parte de la plantilla actual.

Las dependencias base que ya contiene la plantilla son Express, Prisma 7 con adaptador PostgreSQL, Zod, dotenv y Swagger UI. Durante la etapa de autenticación se instalarán `jsonwebtoken`, `@types/jsonwebtoken` y `bcryptjs`. Durante la etapa final se instalarán `vitest`, `supertest` y `@types/supertest`.

## Git y Pull Requests

Antes de trabajar por módulos, revisa `.gitignore`, confirma que `.env` no se agregará y crea el commit inicial del proyecto. La plantilla ya ignora `.env`, `.env.*`, `node_modules/`, `dist/` y `coverage/`, y permite versionar `.env.example`.

Para cada módulo, crea una rama desde `main`, realiza commits pequeños con el prefijo acordado por el equipo, publica la rama y abre un Pull Request hacia `main`. Espera la revisión y el merge antes de iniciar la siguiente rama de trabajo.

## Prisma

El proyecto usa Prisma ORM 7.10.1 y el archivo de configuración `prisma7.config.ts`. Ejecuta los comandos de Prisma desde la raíz del proyecto.

Los modelos Prisma usan nombres singulares (`Patient`, `Doctor`, `Specialty`, `Appointment`, `User`) y se mapean con `@@map` a tablas PostgreSQL plurales (`patients`, `doctors`, `specialties`, `appointments`, `users`). Esta convención no cambia las rutas API ni el modelo de datos.
