ALTER TABLE "productPriceTags" ALTER COLUMN "product_price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "productPriceTags" ADD COLUMN "product_percent" integer;--> statement-breakpoint
ALTER TABLE "productPriceTags" ADD CONSTRAINT "productPriceTags_id_unique" UNIQUE("id");