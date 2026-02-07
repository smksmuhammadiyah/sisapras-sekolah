import { PrismaClient, AssetCondition, StockTransactionType, ProcurementPriority, ProcurementStatus, LendingStatus, AuditStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing dummy data...');

  // 1. Delete Lendings pointing to dummy assets OR with dummy notes
  await prisma.lending.deleteMany({
    where: {
      OR: [
        { notes: { contains: 'dummy', mode: 'insensitive' } },
        { asset: { code: { startsWith: 'DUMMY-' } } },
        { asset: { code: { startsWith: 'SMK/' } } } // Also clean up our new convention dummy data if re-running
      ]
    }
  });

  // 2. Delete Services pointing to dummy assets OR with dummy notes
  await prisma.service.deleteMany({
    where: {
      OR: [
        { notes: { contains: 'dummy', mode: 'insensitive' } },
        { asset: { code: { startsWith: 'DUMMY-' } } },
        { asset: { code: { startsWith: 'SMK/' } } }
      ]
    }
  });

  // 3. Delete AuditItems pointing to dummy assets OR with dummy notes
  await prisma.auditItem.deleteMany({
    where: {
      OR: [
        { note: { contains: 'dummy', mode: 'insensitive' } },
        { asset: { code: { startsWith: 'DUMMY-' } } },
        { asset: { code: { startsWith: 'SMK/' } } }
      ]
    }
  });

  // 4. Delete Audits with dummy auditor
  await prisma.audit.deleteMany({ where: { auditor: { username: 'admin' } } });

  // 5. Delete ProcurementItems and Procurements
  await prisma.procurementItem.deleteMany({ where: { procurement: { description: { contains: 'dummy', mode: 'insensitive' } } } });
  await prisma.procurement.deleteMany({ where: { description: { contains: 'dummy', mode: 'insensitive' } } });

  // 6. Delete StockTransactions
  await prisma.stockTransaction.deleteMany({ where: { notes: { contains: 'dummy', mode: 'insensitive' } } });

  // 7. Finally delete dummy Assets
  await prisma.asset.deleteMany({
    where: {
      OR: [
        { code: { startsWith: 'DUMMY-' } },
        { code: { startsWith: 'SMK/' } }
      ]
    }
  });

  // 8. Delete dummy StockItems
  await prisma.stockItem.deleteMany({ where: { name: { startsWith: 'Alat Tulis Kantor' } } });

  // 9. Delete dummy Rooms
  await prisma.room.deleteMany({ where: { name: { startsWith: 'Ruangan' } } });

  console.log('Starting to seed dummy data...');

  // 1. Get or Create Admin (to use as relation)
  const hashedPassword = await bcrypt.hash('admin123', 10);
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

  // 2. Get or Create Academic Year
  let academicYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        name: '2025/2026',
        isActive: true,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2026-06-30'),
      },
    });
  }

  // 3. Create 10 Rooms
  const roomTypes = ['Kelas', 'Laboratorium', 'Kantor', 'Perpustakaan', 'Gudang'];
  const rooms: any[] = [];
  for (let i = 1; i <= 10; i++) {
    const room = await prisma.room.create({
      data: {
        name: `Ruangan ${i}`,
        type: roomTypes[i % roomTypes.length],
        location: `Lantai ${Math.ceil(i / 4)}`,
      },
    });
    rooms.push(room);
  }
  console.log(`Created ${rooms.length} rooms`);

  // 4. Create 10 Assets
  const categories = ['ELEKTRONIK', 'FURNITURE', 'ALAT PRAKTIK', 'ATK', 'OLAHRAGA'];
  const origins = ['BOS', 'Komite', 'Hibah', 'Inv. Lama'];
  const statuses = ['Baru', 'Bekas', 'Hasil Pemutihan'];
  const baseYear = 2026;
  const assets: any[] = [];

  for (let i = 1; i <= 10; i++) {
    const category = categories[i % categories.length];
    // Backend convention: SMK/{Prefix}/{Year}/{Seq}
    const catPrefix = category.substring(0, 4).toUpperCase();
    const seq = i.toString().padStart(3, '0');
    const assetCode = `SMK/${catPrefix}/${baseYear}/${seq}`;

    const asset = await prisma.asset.create({
      data: {
        code: assetCode,
        name: `${category} Item ${i}`,
        category: category,
        spec: 'Spesifikasi standar operasional',
        brand: 'Merk Terpercaya',
        origin: origins[i % origins.length],
        purchaseDate: new Date(`${baseYear}-02-07`),
        purchaseYear: baseYear,
        price: 560000 + (i * 10000),
        condition: AssetCondition.GOOD,
        assetStatus: statuses[i % statuses.length],
        roomId: rooms[i - 1].id,
        managedById: admin.id,
        notes: 'Data dummy sesuai konvensi SMK/CAT/YEAR/SEQ',
      },
    });
    assets.push(asset);
  }
  console.log(`Created ${assets.length} assets with convention codes (Year: ${baseYear})`);

  // 5. Create 10 Stock Items
  const stockItems: any[] = [];
  const units = ['Rim', 'Box', 'Pcs', 'Pack'];
  for (let i = 1; i <= 10; i++) {
    const item = await prisma.stockItem.create({
      data: {
        name: `Alat Tulis Kantor ${i}`,
        unit: units[i % units.length],
        spec: 'Standar kualitas sekolah',
        minStock: 5,
        quantity: 20,
      },
    });
    stockItems.push(item);
  }
  console.log(`Created ${stockItems.length} stock items`);

  // 6. Create 10 Stock Transactions
  for (let i = 1; i <= 10; i++) {
    await prisma.stockTransaction.create({
      data: {
        type: i % 2 === 0 ? StockTransactionType.IN : StockTransactionType.OUT,
        quantity: i + 5,
        notes: `Transaksi dummy ${i}`,
        stockItemId: stockItems[i - 1].id,
        userId: admin.id,
        academicYearId: academicYear.id,
      },
    });
  }
  console.log('Created 10 stock transactions');

  // 7. Create 10 Procurements
  for (let i = 1; i <= 10; i++) {
    const procurement = await prisma.procurement.create({
      data: {
        title: `Pengadaan Barang Tahap ${i}`,
        description: `Deskripsi rencana pengadaan barang dummy untuk kebutuhan semester ${i % 2 === 0 ? 2 : 1}`,
        priority: i % 3 === 0 ? ProcurementPriority.HIGH : ProcurementPriority.NORMAL,
        totalBudget: 5000000 + (i * 500000),
        status: ProcurementStatus.PENDING,
        requesterId: admin.id,
        academicYearId: academicYear.id,
        items: {
          create: [
            {
              name: `Sub-Item Pengadaan ${i}A`,
              quantity: 5,
              priceEst: 500000,
              totalEst: 2500000,
            },
            {
              name: `Sub-Item Pengadaan ${i}B`,
              quantity: 5,
              priceEst: 500000,
              totalEst: 2500000,
            }
          ]
        }
      },
    });
  }
  console.log('Created 10 procurements');

  // 8. Create 10 Lendings
  for (let i = 1; i <= 10; i++) {
    await prisma.lending.create({
      data: {
        assetId: assets[i - 1].id,
        borrowerId: admin.id,
        borrowerName: 'Peminjam Dummy',
        conditionBefore: 'Bagus',
        status: LendingStatus.BORROWED,
        notes: `Peminjaman dummy ke-${i}`,
      },
    });
  }
  console.log('Created 10 lendings');

  // 9. Create 10 Services
  for (let i = 1; i <= 10; i++) {
    await prisma.service.create({
      data: {
        type: 'Perawatan Rutin',
        cost: 250000,
        technician: 'Teknisi Internal',
        notes: `Servis dummy berkala ke-${i}`,
        assetId: assets[i - 1].id,
        reportedById: admin.id,
        academicYearId: academicYear.id,
      },
    });
  }
  console.log('Created 10 services');

  // 10. Create 5 Audits
  for (let i = 1; i <= 5; i++) {
    await prisma.audit.create({
      data: {
        status: AuditStatus.COMPLETED,
        auditorId: admin.id,
        academicYearId: academicYear.id,
        items: {
          create: assets.slice(0, 2).map(asset => ({
            assetId: asset.id,
            condition: AssetCondition.GOOD,
            note: 'Audit dummy rutin aman',
          }))
        }
      },
    });
  }
  console.log('Created 5 audits');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
