import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearLending() {
  try {
    console.log('🗑️  Clearing all lending records...');

    const deleteResult = await prisma.lending.deleteMany({});

    console.log(`✅ Successfully deleted ${deleteResult.count} lending records`);
    console.log('✨ Lending table is now empty');
  } catch (error) {
    console.error('❌ Error clearing lending data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearLending()
  .catch((error) => {
    console.error(error);
    // @ts-ignore - Node.js process type
    process.exit(1);
  });
