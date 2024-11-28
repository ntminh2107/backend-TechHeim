import {
  decimal,
  varchar,
  uuid,
  pgTable,
  serial,
  integer,
  timestamp
} from 'drizzle-orm/pg-core'
import { tblUsers } from './user.schema'
import { tblProducts } from './product.schema'

export const tblOrders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userID: uuid('userID').references(() => tblUsers.id),
  addressID: integer('addressID'),
  status: varchar('status', { length: 255 }).default('pending'),
  shipMethodID: integer('shipMethodID').references(() => tblShipMethod.id),
  total: decimal('totalPrice', { precision: 10, scale: 2 }).default('0.00'),
  hasPaid: decimal('hasPaid', { precision: 10, scale: 2 }).default('0.00'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
})

export const tblShipMethod = pgTable('shipMethods', {
  id: serial('id').primaryKey(),
  method: varchar('method', { length: 255 }),
  detail: varchar('detail', { length: 255 }),
  price: decimal('price', { precision: 10, scale: 2 })
})

export const tblOrderItems = pgTable('orderItems', {
  id: serial('id').primaryKey(),
  orderID: uuid('orderID').references(() => tblOrders.id),
  productID: integer('productID')
    .references(() => tblProducts.id)
    .notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 })
})

export const tblTransactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderID: uuid('orderID').references(() => tblOrders.id),
  userID: uuid('userID').references(() => tblUsers.id),
  stripePaymentIntentID: varchar('stripePaymentIntentID', { length: 255 }), // Stripe Payment Intent
  stripeStatus: varchar('stripeStatus', { length: 255 }).default('created'), // Stripe Status
  amount: decimal('amount', { precision: 10, scale: 2 }), // Transaction Amount
  currency: varchar('currency', { length: 3 }).default('USD'), // Currency Code
  receiptURL: varchar('receiptURL', { length: 1024 }), // Stripe Receipt URL
  createdAt: timestamp('createdAt').defaultNow()
})
