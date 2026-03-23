import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;`);
    console.log('Column preferences added successfully to profiles table.');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
