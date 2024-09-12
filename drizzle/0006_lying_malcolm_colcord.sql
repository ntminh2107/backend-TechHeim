CREATE TABLE IF NOT EXISTS "productPriceTags" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" uuid,
	"product_price" integer,
	"product_discount" boolean DEFAULT false,
	"product_sale_price" numeric(10, 2)
);
--> statement-breakpoint
ALTER TABLE "comments" RENAME COLUMN "product_ID" TO "product_id";--> statement-breakpoint
ALTER TABLE "comments" RENAME COLUMN "user_ID" TO "user_id";--> statement-breakpoint
ALTER TABLE "specifications" RENAME COLUMN "product_ID" TO "product_id";--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_product_ID_product_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_user_ID_user_id_fk";
--> statement-breakpoint
ALTER TABLE "specifications" DROP CONSTRAINT "specifications_product_ID_product_id_fk";
--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "product_price" SET DEFAULT '0.00';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "productPriceTags" ADD CONSTRAINT "productPriceTags_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "specifications" ADD CONSTRAINT "specifications_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "product_discount";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "product_percent";