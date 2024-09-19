import { integer, serial } from 'drizzle-orm/pg-core'
import { timestamp, varchar, text, uuid, pgTable } from 'drizzle-orm/pg-core'

export const tblUser = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('fullname', { length: 55 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  password: text('password').notNull(),
  phoneNumber: varchar('phoneNumber', { length: 25 }),
  roleID: integer('role_id')
    .references(() => tblRole.id)
    .default(2),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})

export const tblRole = pgTable('role', {
  id: serial('id').primaryKey(),
  role: varchar('role', { length: 255 })
})

export const tblAddress = pgTable('address', {
  id: serial('id').primaryKey(),
  userID: varchar('user_id', { length: 255 }),
  fullname: varchar('fullname', { length: 255 }),
  address: varchar('address', { length: 255 }),
  district: varchar('district', { length: 255 }),
  city: varchar('city', { length: 255 }),
  country: varchar('country', { length: 255 })
})
