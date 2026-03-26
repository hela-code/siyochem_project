import { neon } from '@neondatabase/serverless'

/**
 * Test different ways of using Neon to see what actually persists
 */
export async function GET() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL
    if (!DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL not set' }, { status: 500 })
    }

    console.log('\n===== NEON API TEST =====\n')

    // Test 1: Try with fullResults option
    console.log('Test 1: Using neon with fullResults: true')
    const sql = neon(DATABASE_URL, { fullResults: true })

    const testResult1 = await sql(`
      UPDATE feature_settings 
      SET is_enabled = true, updated_at = NOW()
      WHERE feature_name = 'reaction_wall'
    `)
    console.log('fullResults test result:', testResult1)

    // Test 2: Try another way - maybe we need to pass variables differently
    console.log('\nTest 2: Select reaction_wall')
    const testResult2 = await sql(`
      SELECT feature_name, is_enabled FROM feature_settings WHERE feature_name = 'reaction_wall'
    `)
    console.log('Select result:', testResult2)

    // Test 3: Check all rows
    console.log('\nTest 3: Select all rows')
    const testResult3 = await sql(`
      SELECT * FROM feature_settings ORDER BY feature_name
    `)
    console.log('All rows:', testResult3)

    return Response.json({
      test1_update: testResult1,
      test2_selectOne: testResult2,
      test3_selectAll: testResult3
    })
  } catch (err) {
    console.error('Test error:', err)
    return Response.json(
      { error: err.message, type: err.constructor.name, stack: err.stack },
      { status: 500 }
    )
  }
}
