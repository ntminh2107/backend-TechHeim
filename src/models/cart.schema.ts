import {
  decimal,
  varchar,
  uuid,
  pgTable,
  serial,
  integer
} from 'drizzle-orm/pg-core'
import { tblUsers } from './user.schema'
import { tblProducts } from './product.schema'

export const tblCarts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userID: uuid('userID').references(() => tblUsers.id),
  status: varchar('status', { length: 255 }).default('cart')
})

export const tblCartItems = pgTable('cartItems', {
  id: serial('id').primaryKey(),
  cartID: uuid('cartID').references(() => tblCarts.id),
  productID: integer('productID').references(() => tblProducts.id),
  quantity: integer('quantity').default(1),
  price: decimal('price', { precision: 10, scale: 2 })
})
