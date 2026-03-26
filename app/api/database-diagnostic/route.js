import { getSQL } from '@/lib/neon'

/**
 * Step-by-step diagnostic showing what's in database before and after
 */
export async function GET() {
  try {
    const sql = getSQL()

    console.log('\n===== DATABASE DIAGNOSTIC =====\n')

    // Step 1: Show current state
    console.log('Step 1: Current database state')
    const before = await sql`
      SELECT id, feature_name, is_enabled, updated_at 
      FROM feature_settings 
      ORDER BY feature_name
    `
    console.log('Before:', before)

    // Step 2: Try updating ONE feature
    console.log('\nStep 2: Update reaction_wall to TRUE')
    const updateResult = await sql`
      UPDATE feature_settings 
      SET is_enabled = true, updated_at = NOW()
      WHERE feature_name = 'reaction_wall'
      RETURNING feature_name, is_enabled
    `
    console.log('RETURNING from UPDATE:', updateResult)

    // Step 3: Immediately check if it persisted
    console.log('\nStep 3: Immediately SELECT to verify persistence')
    const afterSelect = await sql`
      SELECT feature_name, is_enabled 
      FROM feature_settings 
      WHERE feature_name = 'reaction_wall'
    `
    console.log('SELECT after UPDATE:', afterSelect)

    // Step 4: Try a RAW query to see all rows
    console.log('\nStep 4: Raw SELECT all rows')
    const allRows = await sql`
      SELECT * FROM feature_settings
    `
    console.log('All rows:', allRows)

    // Step 5: Check specific row count
    console.log('\nStep 5: Count rows with is_enabled = true')
    const countTrue = await sql`
      SELECT COUNT(*) as cnt FROM feature_settings WHERE is_enabled = true
    `
    console.log('Rows with is_enabled=true:', countTrue)

    const countFalse = await sql`
      SELECT COUNT(*) as cnt FROM feature_settings WHERE is_enabled = false
    `
    console.log('Rows with is_enabled=false:', countFalse)

    return Response.json({
      timestamp: new Date().toISOString(),
      beforeUpdate: before,
      updateReturning: updateResult,
      afterSelectSameConnection: afterSelect,
      allRowsCheck: allRows,
      countTrue: countTrue[0]?.cnt || 0,
      countFalse: countFalse[0]?.cnt || 0
    })
  } catch (err) {
    console.error('Diagnostic error:', err)
    return Response.json(
      { error: err.message, stack: err.stack },
      { status: 500 }
    )
  }
}
