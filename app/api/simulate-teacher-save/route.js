import { getSQL } from '@/lib/neon'

/**
 * Exact simulation of what happens when teacher clicks Save
 * 1. Gets current state
 * 2. Toggles one feature
 * 3. Sends PUT with all 3 features
 * 4. Returns response
 * 5. Checks if database was actually updated
 */
export async function GET() {
  try {
    const sql = getSQL()
    
    console.log('\n========== TEACHER SAVE SIMULATION ==========\n')

    // Step 1: Teacher loads the page (GET current state)
    console.log('Step 1: Teacher loads /teacher-settings')
    const initial = await sql`
      SELECT feature_name, is_enabled
      FROM feature_settings
      ORDER BY feature_name
    `
    const initialState = {}
    initial.forEach(f => {
      initialState[f.feature_name] = f.is_enabled
    })
    console.log('Initial features:', initialState)

    // Step 2: Teacher toggles reaction_wall (only in local state, not saved yet)
    console.log('\nStep 2: Teacher clicks toggle for reaction_wall')
    const localState = {
      ...initialState,
      reaction_wall: !initialState.reaction_wall  // TOGGLE IT
    }
    console.log('Local state after toggle:', localState)

    // Step 3: Teacher clicks Save button (sends PUT with all 3 featsures)
    console.log('\nStep 3: Teacher clicks Save → PUT request sent')
    console.log('PUT payload:', localState)

    // Now do the actual UPDATE
    let updateCount = 0
    const updateResults = {}
    for (const [featureName, isEnabled] of Object.entries(localState)) {
      console.log(`  Updating ${featureName} = ${isEnabled}`)
      const updateResult = await sql`
        UPDATE feature_settings
        SET is_enabled = ${isEnabled}, updated_at = NOW()
        WHERE feature_name = ${featureName}
        RETURNING feature_name, is_enabled
      `
      console.log(`    UPDATE result length: ${updateResult.length}, result:`, updateResult)
      if (updateResult && updateResult.length > 0) {
        updateResults[featureName] = updateResult[0].is_enabled
        console.log(`    ✓ Returned from DB: ${featureName} = ${updateResult[0].is_enabled}`)
      } else {
        console.log(`    ✗ NO ROWS UPDATED for ${featureName}! This might mean the row doesn't exist or feature_name doesn't match.`)
      }
      updateCount++
    }
    console.log(`Updated ${updateCount} features, RETURNING results:`, updateResults)

    // Step 4: API returns response (what would be sent back to teacher)
    console.log('\nStep 4: API returns the RETURNING results from UPDATEs (fresh data)')
    const responseFeatures = updateResults  // Use RETURNING clause results, not new SELECT
    console.log('PUT response features:', responseFeatures)

    // Step 5: Check if what we're returning matches what's in database
    console.log('\nStep 5: Verify - Does response match database?')
    // Add delay to allow database consistency
    await new Promise(resolve => setTimeout(resolve, 500))
    // Use a new SQL connection to ensure we get fresh data
    const freshSql = getSQL()
    const dbVerify = await freshSql`
      SELECT feature_name, is_enabled
      FROM feature_settings
      ORDER BY feature_name
    `
    const dbState = {}
    dbVerify.forEach(f => {
      dbState[f.feature_name] = f.is_enabled
    })
    console.log('Actual database state:', dbState)

    // Step 6: What the navbar will see when it polls (5 seconds later)
    console.log('\nStep 6: Wait 100ms, then navbar polls (simulating 5 second refresh)')
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const navbarPoll = await sql`
      SELECT feature_name, is_enabled
      FROM feature_settings
      ORDER BY feature_name
    `
    const navbarState = {}
    navbarPoll.forEach(f => {
      navbarState[f.feature_name] = f.is_enabled
    })
    console.log('NavBar sees:', navbarState)

    // ANALYSIS
    console.log('\n========== ANALYSIS ==========')
    const responseMatches = JSON.stringify(responseFeatures) === JSON.stringify(localState)
    const dbMatches = JSON.stringify(dbState) === JSON.stringify(localState)
    const navbarMatches = JSON.stringify(navbarState) === JSON.stringify(localState)
    const responseEqDb = JSON.stringify(responseFeatures) === JSON.stringify(dbState)

    console.log('Response sent to teacher correct?', responseMatches)
    console.log('Database saved correctly?', dbMatches)
    console.log('Navbar will see correct state?', navbarMatches)
    console.log('Response matches database?', responseEqDb)

    return Response.json({
      success: true,
      message: 'Teacher save simulation completed',
      step1_initialState: initialState,
      step2_localStateAfterToggle: localState,
      step3_updateCount: updateCount,
      step4_putResponseFeatures: responseFeatures,
      step5_actualDatabaseState: dbState,
      step6_navbarWillSee: navbarState,
      analysis: {
        responseCorrect: responseMatches,
        databaseSaved: dbMatches,
        navbarWillSeeCorrect: navbarMatches,
        responseMatchesDatabase: responseEqDb,
        allCorrect: responseMatches && dbMatches && navbarMatches && responseEqDb
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
