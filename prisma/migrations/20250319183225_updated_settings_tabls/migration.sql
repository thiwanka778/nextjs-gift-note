/*
  Warnings:

  - You are about to drop the column `inventory_item_id` on the `gift_note_settings` table. All the data in the column will be lost.
  - You are about to drop the column `variant_id` on the `gift_note_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gift_note_settings" DROP COLUMN "inventory_item_id",
DROP COLUMN "variant_id",
ADD COLUMN     "digital_delivery_inventory_item_id" TEXT,
ADD COLUMN     "digital_delivery_variant_id" TEXT,
ADD COLUMN     "physical_delivery_inventory_item_id" TEXT,
ADD COLUMN     "physical_delivery_variant_id" TEXT;
