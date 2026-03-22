import { Client } from '@neondatabase/serverless'

/**
 * Creates a Neon database client for executing queries.
 * Usage:
 *   const client = await getSQLClient()
 *   const result = await client.query('SELECT * FROM users WHERE id = $1', [userId])
 *   await client.end()
 */
export async function getSQLClient() {
  const DATABASE_URL = process.env.DATABASE_URL

  if (!DATABASE_URL) {
    throw new Error('Please define the DATABASE_URL environment variable in .env.local')
  }

  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  return client
}

// Keep the old getSQL for backwards compatibility, but trying to fix it
import { neon } from '@neondatabase/serverless'

export function getSQL() {
  const DATABASE_URL = process.env.DATABASE_URL

  if (!DATABASE_URL) {
    throw new Error('Please define the DATABASE_URL environment variable in .env.local')
  }

  return neon(DATABASE_URL)
}
