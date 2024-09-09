import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import dotenv from 'dotenv'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

dotenv.config()
export const migrationDB = async () => {
  try {
    const client = new Client({
      host: process.env.POSTGRES_HOST || '',
      port: 5432,
      user: process.env.POSTGRES_USERNAME || '',
      password: process.env.POSTGRES_PASSWORD || '',
      database: process.env.POSTGRES_DB || ''
    })

    await client.connect()

    console.log('connect to db success')
    const db = drizzle(client)
    migrate(db, { migrationsFolder: 'drizzle' })
    return 'success'
  } catch (err) {
    console.error('cannot connect to db')
  }
}

migrationDB()
