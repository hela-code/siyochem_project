import { getSQL } from '@/lib/neon'

/**
 * Direct test of database updates
 * GET: Shows current state + tests updating reaction_wall to false
 */
export async function GET() {
  try {
    const sql = getSQL()

    console.log('\n========== DATABASE UPDATE TEST ==========\n')

    // Step 1: Get current state
    console.log('Step 1: Getting current state...')
    const before = await sql`
      SELECT feature_name, is_enabled, updated_at 
      FROM feature_settings 
      ORDER BY feature_name
    `
    console.log('Current state:', before)

    // Step 2: Test update on reaction_wall
    console.log('\nStep 2: Updating reaction_wall to FALSE...')
    const testUpdate = await sql`
      UPDATE feature_settings 
      SET is_enabled = false, updated_at = NOW()
      WHERE feature_name = 'reaction_wall'
      RETURNING feature_name, is_enabled, updated_at
    `
    console.log('Update returned:', testUpdate)

    // Step 3: Verify the update
    console.log('\nStep 3: Verifying the update...')
    const after = await sql`
      SELECT feature_name, is_enabled, updated_at 
      FROM feature_settings 
      WHERE feature_name = 'reaction_wall'
    `
    console.log('After update:', after)

    // Step 4: Revert it back
    console.log('\nStep 4: Reverting to TRUE...')
    const revert = await sql`
      UPDATE feature_settings 
      SET is_enabled = true, updated_at = NOW()
      WHERE feature_name = 'reaction_wall'
      RETURNING feature_name, is_enabled, updated_at
    `
    console.log('Revert returned:', revert)

    // Step 5: Final state
    console.log('\nStep 5: Final state of all features...')
    const final = await sql`
      SELECT feature_name, is_enabled, updated_at 
      FROM feature_settings 
      ORDER BY feature_name
    `
    console.log('Final state:', final)

    const reactionWall = after[0]
    const updateWorked = reactionWall && reactionWall.is_enabled === false

    return Response.json({
      success: updateWorked,
      message: updateWorked 
        ? '✓ Database update is working correctly!' 
        : '✗ Database update failed - value did not change',
      before: before.map(f => ({
        name: f.feature_name,
        enabled: f.is_enabled,
        updated_at: f.updated_at
      })),
      after: after.map(f => ({
        name: f.feature_name,
        enabled: f.is_enabled,
        updated_at: f.updated_at
      })),
      final: final.map(f => ({
        name: f.feature_name,
        enabled: f.is_enabled,
        updated_at: f.updated_at
      })),
      details: {
        update_executed: testUpdate && testUpdate.length > 0,
        update_rows_affected: testUpdate?.length || 0,
        update_response: testUpdate?.[0] || null,
        after_value: after?.[0]?.is_enabled,
        expected_value: false,
        match: after?.[0]?.is_enabled === false
      }
    })
  } catch (error) {
    console.error('Test failed with error:', error)
    return Response.json(
      {
        success: false,
        message: 'Database test failed',
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}
