import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateActiveYears() {
  try {
    // Get all active academic years
    const activeYears = await prisma.academicYear.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
    });

    console.log(`Found ${activeYears.length} active academic years`);

    if (activeYears.length > 1) {
      // Keep the most recent one active, deactivate others
      const [keepActive, ...deactivate] = activeYears;

      console.log(`Keeping active: ${keepActive.name}`);

      for (const year of deactivate) {
        await prisma.academicYear.update({
          where: { id: year.id },
          data: { isActive: false },
        });
        console.log(`Deactivated: ${year.name}`);
      }

      console.log('✅ Fixed duplicate active years');
    } else {
      console.log('✅ No duplicates found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateActiveYears();
