import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/actions";

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

const CATEGORIES = ["Casual", "Pasarela"]

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

async function main() {
  try {
    const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);

    await seedGeography();

    await prisma.user.upsert({
      where: { email: DEFAULT_ADMIN_EMAIL },
      create: {
        email: DEFAULT_ADMIN_EMAIL,
        username: DEFAULT_ADMIN_USERNAME,
        hashedPassword: hashedPassword,
        role: UserRole.ADMIN,
      },
      update: {
        username: DEFAULT_ADMIN_USERNAME,
        hashedPassword: hashedPassword,
      },
    });

    await prisma.category.createMany({
      data: CATEGORIES.map((category) => ({
        name: category
      })),
      skipDuplicates: true,
    })

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