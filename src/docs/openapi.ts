
/**
 * Clínica Salud Integral
 * Especificación OpenAPI 3.0.3
 *
 * Responsabilidad:
 * Documentar el contrato HTTP de la API REST.
 *
 * IMPORTANTE:
 * Este documento describe las operaciones previstas.
 * No implementa controladores, servicios ni rutas Express.
 * Las rutas funcionales se implementarán en las etapas posteriores.
 */

export const openApiDocument = {
  // ============================================================
  // 1. INFORMACIÓN GENERAL DE LA API
  // ============================================================

  openapi: "3.0.3",

  info: {
    title: "Clínica Salud Integral API",
    description:
      "API REST para la gestión de pacientes, médicos, especialidades, citas y reportes clínicos.",
    version: "1.0.0",
  },

  // Dirección del servidor durante el desarrollo local.
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local de desarrollo",
    },
  ],

  // ============================================================
  // 2. CATEGORÍAS DE OPERACIONES
  // ============================================================

  tags: [
    { name: "Health", description: "Estado y disponibilidad de la API." },
    { name: "Autenticación", description: "Inicio de sesión y administración de cuentas." },
    { name: "Pacientes", description: "Registro y consulta de pacientes." },
    { name: "Médicos", description: "Directorio y consultas médicas." },
    { name: "Especialidades", description: "Catálogo de especialidades médicas." },
    { name: "Citas", description: "Programación y gestión de citas." },
    { name: "Reportes", description: "Consultas e informes administrativos." },
  ],

  // ============================================================
  // 3. COMPONENTES REUTILIZABLES
  // ============================================================
  //
  // Aquí se definen estructuras compartidas por diferentes
  // operaciones: autenticación, parámetros, solicitudes,
  // respuestas y modelos de datos.
  //
  // Esto evita repetir las mismas definiciones en cada endpoint.

  components: {
    // ----------------------------------------------------------
    // 3.1. Esquema de autenticación JWT
    // ----------------------------------------------------------

    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Token JWT obtenido mediante POST /api/auth/login.",
      },
    },

    // ----------------------------------------------------------
    // 3.2. Parámetros reutilizables
    // ----------------------------------------------------------

    parameters: {
      PatientId: {
        name: "id",
        in: "path",
        required: true,
        description: "Identificador UUID del paciente.",
        schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440001" },
      },

      DoctorId: {
        name: "id",
        in: "path",
        required: true,
        description: "Identificador UUID del médico.",
        schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440002" },
      },

      PatientIdForDoctor: {
        name: "patientId",
        in: "path",
        required: true,
        description: "Identificador UUID del paciente.",
        schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440001" },
      },

      AppointmentId: {
        name: "id",
        in: "path",
        required: true,
        description: "Identificador UUID de la cita.",
        schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440004" },
      },

      SpecialtyId: {
        name: "specialtyId",
        in: "query",
        required: false,
        description: "Filtra el directorio por especialidad.",
        schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440003" },
      },

      FromDateTime: {
        name: "from",
        in: "query",
        required: true,
        description: "Inicio inclusivo del intervalo. ISO 8601 con zona horaria.",
        schema: { type: "string", format: "date-time" },
      },

      ToDateTime: {
        name: "to",
        in: "query",
        required: true,
        description: "Fin exclusivo del intervalo. ISO 8601 con zona horaria.",
        schema: { type: "string", format: "date-time" },
      },

      ReportDate: {
        name: "date",
        in: "query",
        required: true,
        description: "Fecha de corte en formato YYYY-MM-DD, interpretada en UTC.",
        schema: { type: "string", format: "date" },
      },
    },

    // ----------------------------------------------------------
    // 3.3. Esquemas de datos compartidos
    // ----------------------------------------------------------

    schemas: {
      // Respuesta general de error.
      ErrorResponse: {
        type: "object",
        properties: {
          status: {
            type: "string",
            example: "error",
          },
          message: {
            type: "string",
            example: "Solicitud inválida",
          },
          path: {
            type: "string",
            description: "Ruta solicitada, cuando corresponda.",
            example: "/api/patients/abc",
          },
        },
        required: ["status", "message"],
      },

      // Roles disponibles en el sistema.
      UserRole: {
        type: "string",
        enum: ["RECEPCIONISTA", "MEDICO", "GERENCIA"],
      },

      // Estados permitidos para una cita.
      AppointmentStatus: {
        type: "string",
        enum: ["PROGRAMADA", "COMPLETADA", "CANCELADA"],
      },

      // --------------------------------------------------------
      // 3.4. Usuarios y autenticación
      // --------------------------------------------------------

      RegisterReceptionistRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "recepcion@clinica.test" },
          password: { type: "string", minLength: 8, example: "contraseña123" },
          role: { type: "string", enum: ["RECEPCIONISTA"] },
        },
        required: ["email", "password", "role"],
        additionalProperties: false,
      },

      RegisterDoctorRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "medico@clinica.test" },
          password: { type: "string", minLength: 8, example: "contraseña123" },
          role: { type: "string", enum: ["MEDICO"] },
          doctorId: {
            type: "string",
            format: "uuid",
            example: "550e8400-e29b-41d4-a716-446655440002",
            description: "Debe identificar un médico existente sin cuenta vinculada.",
          },
        },
        required: ["email", "password", "role", "doctorId"],
        additionalProperties: false,
      },

      RegisterRequest: {
        description:
          "Para RECEPCIONISTA no se requiere doctorId. Para MEDICO, doctorId es obligatorio.",
        oneOf: [
          { $ref: "#/components/schemas/RegisterReceptionistRequest" },
          { $ref: "#/components/schemas/RegisterDoctorRequest" },
        ],
      },

      RegisterResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440005" },
          email: { type: "string", format: "email", example: "recepcion@clinica.test" },
          role: { $ref: "#/components/schemas/UserRole" },
        },
        required: ["id", "email", "role"],
      },

      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "recepcion@clinica.test" },
          password: { type: "string", example: "contraseña123" },
        },
        required: ["email", "password"],
      },

      LoginResponse: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "JWT con vigencia de una hora.",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
        required: ["token"],
      },

      // --------------------------------------------------------
      // 3.5. Pacientes
      // --------------------------------------------------------

      PatientCreateRequest: {
        type: "object",
        properties: {
          firstName: { type: "string", minLength: 1, example: "Ana" },
          lastName: { type: "string", minLength: 1, example: "Pérez" },
          email: { type: "string", format: "email", example: "ana@clinica.test" },
          birthDate: {
            type: "string",
            format: "date",
            example: "1986-05-20",
          },
        },
        required: ["firstName", "lastName", "email", "birthDate"],
      },

      PatientResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440001" },
          firstName: { type: "string", example: "Ana" },
          lastName: { type: "string", example: "Pérez" },
          email: { type: "string", format: "email", example: "ana@clinica.test" },
          birthDate: { type: "string", format: "date", example: "1986-05-20" },
        },
        required: ["id", "firstName", "lastName", "email", "birthDate"],
      },

      PatientAppointment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440004" },
          scheduledAt: { type: "string", format: "date-time" },
          reason: { type: "string", nullable: true, example: "Consulta" },
          status: { $ref: "#/components/schemas/AppointmentStatus" },
          doctor: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440002" },
              firstName: { type: "string", example: "Luis" },
              lastName: { type: "string", example: "García" },
              specialty: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440003" },
                  name: { type: "string", example: "Cardiología" },
                },
                required: ["id", "name"],
              },
            },
            required: ["id", "firstName", "lastName", "specialty"],
          },
        },
        required: ["id", "scheduledAt", "reason", "status", "doctor"],
      },

      PatientDetailResponse: {
        allOf: [
          { $ref: "#/components/schemas/PatientResponse" },
          {
            type: "object",
            properties: {
              appointments: {
                type: "array",
                items: { $ref: "#/components/schemas/PatientAppointment" },
              },
            },
            required: ["appointments"],
          },
        ],
      },

      // --------------------------------------------------------
      // 3.6. Médicos y especialidades
      // --------------------------------------------------------

      DoctorResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440002" },
          firstName: { type: "string", example: "Luis" },
          lastName: { type: "string", example: "García" },
          specialtyId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440003" },
        },
        required: ["id", "firstName", "lastName", "specialtyId"],
      },

      SpecialtyResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440003" },
          name: { type: "string", example: "Cardiología" },
        },
        required: ["id", "name"],
      },

      DoctorPatientAppointment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440004" },
          scheduledAt: { type: "string", format: "date-time" },
          reason: { type: "string", nullable: true, example: "Consulta" },
          status: { $ref: "#/components/schemas/AppointmentStatus" },
        },
        required: ["id", "scheduledAt", "reason", "status"],
      },

      DoctorPatientResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440001" },
          firstName: { type: "string", example: "Ana" },
          lastName: { type: "string", example: "Pérez" },
          birthDate: { type: "string", format: "date", example: "1986-05-20" },
          appointments: {
            type: "array",
            items: { $ref: "#/components/schemas/DoctorPatientAppointment" },
          },
        },
        required: ["id", "firstName", "lastName", "birthDate", "appointments"],
      },

      // --------------------------------------------------------
      // 3.7. Citas
      // --------------------------------------------------------

      AppointmentCreateRequest: {
        type: "object",
        properties: {
          patientId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440001" },
          doctorId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440002" },
          scheduledAt: {
            type: "string",
            format: "date-time",
            example: "2026-12-01T10:00:00.000Z",
            description: "Fecha y hora ISO 8601 con Z u offset explícito.",
          },
          reason: { type: "string", example: "Consulta" },
        },
        required: ["patientId", "doctorId", "scheduledAt"],
      },

      AppointmentResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440004" },
          patientId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440001" },
          doctorId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440002" },
          scheduledAt: { type: "string", format: "date-time" },
          reason: { type: "string", nullable: true, example: "Consulta" },
          status: { $ref: "#/components/schemas/AppointmentStatus" },
        },
        required: ["id", "patientId", "doctorId", "scheduledAt", "reason", "status"],
      },

      AppointmentStatusUpdateRequest: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["COMPLETADA", "CANCELADA"],
          },
        },
        required: ["status"],
      },

      // --------------------------------------------------------
      // 3.8. Reportes
      // --------------------------------------------------------

      AppointmentsBySpecialtyResponse: {
        type: "object",
        properties: {
          specialtyId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440003" },
          name: { type: "string", example: "Cardiología" },
          totalAppointments: { type: "integer", example: 5 },
        },
        required: ["specialtyId", "name", "totalAppointments"],
      },

      DailyCutoffResponse: {
        type: "object",
        properties: {
          date: { type: "string", format: "date", example: "2026-12-01" },
          counts: {
            type: "object",
            properties: {
              COMPLETADA: { type: "integer", minimum: 0, example: 4 },
              CANCELADA: { type: "integer", minimum: 0, example: 1 },
            },
            required: ["COMPLETADA", "CANCELADA"],
          },
        },
        required: ["date", "counts"],
      },
    },
  },

  // ============================================================
  // 4. OPERACIONES HTTP
  // ============================================================
  //
  // Este bloque describe las operaciones disponibles.
  // Cada path define el método HTTP, permisos, parámetros,
  // cuerpo de solicitud y respuestas posibles.
  //
  // La documentación no crea las rutas Express.

  paths: {
    // ----------------------------------------------------------
    // 4.1. HEALTH: verificación de disponibilidad
    // ----------------------------------------------------------

    "/health": {
      get: {
        tags: ["Health"],
        summary: "Comprobar el estado de la API",
        security: [],
        responses: {
          "200": {
            description: "La API está disponible.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                  },
                  required: ["status"],
                },
              },
            },
          },
        },
      },
    },

    // ----------------------------------------------------------
    // 4.2. AUTENTICACIÓN
    // ----------------------------------------------------------

    "/api/auth/register": {
      post: {
        tags: ["Autenticación"],
        summary: "Registrar una cuenta de usuario",
        description:
          "Operación exclusiva de GERENCIA. Solo permite registrar RECEPCIONISTA o MEDICO. Para MEDICO se requiere doctorId existente y sin cuenta vinculada.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Cuenta creada correctamente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterResponse" },
              },
            },
          },
          "400": { description: "Datos de entrada inválidos." },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "Solo GERENCIA puede registrar cuentas." },
          "404": { description: "Médico no encontrado." },
          "409": { description: "Correo duplicado o médico ya vinculado." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Autenticación"],
        summary: "Iniciar sesión",
        description: "Operación pública. Devuelve un JWT con vigencia de una hora.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Autenticación correcta.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "400": { description: "Datos de entrada inválidos." },
          "401": { description: "Credenciales incorrectas." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },

    // ----------------------------------------------------------
    // 4.3. PACIENTES
    // ----------------------------------------------------------

    "/api/patients": {
      post: {
        tags: ["Pacientes"],
        summary: "Registrar un paciente",
        description: "Disponible únicamente para RECEPCIONISTA.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PatientCreateRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Paciente registrado correctamente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientResponse" },
              },
            },
          },
          "400": { description: "Datos inválidos o fecha de nacimiento futura." },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "Permisos insuficientes." },
          "500": { description: "Error interno del servidor." },
        },
      },

      get: {
        tags: ["Pacientes"],
        summary: "Consultar el listado de pacientes",
        description: "Disponible únicamente para RECEPCIONISTA. Ordenado por id ascendente.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Listado de pacientes.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PatientResponse" },
                },
              },
            },
          },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "Permisos insuficientes." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },

    "/api/patients/{id}": {
      get: {
        tags: ["Pacientes"],
        summary: "Consultar paciente e historial de citas",
        description:
          "Disponible para RECEPCIONISTA. Incluye las citas ordenadas por scheduledAt descendente, con médico y especialidad.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/PatientId" },
        ],
        responses: {
          "200": {
            description: "Datos del paciente y sus citas.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientDetailResponse" },
              },
            },
          },
          "400": { description: "Identificador inválido." },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "Permisos insuficientes." },
          "404": { description: "Paciente no encontrado." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },

    // ----------------------------------------------------------
    // 4.4. MÉDICOS Y ESPECIALIDADES
    // ----------------------------------------------------------

    "/api/doctors/me/patients/{patientId}": {
      get: {
        tags: ["Médicos"],
        summary: "Consultar un paciente compartido",
        description:
          "Disponible para MEDICO. Solo devuelve los datos básicos y las citas compartidas con el médico autenticado. No expone el correo ni las citas de otros médicos.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/PatientIdForDoctor" },
        ],
        responses: {
          "200": {
            description: "Datos básicos y citas compartidas del paciente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DoctorPatientResponse" },
              },
            },
          },
          "400": { description: "Identificador inválido." },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "Permisos insuficientes." },
          "404": { description: "Paciente o relación asistencial no encontrada." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },

    "/api/doctors": {
      get: {
        tags: ["Médicos"],
        summary: "Consultar el directorio médico",
        description:
          "Disponible únicamente para RECEPCIONISTA. Ordenado por apellido, nombre e id ascendente.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/SpecialtyId" },
        ],
        responses: {
          "200": {
            description: "Directorio médico.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/DoctorResponse" },
                },
              },
            },
          },
          "400": { description: "Filtro de especialidad inválido." },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "Permisos insuficientes." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },

    "/api/specialties": {
      get: {
        tags: ["Especialidades"],
        summary: "Consultar el catálogo de especialidades",
        description: "Disponible únicamente para RECEPCIONISTA.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Catálogo de especialidades.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SpecialtyResponse" },
                },
              },
            },
          },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "Permisos insuficientes." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },

    // ----------------------------------------------------------
    // 4.5. CITAS
    // ----------------------------------------------------------

    "/api/appointments": {
      post: {
        tags: ["Citas"],
        summary: "Programar una cita",
        description:
          "Disponible para RECEPCIONISTA. La fecha debe ser futura y utilizar ISO 8601 con zona horaria explícita. El estado inicial será PROGRAMADA. No se permiten coincidencias exactas de instante para el mismo médico o paciente, independientemente del estado de la cita existente.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AppointmentCreateRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Cita programada correctamente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AppointmentResponse" },
              },
            },
          },
          "400": { description: "Datos inválidos o fecha pasada." },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "Permisos insuficientes." },
          "404": { description: "Paciente o médico no encontrado." },
          "409": { description: "Ya existe una cita en ese instante para el médico o paciente." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },

    "/api/doctors/{id}/appointments": {
      get: {
        tags: ["Citas"],
        summary: "Consultar la agenda de un médico",
        description:
          "Disponible para MEDICO y limitada a la agenda del médico vinculado al usuario autenticado. El intervalo es [from, to): from inclusivo y to exclusivo.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/DoctorId" },
          { $ref: "#/components/parameters/FromDateTime" },
          { $ref: "#/components/parameters/ToDateTime" },
        ],
        responses: {
          "200": {
            description: "Citas del médico dentro del intervalo solicitado.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/AppointmentResponse" },
                },
              },
            },
          },
          "400": { description: "Identificador o intervalo de fechas inválido." },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "El médico intenta consultar otra agenda." },
          "404": { description: "Médico no encontrado." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },

    "/api/appointments/{id}/status": {
      patch: {
        tags: ["Citas"],
        summary: "Actualizar el estado de una cita",
        description:
          "Disponible para MEDICO y únicamente para citas de su propia agenda. Solo permite PROGRAMADA → COMPLETADA o PROGRAMADA → CANCELADA. Los estados finales no pueden modificarse.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/AppointmentId" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AppointmentStatusUpdateRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Estado de la cita actualizado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AppointmentResponse" },
              },
            },
          },
          "400": { description: "Identificador o estado inválido." },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "La cita pertenece a otro médico." },
          "404": { description: "Cita no encontrada." },
          "409": { description: "La cita ya se encuentra en un estado final." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },

    // ----------------------------------------------------------
    // 4.6. REPORTES
    // ----------------------------------------------------------

    "/api/reports/appointments-by-specialty": {
      get: {
        tags: ["Reportes"],
        summary: "Consultar citas agrupadas por especialidad",
        description:
          "Disponible únicamente para GERENCIA. Cuenta todas las citas históricas, sin importar su estado. Excluye especialidades sin citas y ordena por total descendente.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Total histórico de citas por especialidad.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/AppointmentsBySpecialtyResponse" },
                },
              },
            },
          },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "Permisos insuficientes." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },

    "/api/reports/daily-cutoff": {
      get: {
        tags: ["Reportes"],
        summary: "Consultar el corte operativo diario",
        description:
          "Disponible únicamente para GERENCIA. Agrupa por la fecha UTC de scheduledAt y muestra el estado actual de las citas. No representa los cambios de estado realizados durante ese día.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/ReportDate" },
        ],
        responses: {
          "200": {
            description: "Conteo de citas completadas y canceladas para la fecha indicada.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DailyCutoffResponse" },
              },
            },
          },
          "400": { description: "Fecha inválida o con formato incorrecto." },
          "401": { description: "Autenticación requerida o inválida." },
          "403": { description: "Permisos insuficientes." },
          "500": { description: "Error interno del servidor." },
        },
      },
    },
  },
} as const;
