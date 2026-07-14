import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { prisma } from '../src/core/database/prisma';

async function main() {
  console.log('Cleaning up existing data...');
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1 Administrator
  await prisma.user.create({
    data: {
      email: 'admin@freshworks.com',
      passwordHash,
      name: 'System Admin',
      role: Role.ADMIN,
    }
  });

  // 3 Agents
  await prisma.user.create({
    data: { email: 'shruti@freshworks.com', passwordHash, name: 'Shruti J.', role: Role.AGENT }
  });
  await prisma.user.create({
    data: { email: 'alex@freshworks.com', passwordHash, name: 'Alex Wong', role: Role.AGENT }
  });
  await prisma.user.create({
    data: { email: 'sam@freshworks.com', passwordHash, name: 'Sam Rivera', role: Role.AGENT }
  });

  // 5 Customers
  for (let i = 1; i <= 5; i++) {
    await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        passwordHash,
        name: `Customer ${i}`,
        role: Role.CUSTOMER
      }
    });
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
