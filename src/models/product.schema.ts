import {
  varchar,
  decimal,
  boolean,
  integer,
  serial,
  pgTable,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'
import { tblUser } from './user.schema'

export const tblCategories = pgTable('categories', {
  id: serial('id').primaryKey().unique(),
  categoryName: varchar('category_name', { length: 255 }),
  totalProducts: integer('total_product').default(0)
})

export const tblBrands = pgTable('brands', {
  id: serial('id').primaryKey().unique(),
  brandName: varchar('brand_name', { length: 255 }),
  totalProducts: integer('total_product').default(0)
})
export const tblProducts = pgTable('product', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('product_name', { length: 255 }).notNull(),
  image: varchar('product_image', { length: 255 }),
  color: varchar('product_color', { length: 255 }).notNull(),
  rating: decimal('product_price', { precision: 10, scale: 2 }).default('0.00'),
  categoryID: serial('product_category')
    .references(() => tblCategories.id)
    .notNull(),
  brandID: serial('product_brand').references(() => tblBrands.id)
})

export const tblSpecification = pgTable('specifications', {
  id: serial('id').primaryKey().unique(),
  productID: uuid('product_id').references(() => tblProducts.id),
  key: varchar('specification_key', { length: 255 }),
  value: varchar('specification_value', { length: 255 })
})

export const tblCommentProduct = pgTable('comments', {
  id: serial('id').primaryKey(),
  productID: uuid('product_id').references(() => tblProducts.id),
  userID: uuid('user_id').references(() => tblUser.id),
  content: varchar('content', { length: 255 }),
  date: timestamp('date').defaultNow(),
  rating: decimal('rating', { precision: 10, scale: 2 })
})

export const tblProductPriceTag = pgTable('productPriceTags', {
  id: serial('id').primaryKey().unique(),
  productID: uuid('product_id').references(() => tblProducts.id),
  price: decimal('product_price', { precision: 10, scale: 2 }),
  discount: boolean('product_discount').default(false),
  percent: integer('product_price'),
  salePrice: decimal('product_sale_price', { precision: 10, scale: 2 })
})
