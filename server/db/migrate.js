import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Client } = pg
const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url))
const client = new Client({ connectionString: process.env.DATABASE_URL })

try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  const schema = await readFile(schemaPath, 'utf8')
  await client.connect()
  await client.query(schema)
  console.log('Database migration completed successfully.')
} catch (error) {
  console.error('Database migration failed:', error.message)
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}