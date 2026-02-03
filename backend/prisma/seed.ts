import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      fullName: 'Administrator',
      email: 'admin@sekolah.id',
      isApproved: true,
    },
  });
  console.log({ admin });

  // Create Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: { id: 'default-year' }, // Use a fixed ID/name search if possible, but schema has no unique name.
    // Since name is not unique, we check if any exists, if not create one.
    // For upsert we need a unique constraint. Since name isn't unique, we might skip upsert and just check count.
    update: {},
    create: {
      name: '2025/2026',
      isActive: true,
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-06-30'),
    },
  })
    .catch(async () => {
      // If unique constraint fails or we want to just ensure one active year
      const existing = await prisma.academicYear.findFirst({ where: { isActive: true } });
      if (!existing) {
        return prisma.academicYear.create({
          data: {
            name: '2025/2026',
            isActive: true,
            startDate: new Date('2025-07-01'),
            endDate: new Date('2026-06-30'),
          }
        });
      }
      return existing;
    });

  console.log({ academicYear });

  // Create School Settings
  // SchoolSettings id is uuid, but usually we just want one row.
  // We'll check if one exists.
  const existingSettings = await prisma.schoolSettings.findFirst();
  if (!existingSettings) {
    const settings = await prisma.schoolSettings.create({
      data: {
        name: 'SMK Muhammadiyah 1',
        address: 'Jl. Contoh No. 123',
        phone: '08123456789',
        email: 'info@smkmuh1.sch.id',
      }
    });
    console.log({ settings });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
