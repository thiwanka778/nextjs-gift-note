/*
  Warnings:

  - You are about to drop the column `digital_delivery_inventory_item_id` on the `gift_note_settings` table. All the data in the column will be lost.
  - You are about to drop the column `digital_delivery_variant_id` on the `gift_note_settings` table. All the data in the column will be lost.
  - You are about to drop the column `physical_delivery_inventory_item_id` on the `gift_note_settings` table. All the data in the column will be lost.
  - You are about to drop the column `physical_delivery_variant_id` on the `gift_note_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gift_note_settings" DROP COLUMN "digital_delivery_inventory_item_id",
DROP COLUMN "digital_delivery_variant_id",
DROP COLUMN "physical_delivery_inventory_item_id",
DROP COLUMN "physical_delivery_variant_id";
