import { getSQLClient, getSQL } from '@/lib/neon'

/**
 * GET - Returns all feature settings
 */
export async function GET() {
  let client = null
  try {
    console.log('\n[GET] ============= START GET REQUEST =============')
    console.log('[GET] Fetching features from database...')

    client = await getSQLClient()
    const queryResult = await client.query(
      'SELECT feature_name, is_enabled, description, updated_at FROM feature_settings ORDER BY feature_name'
    )
    const features = queryResult.rows

    console.log('[GET] ============= DATABASE RESPONSE =============')
    console.log('[GET] Row count:', features.length)
    features.forEach((f, idx) => {
      console.log(`[GET] Row ${idx}: ${f.feature_name} = ${f.is_enabled} (${typeof f.is_enabled})`)
    })

    const result = {
      success: true,
      features: features.reduce((acc, f) => {
        console.log(`[GET] Processing: ${f.feature_name} (raw is_enabled: ${f.is_enabled}, typeof: ${typeof f.is_enabled})`)
        acc[f.feature_name] = f.is_enabled
        return acc
      }, {}),
    }
    
    console.log('[GET] ============= FINAL RESPONSE =============')
    console.log('[GET]', JSON.stringify(result.features))
    return Response.json(result)
  } catch (error) {
    console.error('[GET] Error fetching features:', error)
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.end()
    }
  }
}

/**
 * PUT - Update feature settings (teacher only)
 */
export async function PUT(request) {
  let client = null
  try {
    client = await getSQLClient()
    
    console.log('PUT request received')
    console.log('Request headers:', {
      contentType: request.headers.get('content-type'),
      contentLength: request.headers.get('content-length'),
    })
    
    let body
    try {
      const clonedRequest = request.clone()
      const rawBody = await clonedRequest.text()
      console.log('Raw request body:', rawBody)
      body = JSON.parse(rawBody)
      console.log('Parsed body:', body)
    } catch (e) {
      console.error('Failed to parse request body:', e)
      console.error('Error details:', {
        message: e.message,
        stack: e.stack
      })
      return Response.json(
        { success: false, message: 'Invalid request body', error: e.message },
        { status: 400 }
      )
    }

    const { features } = body
    
    if (!features || typeof features !== 'object') {
      return Response.json(
        { success: false, message: 'Features object is required' },
        { status: 400 }
      )
    }

    console.log('Updating features:', features)

    // Verify table exists
    const tableCheck = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'feature_settings'
      )`
    )
    
    if (!tableCheck.rows[0]?.exists) {
      console.error('feature_settings table does not exist')
      return Response.json(
        { success: false, message: 'feature_settings table not found. Please run schema.sql first.' },
        { status: 500 }
      )
    }

    // Update each feature
    const results = {}
    let successCount = 0
    for (const [featureName, isEnabled] of Object.entries(features)) {
      try {
        console.log(`[PUT] Updating ${featureName} to ${isEnabled}`)
        
        // Ensure isEnabled is a boolean
        const boolValue = isEnabled === true || isEnabled === 'true'
        
        console.log(`[PUT] Setting ${featureName} to: ${boolValue} (type: ${typeof boolValue})`)
        console.log(`[PUT] About to execute UPDATE with:`)
        console.log(`  WHERE feature_name = '${featureName}' (type: ${typeof featureName})`)
        console.log(`  SET is_enabled = ${boolValue} (type: ${typeof boolValue})`)
        
        const updateResult = await client.query(
          `UPDATE feature_settings 
           SET is_enabled = $1, updated_at = NOW()
           WHERE feature_name = $2
           RETURNING feature_name, is_enabled, updated_at`,
          [boolValue, featureName]
        )
        
        console.log(`[PUT] Update RETURNING result:`, updateResult.rows)
        console.log(`[PUT] RETURNING array length:`, updateResult.rows?.length || 0)
        console.log(`[PUT] RETURNING full details:`, JSON.stringify(updateResult.rows))
        
        if (updateResult.rows && updateResult.rows.length > 0) {
          const dbValue = updateResult.rows[0].is_enabled
          results[featureName] = dbValue
          console.log(`[PUT] ✓ ${featureName} = ${dbValue} (from UPDATE RETURNING)`)
          successCount++
        } else {
          console.warn(`[PUT] ✗ Feature ${featureName} not found in database`)
          return Response.json(
            { success: false, message: `Feature '${featureName}' not found in database` },
            { status: 404 }
          )
        }
      } catch (featureError) {
        console.error(`[PUT] ✗ Error updating feature ${featureName}:`, featureError)
        return Response.json(
          { success: false, message: `Error updating ${featureName}: ${featureError.message}` },
          { status: 500 }
        )
      }
    }

    console.log(`[PUT] All ${successCount} features updated successfully`)
    
    // Do final verification SELECT on the same connection to confirm persistence
    console.log('[PUT] Doing final verification SELECT...')
    const finalVerify = await client.query(
      `SELECT feature_name, is_enabled FROM feature_settings ORDER BY feature_name`
    )
    console.log('[PUT] Final verification:', finalVerify.rows)
    
    // Build response from the final SELECT
    const finalResults = {}
    finalVerify.rows.forEach(f => {
      finalResults[f.feature_name] = f.is_enabled
    })
    
    console.log('[PUT] Returning to client:', finalResults)
    
    return Response.json({
      success: true,
      message: 'Features updated successfully',
      features: finalResults,
      updatedCount: successCount
    })
  } catch (error) {
    console.error('Error updating features:', error)
    return Response.json(
      { success: false, message: error.message || 'Failed to update features', details: error.toString() },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.end()
    }
  }
}
