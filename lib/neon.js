import { neon } from '@neondatabase/serverless'

/**
 * Creates a Neon SQL query function using the DATABASE_URL environment variable.
 * Usage:
 *   const sql = getSQL()
 *   const users = await sql`SELECT * FROM users WHERE id = ${userId}`
 */
export function getSQL() {
  const DATABASE_URL = process.env.DATABASE_URL

  if (!DATABASE_URL) {
    throw new Error('Please define the DATABASE_URL environment variable in .env.local')
  }

  return neon(DATABASE_URL)
}
