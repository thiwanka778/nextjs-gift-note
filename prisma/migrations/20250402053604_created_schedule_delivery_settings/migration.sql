-- CreateTable
CREATE TABLE "schedule_delivery_setting" (
    "id" SERIAL NOT NULL,
    "shop_identifier" TEXT NOT NULL,
    "enable_delivery" BOOLEAN NOT NULL DEFAULT false,
    "allow_date_pick" BOOLEAN NOT NULL DEFAULT false,
    "minimum_days" INTEGER NOT NULL DEFAULT 5,
    "apply_delivery_charge" BOOLEAN NOT NULL DEFAULT false,
    "within_colombo_delivery_charge" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "outside_colombo_delivery_charge" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "within_colombo_shopify_product_id" TEXT,
    "within_colombo_shopify_variant_id" TEXT,
    "within_colombo_shopify_inventory_item_id" TEXT,
    "outside_colombo_shopify_product_id" TEXT,
    "outside_colombo_shopify_variant_id" TEXT,
    "outside_colombo_shopify_inventory_item_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_delivery_setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_delivery_setting_shop_identifier_key" ON "schedule_delivery_setting"("shop_identifier");
