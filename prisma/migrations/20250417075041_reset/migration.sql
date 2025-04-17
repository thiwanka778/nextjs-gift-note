/*
  Warnings:

  - You are about to drop the column `api_key` on the `credential` table. All the data in the column will be lost.
  - You are about to drop the column `extension_secret_key` on the `credential` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shop_identifier,app]` on the table `credential` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `app` to the `credential` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppName" AS ENUM ('GIFT_NOTE', 'GIFT_NOTE_EXTENSION', 'SCHEDULE_DELIVERY', 'SCHEDULE_DELIVERY_EXTENSION', 'MESSAGE_GATEWAY', 'MESSAGE_GATEWAY_EXTENSION');

-- DropIndex
DROP INDEX "credential_shop_identifier_key";

-- AlterTable
ALTER TABLE "credential" DROP COLUMN "api_key",
DROP COLUMN "extension_secret_key",
ADD COLUMN     "app" "AppName" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "credential_shop_identifier_app_key" ON "credential"("shop_identifier", "app");
