-- CreateTable
CREATE TABLE "gift_note_settings" (
    "id" SERIAL NOT NULL,
    "enable_gift_notes" BOOLEAN NOT NULL DEFAULT false,
    "enable_video_messages" BOOLEAN NOT NULL DEFAULT false,
    "apply_service_charge" BOOLEAN NOT NULL DEFAULT false,
    "enable_delivery_date" BOOLEAN NOT NULL DEFAULT false,
    "service_charge_amount" INTEGER NOT NULL DEFAULT 0,
    "max_video_length" INTEGER NOT NULL DEFAULT 0,
    "max_message_length" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gift_note_settings_pkey" PRIMARY KEY ("id")
);
