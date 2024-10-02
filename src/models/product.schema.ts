import {
  varchar,
  decimal,
  integer,
  serial,
  pgTable,
  timestamp
} from 'drizzle-orm/pg-core'
import { tblUsers } from './user.schema'
import { uuid } from 'drizzle-orm/pg-core'

export const tblCategories = pgTable('categories', {
  id: serial('id').primaryKey().unique(),
  image: varchar('image', { length: 255 }),
  categoryName: varchar('name', { length: 255 })
})

export const tblBrands = pgTable('brands', {
  id: serial('id').primaryKey().unique(),
  image: varchar('image', { length: 255 }),
  brandName: varchar('name', { length: 255 })
})
export const tblProducts = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  image: varchar('image', { length: 255 }),
  color: varchar('color', { length: 255 }).notNull(),
  rating: decimal('rating', { precision: 10, scale: 2 }).default('0.00'),
  categoryID: serial('categoryID')
    .references(() => tblCategories.id)
    .notNull(),
  brandID: serial('brandID').references(() => tblBrands.id)
})

export const tblSpecifications = pgTable('specifications', {
  id: serial('id').primaryKey().unique(),
  productID: serial('productID').references(() => tblProducts.id, {
    onDelete: 'cascade'
  }),
  key: varchar('key', { length: 255 }),
  value: varchar('value', { length: 255 })
})

export const tblCommentProducts = pgTable('comments', {
  id: serial('id').primaryKey(),
  productID: serial('productID').references(() => tblProducts.id, {
    onDelete: 'cascade'
  }),
  userID: uuid('userID').references(() => tblUsers.id),
  content: varchar('content', { length: 255 }),
  date: timestamp('date').defaultNow(),
  rating: decimal('rating', { precision: 10, scale: 2 })
})

export const tblProductPriceTags = pgTable('productPriceTags', {
  id: serial('id').primaryKey().unique(),
  productID: serial('productID').references(() => tblProducts.id, {
    onDelete: 'cascade'
  }),
  price: decimal('price', { precision: 10, scale: 2 }),
  percent: integer('percent')
})
