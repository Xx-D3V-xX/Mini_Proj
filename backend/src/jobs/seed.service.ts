import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('User123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: { email: 'admin@local.test', password_hash: adminPassword, name: 'Admin', role: 'ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'user@local.test' },
    update: {},
    create: { email: 'user@local.test', password_hash: userPassword, name: 'Explorer', role: 'USER' },
  });
}

async function seedPois() {
  console.log('POI seeding now handled via backend/seed/data CSV + psql scripts.');
}

async function main() {
  await seedUsers();
  await seedPois();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
