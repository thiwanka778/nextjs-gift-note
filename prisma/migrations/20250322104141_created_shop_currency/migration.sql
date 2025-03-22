-- CreateTable
CREATE TABLE "shop_currency" (
    "id" SERIAL NOT NULL,
    "shop_identifier" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_currency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shop_currency_shop_identifier_code_key" ON "shop_currency"("shop_identifier", "code");
