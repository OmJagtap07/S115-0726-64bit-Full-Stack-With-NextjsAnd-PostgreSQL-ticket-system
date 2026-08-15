import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function test() {
  const url = process.env.DATABASE_URL!.replace('-pooler', '');
  console.log('Testing with URL:', url);
  
  const pool = new Pool({ 
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@freshworks.com' } });
    console.log('User found:', user?.email);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
test();
