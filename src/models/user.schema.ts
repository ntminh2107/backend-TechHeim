import { integer, serial } from 'drizzle-orm/pg-core'
import { timestamp, varchar, text, uuid, pgTable } from 'drizzle-orm/pg-core'

export const tblUsers = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('fullname', { length: 55 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  password: text('password').notNull(),
  phoneNumber: varchar('phoneNumber', { length: 25 }),
  roleID: integer('roleID')
    .references(() => tblRoles.id)
    .default(2),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
})

export const tblRoles = pgTable('roles', {
  id: serial('id').primaryKey(),
  role: varchar('role', { length: 255 })
})

export const tblAddresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userID: varchar('userID', { length: 255 }),
  fullname: varchar('fullname', { length: 255 }),
  address: varchar('address', { length: 255 }),
  district: varchar('district', { length: 255 }),
  city: varchar('city', { length: 255 }),
  country: varchar('country', { length: 255 })
})
