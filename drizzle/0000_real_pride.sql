CREATE TABLE IF NOT EXISTS "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_id" varchar(255),
	"brand_name" varchar(255),
	"total_product" integer DEFAULT 0,
	CONSTRAINT "brands_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" varchar(255),
	"category_name" varchar(255),
	"total_product" integer DEFAULT 0,
	CONSTRAINT "categories_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_ID" uuid,
	"user_ID" uuid,
	"content" varchar(255),
	"date" timestamp DEFAULT now(),
	"product_price" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_image" varchar(255),
	"product_price" numeric(10, 2),
	"product_discount" boolean DEFAULT false,
	"product_percent" integer,
	"product_color" varchar(255) NOT NULL,
	"product_category" serial NOT NULL,
	"product_brand" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "specifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_ID" uuid,
	"specification_key" varchar(255),
	"specification_value" varchar(255),
	CONSTRAINT "specifications_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fullname" varchar(55) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"phoneNumber" varchar(25),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_product_ID_product_id_fk" FOREIGN KEY ("product_ID") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_user_ID_user_id_fk" FOREIGN KEY ("user_ID") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_product_category_categories_id_fk" FOREIGN KEY ("product_category") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_product_brand_brands_id_fk" FOREIGN KEY ("product_brand") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "specifications" ADD CONSTRAINT "specifications_product_ID_product_id_fk" FOREIGN KEY ("product_ID") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
