const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const res = await prisma.ticket.count({ where: { assigneeId: { not: null }, deletedAt: null } });
    console.log('OK:', res);
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
