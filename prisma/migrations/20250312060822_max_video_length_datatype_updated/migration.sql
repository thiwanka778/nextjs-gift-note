/*
  Warnings:

  - You are about to alter the column `max_video_length` on the `gift_note_settings` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "gift_note_settings" ALTER COLUMN "max_video_length" SET DEFAULT 0,
ALTER COLUMN "max_video_length" SET DATA TYPE INTEGER;
