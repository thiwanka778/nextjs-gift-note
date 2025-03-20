/*
  Warnings:

  - You are about to drop the column `delivery_charge` on the `gift_order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gift_order" DROP COLUMN "delivery_charge",
ALTER COLUMN "occasion_date" SET DATA TYPE TEXT;
