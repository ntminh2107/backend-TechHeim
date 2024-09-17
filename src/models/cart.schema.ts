import {
  decimal,
  varchar,
  uuid,
  pgTable,
  serial,
  integer,
  timestamp
} from 'drizzle-orm/pg-core'
import { tblUser } from './user.schema'
import { tblProducts } from './product.schema'

export const tblCart = pgTable('cart', {
  id: uuid('id').primaryKey().defaultRandom(),
  userID: uuid('user_id').references(() => tblUser.id),
  status: varchar('status', { length: 255 }).default('cart')
})

export const tblCartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  cartID: uuid('cart_id').references(() => tblCart.id),
  productID: integer('product_id').references(() => tblProducts.id),
  quantity: integer('quantity').default(1),
  price: decimal('price', { precision: 10, scale: 2 })
})

export const tblOrder = pgTable('order', {
  id: uuid('id').primaryKey().defaultRandom(),
  userID: uuid('user_id').references(() => tblUser.id),
  addressID: integer('address_id'),
  status: varchar('status', { length: 255 }).default('pending'),
  total: decimal('total_price', { precision: 10, scale: 2 }),
  hasPaid: decimal('has_paid', { precision: 10, scale: 2 }).default('0.00'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

export const tblOrderItems = pgTable('order_item', {
  id: serial('id').primaryKey(),
  orderID: uuid('order_id').references(() => tblOrder.id),
  productID: integer('product_id')
    .references(() => tblProducts.id)
    .notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 })
})

export const tblTransaction = pgTable('transaction', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderID: uuid('order_id').references(() => tblOrder.id),
  type: varchar('type', { length: 255 }),
  deposit: decimal('deposit', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 255 }).default('created'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})
