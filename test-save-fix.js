#!/usr/bin/env node

async function test() {
  try {
    console.log('\n===== FEATURE SAVE TEST =====\n')

    // Step 1: GET initial state
    console.log('1. Getting initial state...')
    const initial = await fetch('http://localhost:3001/api/features/status').then(r => r.json())
    const oldRW = initial.features.reaction_wall
    console.log(`   Initial reaction_wall: ${oldRW}`)

    // Step 2: Toggle and send PUT
    const newRW = !oldRW
    console.log(`\n2. Toggling reaction_wall to ${newRW}...`)
    const putRes = await fetch('http://localhost:3001/api/features/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        features: {
          ...initial.features,
          reaction_wall: newRW
        }
      })
    }).then(r => r.json())

    const putValue = putRes.features.reaction_wall
    console.log(`   PUT Response: reaction_wall=${putValue}`)
    const putOk = putValue === newRW
    console.log(`   ${putOk ? '✅' : '❌'} PUT returned correct value: ${putOk}`)

    // Step 3: Wait and verify database
    console.log(`\n3. Waiting 500ms, then verifying database...`)
    await new Promise(r => setTimeout(r, 500))
    const verify = await fetch('http://localhost:3001/api/features/status').then(r => r.json())
    const dbValue = verify.features.reaction_wall
    console.log(`   Database: reaction_wall=${dbValue}`)
    const dbOk = dbValue === newRW
    console.log(`   ${dbOk ? '✅' : '❌'} Database has correct value: ${dbOk}`)

    // Step 4: Summary
    console.log(`\n===== RESULTS =====`)
    console.log(`PUT endpoint:    ${putOk ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Database save:   ${dbOk ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Overall:         ${putOk && dbOk ? '✅ SUCCESS - FIX COMPLETE!' : '❌ STILL BROKEN'}`)
    console.log()

    process.exit(putOk && dbOk ? 0 : 1)
  } catch (err) {
    console.error('TEST ERROR:', err.message)
    process.exit(1)
  }
}

test()
