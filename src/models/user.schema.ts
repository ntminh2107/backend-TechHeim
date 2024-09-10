import { timestamp, varchar, text, uuid, pgTable } from 'drizzle-orm/pg-core'

export const tblUser = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('fullname', { length: 55 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  password: text('password').notNull(),
  phoneNumber: varchar('phoneNumber', { length: 25 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
})
