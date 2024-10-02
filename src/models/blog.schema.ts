import {
  timestamp,
  pgTable,
  serial,
  varchar,
  text,
  integer
} from 'drizzle-orm/pg-core'

export const tblBlogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  releaseDate: timestamp('releaseDate').defaultNow(),
  readTime: varchar('readTime', { length: 50 }).notNull(),
  image: varchar('image', { length: 500 }).notNull(),
  content: text('content').notNull()
})

export const tblTagBlogs = pgTable('tagBlogs', {
  id: serial('id').primaryKey(),
  blogID: integer('blogID').references(() => tblBlogs.id),
  tag: varchar('tag', { length: 255 })
})

export const tblVideoBlogs = pgTable('videoBlogs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }),
  url: varchar('url', { length: 255 }),
  image: varchar('image', { length: 255 })
})
