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
  type: varchar('type', { length: 255 }),
  deposit: decimal('deposit', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 255 }).default('created'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
})
