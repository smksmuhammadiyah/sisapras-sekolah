-- CreateEnum
CREATE TYPE "LendingStatus" AS ENUM ('BORROWED', 'RETURNED');

-- CreateTable
CREATE TABLE "Lending" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "borrowerName" TEXT NOT NULL,
    "borrowDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3),
    "conditionBefore" TEXT NOT NULL,
    "conditionAfter" TEXT,
    "notes" TEXT,
    "status" "LendingStatus" NOT NULL DEFAULT 'BORROWED',

    CONSTRAINT "Lending_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lending" ADD CONSTRAINT "Lending_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lending" ADD CONSTRAINT "Lending_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
