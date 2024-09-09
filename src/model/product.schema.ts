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
  categoryID: varchar('category_id', { length: 255 }),
  categoryName: varchar('category_name', { length: 255 }),
  totalProducts: integer('total_product').default(0)
})

export const tblBrands = pgTable('brands', {
  id: serial('id').primaryKey().unique(),
  brandID: varchar('brand_id', { length: 255 }),
  brandName: varchar('brand_name', { length: 255 }),
  totalProducts: integer('total_product').default(0)
})
export const tblProducts = pgTable('product', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('product_name', { length: 255 }).notNull(),
  image: varchar('product_image', { length: 255 }),
  price: decimal('product_price', { precision: 10, scale: 2 }).notNull(),
  discount: boolean('product_discount').default(false),
  percent: integer('product_percent'),
  salePrice: decimal('product_price', { precision: 10, scale: 2 }),
  color: varchar('product_color', { length: 255 }).notNull(),
  rating: decimal('product_price', { precision: 10, scale: 2 }),
  categoryID: serial('product_category')
    .references(() => tblCategories.id)
    .notNull(),
  brandID: serial('product_brand').references(() => tblBrands.id)
})

export const tblSpecification = pgTable('specifications', {
  id: serial('id').primaryKey().unique(),
  productID: uuid('product_ID').references(() => tblProducts.id),
  key: varchar('specification_key', { length: 255 }),
  value: varchar('specification_value', { length: 255 })
})

export const tblCommentProduct = pgTable('comments', {
  id: serial('id').primaryKey(),
  productID: uuid('product_ID').references(() => tblProducts.id),
  userID: uuid('user_ID').references(() => tblUser.id),
  content: varchar('content', { length: 255 }),
  date: timestamp('date').defaultNow(),
  rating: decimal('rating', { precision: 10, scale: 2 })
})
