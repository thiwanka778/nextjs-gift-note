/*
  Warnings:

  - A unique constraint covering the columns `[shop_identifier]` on the table `gift_note_settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shop_identifier` to the `gift_note_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `gift_note_settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gift_note_settings" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "shop_identifier" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "gift_note_settings_shop_identifier_key" ON "gift_note_settings"("shop_identifier");
