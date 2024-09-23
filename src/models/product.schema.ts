import {
  varchar,
  decimal,
  integer,
  serial,
  pgTable,
  timestamp
} from 'drizzle-orm/pg-core'
import { tblUser } from './user.schema'
import { uuid } from 'drizzle-orm/pg-core'

export const tblCategories = pgTable('categories', {
  id: serial('id').primaryKey().unique(),
  categoryName: varchar('name', { length: 255 })
})

export const tblBrands = pgTable('brands', {
  id: serial('id').primaryKey().unique(),
  brandName: varchar('name', { length: 255 })
})
export const tblProducts = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  image: varchar('image', { length: 255 }),
  color: varchar('color', { length: 255 }).notNull(),
  rating: decimal('rating', { precision: 10, scale: 2 }).default('0.00'),
  categoryID: serial('category_id')
    .references(() => tblCategories.id)
    .notNull(),
  brandID: serial('brand_id').references(() => tblBrands.id)
})

export const tblSpecification = pgTable('specifications', {
  id: serial('id').primaryKey().unique(),
  productID: serial('product_id').references(() => tblProducts.id),
  key: varchar('key', { length: 255 }),
  value: varchar('value', { length: 255 })
})

export const tblCommentProduct = pgTable('comments', {
  id: serial('id').primaryKey(),
  productID: serial('product_id').references(() => tblProducts.id),
  userID: uuid('user_id').references(() => tblUser.id),
  content: varchar('content', { length: 255 }),
  date: timestamp('date').defaultNow(),
  rating: decimal('rating', { precision: 10, scale: 2 })
})

export const tblProductPriceTag = pgTable('productPriceTags', {
  id: serial('id').primaryKey().unique(),
  productID: serial('product_id').references(() => tblProducts.id),
  price: decimal('price', { precision: 10, scale: 2 }),
  percent: integer('percent')
})
