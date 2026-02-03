-- CreateTable
CREATE TABLE "SchoolSettings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'SMK Negeri 1 Contoh',
    "address" TEXT NOT NULL DEFAULT 'Jl. Pendidikan No. 1',
    "phone" TEXT NOT NULL DEFAULT '(021) 1234567',
    "email" TEXT NOT NULL DEFAULT 'info@smkn1contoh.sch.id',
    "website" TEXT,
    "headmaster" TEXT NOT NULL DEFAULT 'Drs. Kepala Sekolah, M.Pd',
    "nipHeadmaster" TEXT NOT NULL DEFAULT '19800101 200001 1 001',
    "sarprasName" TEXT NOT NULL DEFAULT 'Wakasek Sarpras, S.Pd',
    "nipSarpras" TEXT NOT NULL DEFAULT '19850101 200501 1 001',

    CONSTRAINT "SchoolSettings_pkey" PRIMARY KEY ("id")
);
