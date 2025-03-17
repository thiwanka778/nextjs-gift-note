/*
  Warnings:

  - You are about to drop the column `enable_delivery_date` on the `gift_note_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gift_note_settings" DROP COLUMN "enable_delivery_date",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'LKR';
