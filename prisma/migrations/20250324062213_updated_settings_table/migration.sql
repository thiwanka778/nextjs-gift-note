-- AlterTable
ALTER TABLE "gift_note_settings" ADD COLUMN     "physical_inventory_item_id" TEXT,
ADD COLUMN     "physical_variant_id" TEXT,
ADD COLUMN     "virtual_inventory_item_id" TEXT,
ADD COLUMN     "virtual_variant_id" TEXT;
