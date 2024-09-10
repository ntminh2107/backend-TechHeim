import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
//TODO: dot env trong app.tsx

let dbClient: NodePgDatabase | null = null

export const getDbClient = () => {
  if (dbClient === null) throw new Error('DB client is not initialized')
  return dbClient
}

export const connectionToDB = async () => {
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
    dbClient = drizzle(client)
  } catch (err) {
    console.error('cannot connect to db')
  }
}
