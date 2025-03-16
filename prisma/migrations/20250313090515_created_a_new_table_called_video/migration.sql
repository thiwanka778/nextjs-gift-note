-- CreateTable
CREATE TABLE "video" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT,
    "file_path" TEXT,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "video_pkey" PRIMARY KEY ("id")
);
