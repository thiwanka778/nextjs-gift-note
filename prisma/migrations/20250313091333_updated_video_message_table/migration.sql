-- CreateTable
CREATE TABLE "video_message" (
    "id" SERIAL NOT NULL,
    "order_id" TEXT NOT NULL,
    "video_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_message_order_id_video_id_key" ON "video_message"("order_id", "video_id");

-- AddForeignKey
ALTER TABLE "video_message" ADD CONSTRAINT "video_message_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
