-- CreateEnum
CREATE TYPE "gift_order_status" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "gift_order" (
    "id" SERIAL NOT NULL,
    "shop_identifier" TEXT NOT NULL,
    "order_id" TEXT,
    "note" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_email" TEXT,
    "sender_phone" TEXT,
    "recipient_name" TEXT NOT NULL,
    "recipient_email" TEXT,
    "recipient_phone" TEXT,
    "occasion" TEXT,
    "occasion_date" TIMESTAMP(3),
    "relationship" TEXT,
    "message" TEXT NOT NULL,
    "delivery_method" TEXT,
    "allow_record_video" BOOLEAN,
    "shop_template_id" INTEGER NOT NULL,
    "delivery_charge" INTEGER,
    "status" "gift_order_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gift_order_note_key" ON "gift_order"("note");

-- CreateIndex
CREATE INDEX "gift_order_shop_identifier_order_id_status_note_idx" ON "gift_order"("shop_identifier", "order_id", "status", "note");
