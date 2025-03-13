/*
  Warnings:

  - You are about to drop the column `file_type` on the `upload` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "upload" DROP COLUMN "file_type",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mime_type" TEXT;

-- CreateTable
CREATE TABLE "shop_template" (
    "id" SERIAL NOT NULL,
    "shop_identifier" TEXT NOT NULL,
    "upload_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "shop_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shop_template_shop_identifier_upload_id_key" ON "shop_template"("shop_identifier", "upload_id");

-- AddForeignKey
ALTER TABLE "shop_template" ADD CONSTRAINT "shop_template_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
