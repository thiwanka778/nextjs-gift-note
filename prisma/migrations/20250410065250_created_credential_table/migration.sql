-- CreateTable
CREATE TABLE "credential" (
    "id" SERIAL NOT NULL,
    "shop_identifier" TEXT NOT NULL,
    "access_token" TEXT,
    "api_key" TEXT,
    "secret_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credential_shop_identifier_key" ON "credential"("shop_identifier");
