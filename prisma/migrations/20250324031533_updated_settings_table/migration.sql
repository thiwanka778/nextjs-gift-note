-- AlterTable
ALTER TABLE "gift_note_settings" ALTER COLUMN "service_charge_for_physical_delivery" SET DEFAULT 0,
ALTER COLUMN "service_charge_for_physical_delivery" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "service_charge_for_virtual_delivery" SET DEFAULT 0,
ALTER COLUMN "service_charge_for_virtual_delivery" SET DATA TYPE DECIMAL(65,30);
