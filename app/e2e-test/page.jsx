'use client'

import { useState, useEffect } from 'react'

export default function EndToEndTest() {
  const [testResults, setTestResults] = useState(null)
  const [running, setRunning] = useState(false)

  async function runTest() {
    setRunning(true)
    const results = {
      steps: [],
      success: false
    }

    try {
      // Step 1: Get initial state
      const initial = await fetch('/api/features/status').then(r => r.json())
      const initialRW = initial.features.reaction_wall
      results.steps.push({
        num: 1,
        name: 'Get Initial State',
        data: { reaction_wall: initialRW },
        status: 'ok'
      })

      // Step 2: Calculate new value
      const newValue = !initialRW
      results.steps.push({
        num: 2,
        name: 'Toggle Value',
        data: { from: initialRW, to: newValue },
        status: 'ok'
      })

      // Step 3: Send PUT
      const putResponse = await fetch('/api/features/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: {
            experiments: initial.features.experiments,
            messages: initial.features.messages,
            reaction_wall: newValue
          }
        })
      }).then(r => r.json())

      const putReturnedValue = putResponse.features.reaction_wall
      const putCorrect = putReturnedValue === newValue

      results.steps.push({
        num: 3,
        name: 'PUT Request Response',
        data: {
          sent: newValue,
          received: putReturnedValue,
          correct: putCorrect
        },
        status: putCorrect ? 'success' : 'error'
      })

      // Step 4: Wait and verify database
      await new Promise(r => setTimeout(r, 500))
      const dbVerify = await fetch('/api/features/status').then(r => r.json())
      const dbValue = dbVerify.features.reaction_wall
      const dbCorrect = dbValue === newValue

      results.steps.push({
        num: 4,
        name: 'Database State (GET Request)',
        data: {
          expected: newValue,
          actual: dbValue,
          correct: dbCorrect
        },
        status: dbCorrect ? 'success' : 'error'
      })

      // Step 5: Wait for another 500ms and check again (simulating navbar)
      await new Promise(r => setTimeout(r, 500))
      const navbar = await fetch('/api/features/status').then(r => r.json())
      const navbarValue = navbar.features.reaction_wall
      const navbarCorrect = navbarValue === newValue

      results.steps.push({
        num: 5,
        name: 'Navbar Poll After 1s',
        data: {
          expected: newValue,
          actual: navbarValue,
          correct: navbarCorrect
        },
        status: navbarCorrect ? 'success' : 'error'
      })

      results.success = putCorrect && dbCorrect && navbarCorrect

    } catch (err) {
      results.steps.push({
        num: -1,
        name: 'Error',
        data: { error: err.message },
        status: 'error'
      })
    }

    setTestResults(results)
    setRunning(false)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">End-to-End Save Test</h1>
      <p className="text-gray-600 mb-6">Tests: GET → Toggle → PUT → Verify → Simulate Navbar Poll</p>

      <button
        onClick={runTest}
        disabled={running}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 mb-6"
      >
        {running ? '⏳ Running Test...' : '▶️ Run Test'}
      </button>

      {testResults && (
        <div className="space-y-4">
          {testResults.steps.map((step) => (
            <div
              key={step.num}
              className={`p-4 rounded-lg border-2 ${
                step.status === 'ok'
                  ? 'bg-slate-50 border-slate-200'
                  : step.status === 'success'
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl font-bold w-10 text-center">
                  {step.status === 'ok' ? 'ℹ️' : step.status === 'success' ? '✅' : '❌'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg mb-1">Step {step.num}: {step.name}</p>
                  <pre className="bg-white p-3 rounded text-sm overflow-auto border">
                    {JSON.stringify(step.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}

          <div
            className={`p-6 rounded-lg border-2 text-center ${
              testResults.success
                ? 'bg-green-100 border-green-400'
                : 'bg-red-100 border-red-400'
            }`}
          >
            <p className="text-2xl font-bold">
              {testResults.success ? '✅ ALL TESTS PASSED!' : '❌ TESTS FAILED'}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              {testResults.success
                ? 'Complete save workflow is working correctly'
                : 'There are still issues to fix'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
