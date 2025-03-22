/*
  Warnings:

  - You are about to drop the column `is_default` on the `currency` table. All the data in the column will be lost.
  - You are about to drop the column `rate` on the `currency` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "currency" DROP COLUMN "is_default",
DROP COLUMN "rate";

-- AlterTable
ALTER TABLE "shop_currency" ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;
