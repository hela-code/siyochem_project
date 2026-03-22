import { getSQL } from '@/lib/neon'

export async function GET() {
  try {
    const sql = getSQL()

    console.log('\n=== RAW DATABASE QUERY ===\n')

    // Raw query to see what's in the table
    const rows = await sql`SELECT * FROM feature_settings`

    console.log('Raw rows in feature_settings:', rows)

    // Also try with different syntax
    const count = await sql`SELECT COUNT(*) as cnt FROM feature_settings`
    console.log('Row count:', count)

    const features = await sql`SELECT feature_name, is_enabled FROM feature_settings ORDER BY feature_name`
    console.log('Features:', features)

    return Response.json({
      rowCount: count[0]?.cnt || 0,
      features: features || [],
      allRows: rows || [],
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('Error:', err)
    return Response.json(
      { error: err.message, stack: err.stack },
      { status: 500 }
    )
  }
}
