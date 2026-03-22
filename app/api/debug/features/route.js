import { getSQL } from '@/lib/neon'

export async function GET() {
  try {
    const sql = getSQL()

    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'feature_settings'
      )
    `

    console.log('Table exists:', tableCheck)

    // Get all features
    const features = await sql`SELECT * FROM feature_settings`
    console.log('Features in DB:', features)

    return Response.json({
      success: true,
      tableExists: tableCheck[0]?.exists || false,
      features,
      count: features.length,
    })
  } catch (error) {
    console.error('Debug error:', error)
    return Response.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
