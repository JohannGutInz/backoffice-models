import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/actions";

const DEFAULT_AGENCY_NAME = process.env.DEFAULT_AGENCY_NAME ?? "Default Agency";

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@glamourmodels.local";
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME ?? "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD ?? "Admin123!";

const COUNTRIES = [
  {
    name: "México",
    label: "MX",
    demonym: "Mexicano",
    states: [
      {
        name: "Sinaloa",
        label: "SIN",
        municipalities: [
          {
            name: "Culiacán",
            label: "CLN"
          },
          {
            name: "Mazatlán",
            label: "MZT"
          }
        ]
      },
      {
        name: "Ciudad de México",
        label: "CDMX",
        municipalities: [
          {
            name: "Álvaro Obregón",
            label: "AO"
          },
          {
            name: "Azcapotzalco",
            label: "AZC"
          }
        ]
      }
    ]
  },
  {
    name: "Colombia",
    label: "COL",
    demonym: "Colombiano",
    states: [
      {
        name: "Medellín",
        label: "MDE",
        municipalities: [
          {
            name: "Antioquia",
            label: "ANT"
          },
        ]
      },
    ]
  }
]

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedGeography() {
  return prisma.$transaction(async (tx) => {
    for (const countryData of COUNTRIES) {
      const country = await tx.country.upsert({
        where: { label: countryData.label },
        create: {
          name: countryData.name,
          label: countryData.label,
          demonym: countryData.demonym,
        },
        update: {
          name: countryData.name,
          demonym: countryData.demonym,
        },
      });

      for (const stateData of countryData.states) {
        const state = await tx.state.upsert({
          where: { label: stateData.label },
          create: {
              name: stateData.name,
              label: stateData.label,
              countryId: country.id,
          },
          update: {
            name: stateData.name,
          }
        })

        await tx.municipality.createMany({
          data: stateData.municipalities.map((municipality) => ({
            name: municipality.name,
            label: municipality.label,
            stateId: state.id,
          })),
          skipDuplicates: true,
        })
      }
    }
  });
}

const ACTIVIDADES = [
  "Demostradora",
  "Promotoria MX",
  "Promotoria COL",
  "Edecanía COL",
  "Modelo de protocolo MX",
  "G.O.",
  "G.O/Promotor Perfumería",
  "Volantero",
  "Staff eventos",
  "Supervisión",
  "Coordinación",
  "Animación por micrófono",
  "Maestro de ceremonias",
  "Conducción de eventos",
  "Modelo para fotografía",
  "Modelo para videos musicales",
  "Modelo para comerciales",
  "Pasarela",
  "Actor",
  "Actriz",
  "Extra/figurante",
  "Personal para limpieza",
  "Personal para seguridad",
];

async function seedActividades() {
  for (const name of ACTIVIDADES) {
    await prisma.category.upsert({
      where: { name } as never,
      create: { name },
      update: {},
    });
  }
}

async function main() {
  try {
    const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);

    const agencyMaybe = await prisma.agency.findFirst({ where: { name: DEFAULT_AGENCY_NAME } });
    const agency = agencyMaybe ?? await prisma.agency.create({ data: { name: DEFAULT_AGENCY_NAME } });

    await seedGeography();
    await seedActividades();

    await prisma.user.upsert({
      where: { email: DEFAULT_ADMIN_EMAIL },
      create: {
        email: DEFAULT_ADMIN_EMAIL,
        username: DEFAULT_ADMIN_USERNAME,
        hashedPassword: hashedPassword,
        role: UserRole.ADMIN,
        agencyId: agency.id,
      },
      update: {
        username: DEFAULT_ADMIN_USERNAME,
        hashedPassword: hashedPassword,
      },
    });

    console.log(`Initialized admin user: ${DEFAULT_ADMIN_EMAIL}`);
    console.log("Seeded countries, states, and municipalities in bulk");
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });