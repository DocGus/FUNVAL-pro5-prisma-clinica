process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??=
  "postgresql://unit_test:unit_test@127.0.0.1:5432/clinic_unit_test?schema=public";
process.env.JWT_SECRET = "unit-test-secret-not-for-production";
