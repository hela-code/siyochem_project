import { getSQL } from '@/lib/neon'

/**
 * Test updating just reaction_wall
 */
export async function GET() {
  try {
    const sql = getSQL()
    
    console.log('\n========== REACTION_WALL ONLY TEST ==========\n')
    
    // Step 1: Get current state
    console.log('Step 1: Current state')
    const before = await sql`
      SELECT feature_name, is_enabled, updated_at 
      FROM feature_settings 
      WHERE feature_name = 'reaction_wall'
    `
    console.log('Before:', before)
    const beforeValue = before[0]?.is_enabled
    
    // Step 2: Update to opposite
    const newValue = !beforeValue
    console.log(`\nStep 2: Updating reaction_wall from ${beforeValue} to ${newValue}`)
    const updateResult = await sql`
      UPDATE feature_settings 
      SET is_enabled = ${newValue}, updated_at = NOW()
      WHERE feature_name = 'reaction_wall'
      RETURNING feature_name, is_enabled, updated_at
    `
    console.log('Update returned:', updateResult)
    
    // Step 3: Verify immediately
    console.log(`\nStep 3: Verifying in database`)
    const after = await sql`
      SELECT feature_name, is_enabled, updated_at 
      FROM feature_settings 
      WHERE feature_name = 'reaction_wall'
    `
    console.log('After update:', after)
    const afterValue = after[0]?.is_enabled
    
    // Step 4: Check all features
    console.log(`\nStep 4: All features now`)
    const all = await sql`
      SELECT feature_name, is_enabled, updated_at 
      FROM feature_settings 
      ORDER BY feature_name
    `
    console.log('All features:', all)
    
    const success = afterValue === newValue
    
    return Response.json({
      success,
      message: success ? 'Update successful' : 'Update FAILED',
      beforeValue,
      newValue,
      afterValue,
      match: afterValue === newValue,
      updateResponse: updateResult,
      allFeatures: all.map(f => ({
        name: f.feature_name,
        enabled: f.is_enabled,
        updated_at: f.updated_at
      }))
    })
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
      error: error.toString()
    }, { status: 500 })
  }
}
