
import { prisma } from "../src/config/prisma.js";

const specialties = [
  {
    name: "Medicina General",
    doctors: [
      {
        firstName: "Ana",
        lastName: "Torres",
        professionalLicense: "DEMO-MG-001",
        email: "ana.torres@example.test",
      },
      {
        firstName: "Carlos",
        lastName: "Mendez",
        professionalLicense: "DEMO-MG-002",
        email: "carlos.mendez@example.test",
      },
    ],
  },
  {
    name: "Cardiologia",
    doctors: [
      {
        firstName: "Laura",
        lastName: "Sanchez",
        professionalLicense: "DEMO-CAR-001",
        email: "laura.sanchez@example.test",
      },
      {
        firstName: "Miguel",
        lastName: "Herrera",
        professionalLicense: "DEMO-CAR-002",
        email: "miguel.herrera@example.test",
      },
    ],
  },
  {
    name: "Pediatria",
    doctors: [
      {
        firstName: "Sofia",
        lastName: "Ramirez",
        professionalLicense: "DEMO-PED-001",
        email: "sofia.ramirez@example.test",
      },
      {
        firstName: "Diego",
        lastName: "Castro",
        professionalLicense: "DEMO-PED-002",
        email: "diego.castro@example.test",
      },
    ],
  },
  {
    name: "Ginecologia",
    doctors: [
      {
        firstName: "Elena",
        lastName: "Morales",
        professionalLicense: "DEMO-GIN-001",
        email: "elena.morales@example.test",
      },
      {
        firstName: "Andres",
        lastName: "Vega",
        professionalLicense: "DEMO-GIN-002",
        email: "andres.vega@example.test",
      },
    ],
  },
  {
    name: "Dermatologia",
    doctors: [
      {
        firstName: "Patricia",
        lastName: "Flores",
        professionalLicense: "DEMO-DER-001",
        email: "patricia.flores@example.test",
      },
      {
        firstName: "Roberto",
        lastName: "Luna",
        professionalLicense: "DEMO-DER-002",
        email: "roberto.luna@example.test",
      },
    ],
  },
];

async function main() {
  for (const specialtyData of specialties) {
    const specialty = await prisma.specialty.upsert({
      where: {
        name: specialtyData.name,
      },
      update: {},
      create: {
        name: specialtyData.name,
      },
    });

    console.log(`Especialidad: ${specialty.name}`);

    for (const doctorData of specialtyData.doctors) {
      const doctor = await prisma.doctor.upsert({
        where: {
          professionalLicense: doctorData.professionalLicense,
        },
        update: {
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          email: doctorData.email,
          specialtyId: specialty.id,
        },
        create: {
          ...doctorData,
          specialtyId: specialty.id,
        },
      });

      console.log(`  Médico registrado: ${doctor.firstName} ${doctor.lastName}`);
    }
  }

  console.log("Seed completado correctamente.");
}

main()
  .catch((error) => {
    console.error("Error ejecutando el seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
