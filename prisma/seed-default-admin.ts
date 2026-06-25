import "dotenv/config";
import * as bcrypt from "bcrypt";
import { prisma } from "@/db";

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@glamourmodels.local";
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME ?? "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD ?? "Admin123!";

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  try {
    const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);

    await prisma.user.upsert({
      where: { email: DEFAULT_ADMIN_EMAIL },
      create: {
        email: DEFAULT_ADMIN_EMAIL,
        username: DEFAULT_ADMIN_USERNAME,
        hashed_password: hashedPassword,
      },
      update: {
        username: DEFAULT_ADMIN_USERNAME,
        hashed_password: hashedPassword,
      },
    });

    console.log(`Initialized admin user: ${DEFAULT_ADMIN_EMAIL}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exitCode = 1;
});