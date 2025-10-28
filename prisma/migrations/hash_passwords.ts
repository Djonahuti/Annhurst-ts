import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const saltRounds = 10;

async function hashPasswords() {
  // Hash admins
  const admins = await prisma.admins.findMany();
  for (const admin of admins) {
    if (admin.password && !admin.password.startsWith('$2a$')) { // Check if not already hashed
      const hashed = await bcrypt.hash(admin.password, saltRounds);
      await prisma.admins.update({ where: { id: admin.id }, data: { password: hashed } });
    }
  }

  // Repeat for coordinators and driver
  const coordinators = await prisma.coordinators.findMany();
  for (const coord of coordinators) {
    if (coord.password && !coord.password.startsWith('$2a$')) {
      const hashed = await bcrypt.hash(coord.password, saltRounds);
      await prisma.coordinators.update({ where: { id: coord.id }, data: { password: hashed } });
    }
  }

  const drivers = await prisma.driver.findMany();
  for (const driver of drivers) {
    if (driver.password && !driver.password.startsWith('$2a$')) {
      const hashed = await bcrypt.hash(driver.password, saltRounds);
      await prisma.driver.update({ where: { id: driver.id }, data: { password: hashed } });
    }
  }

  console.log('Passwords hashed!');
}

hashPasswords().then(() => prisma.$disconnect());