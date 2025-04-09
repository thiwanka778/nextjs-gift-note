-- CreateTable
CREATE TABLE "message_gateway" (
    "id" SERIAL NOT NULL,
    "shop_identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_gateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method" (
    "id" SERIAL NOT NULL,
    "shop_identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_verification" BOOLEAN NOT NULL DEFAULT false,
    "service_charge" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shopify_product_id" TEXT,
    "shopify_variant_id" TEXT,
    "shopify_inventory_item_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_gateway_shop_identifier_name_key" ON "message_gateway"("shop_identifier", "name");
