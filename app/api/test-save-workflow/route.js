import { getSQL } from '@/lib/neon'

/**
 * Detailed test of the ENTIRE save workflow
 * Shows exactly what happens when you try to save changes
 */
export async function GET() {
  try {
    const sql = getSQL()
    
    console.log('\n========== COMPLETE SAVE TEST ==========\n')

    // Step 1: Get initial state
    console.log('STEP 1: Get initial state from database')
    const initial = await sql`
      SELECT feature_name, is_enabled, updated_at
      FROM feature_settings
      ORDER BY feature_name
    `
    console.log('Initial state:', initial)

    // Step 2: Simulate a teacher changing reaction_wall to OFF
    console.log('\nSTEP 2: Simulate teacher toggling reaction_wall to FALSE')
    const featureToUpdate = 'reaction_wall'
    const newValue = false
    
    console.log(`Preparing UPDATE for ${featureToUpdate} = ${newValue}`)
    
    const updateResult = await sql`
      UPDATE feature_settings
      SET is_enabled = ${newValue}, updated_at = NOW()
      WHERE feature_name = ${featureToUpdate}
      RETURNING feature_name, is_enabled, updated_at
    `
    
    console.log('UPDATE result:', updateResult)
    
    if (!updateResult || updateResult.length === 0) {
      console.log('ERROR: UPDATE returned no rows!')
      return Response.json({
        success: false,
        error: 'UPDATE did not modify any rows',
        step: 2
      }, { status: 500 })
    }

    // Step 3: Immediately verify the update in database
    console.log('\nSTEP 3: Verify the update was saved')
    const verify1 = await sql`
      SELECT feature_name, is_enabled, updated_at
      FROM feature_settings
      WHERE feature_name = ${featureToUpdate}
    `
    console.log('Verification 1 (immediately):', verify1)
    
    if (!verify1 || verify1.length === 0) {
      console.log('ERROR: Could not find feature in database!')
      return Response.json({
        success: false,
        error: 'Feature not found in database after update',
        step: 3
      }, { status: 500 })
    }

    // Step 4: Get ALL features to ensure nothing reverted
    console.log('\nSTEP 4: Get all features to check for reversions')
    const allFeatures = await sql`
      SELECT feature_name, is_enabled, updated_at
      FROM feature_settings
      ORDER BY feature_name
    `
    console.log('All features after update:', allFeatures)

    // Step 5: Wait a bit and check again (simulating what happens after navbar refresh)
    console.log('\nSTEP 5: Wait 1 second and check again (simulating navbar refresh)')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const verify2 = await sql`
      SELECT feature_name, is_enabled, updated_at
      FROM feature_settings
      WHERE feature_name = ${featureToUpdate}
    `
    console.log('Verification 2 (after 1 second):', verify2)

    // Step 6: Prepare the response that would be sent to client
    console.log('\nSTEP 6: Preparing response to send to client')
    const finalFeatures = {}
    allFeatures.forEach(f => {
      finalFeatures[f.feature_name] = f.is_enabled
    })
    
    console.log('Final features to return:', finalFeatures)

    // SUCCESS
    return Response.json({
      success: true,
      message: 'Save workflow test completed successfully',
      workflow: {
        step1_initial: initial.map(f => ({ name: f.feature_name, enabled: f.is_enabled })),
        step2_update_result: updateResult.map(f => ({ name: f.feature_name, enabled: f.is_enabled })),
        step3_immediate_verify: verify1.map(f => ({ name: f.feature_name, enabled: f.is_enabled })),
        step4_all_features: allFeatures.map(f => ({ name: f.feature_name, enabled: f.is_enabled })),
        step5_after_delay_verify: verify2.map(f => ({ name: f.feature_name, enabled: f.is_enabled })),
        step6_final_response: finalFeatures
      },
      status: {
        update_successful: updateResult && updateResult.length > 0,
        value_persisted: verify1[0]?.is_enabled === newValue,
        value_still_there: verify2[0]?.is_enabled === newValue
      }
    })

  } catch (error) {
    console.error('\n✗ TEST ERROR:')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    
    return Response.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name
    }, { status: 500 })
  }
}
