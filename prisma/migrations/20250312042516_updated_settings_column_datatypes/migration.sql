/*
  Warnings:

  - You are about to drop the column `service_charge_amount` on the `gift_note_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gift_note_settings" DROP COLUMN "service_charge_amount",
ADD COLUMN     "service_charge_for_physical_delivery" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "service_charge_for_virtual_delivery" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "max_video_length" SET DEFAULT 0,
ALTER COLUMN "max_video_length" SET DATA TYPE DECIMAL(65,30);
