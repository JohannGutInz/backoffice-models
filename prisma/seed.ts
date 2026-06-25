import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/actions";

const DEFAULT_AGENCY_NAME = process.env.DEFAULT_AGENCY_NAME ?? "Default Agency";

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@glamourmodels.local";
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME ?? "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD ?? "Admin123!";


const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);

    const agencyMaybe = await prisma.agency.findFirst({ where: { name: DEFAULT_AGENCY_NAME } });
    const agency = agencyMaybe ?? await prisma.agency.create({ data: { name: DEFAULT_AGENCY_NAME } });

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