'use client'

import { useState, useEffect } from 'react'

export default function TestSaveFix() {
  const [features, setFeatures] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // Load initial state
  useEffect(() => {
    loadFeatures()
  }, [])

  async function loadFeatures() {
    try {
      const res = await fetch('/api/features/status')
      const data = await res.json()
      setFeatures(data.features)
    } catch (err) {
      console.error('Error loading features:', err)
    }
  }

  async function handleToggleAndSave() {
    if (!features) return

    setLoading(true)
    setResult(null)

    const localState = {
      ...features,
      reaction_wall: !features.reaction_wall // Toggle
    }

    const oldReactionWall = features.reaction_wall
    const newReactionWall = !oldReactionWall

    try {
      // Send PUT request
      const putResponse = await fetch('/api/features/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: localState })
      })
      const putData = await putResponse.json()

      console.log('PUT Response:', putData)

      // Check what API returned
      const responseReactionWall = putData.features.reaction_wall

      // Wait and then verify in database
      await new Promise(r => setTimeout(r, 500))

      const verifyRes = await fetch('/api/features/status')
      const verifyData = await verifyRes.json()
      const databaseReactionWall = verifyData.features.reaction_wall

      setResult({
        toggled: `${oldReactionWall} → ${newReactionWall}`,
        apiReturned: responseReactionWall,
        databaseSaved: databaseReactionWall,
        isCorrect: responseReactionWall === newReactionWall && databaseReactionWall === newReactionWall,
        apiCorrect: responseReactionWall === newReactionWall,
        dbCorrect: databaseReactionWall === newReactionWall
      })

      // Update local features
      setFeatures(putData.features)
    } catch (err) {
      console.error('Error:', err)
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (!features) return <div className="p-4">Loading...</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Save Fix Test</h1>

      <div className="bg-blue-50 p-4 rounded mb-6 border border-blue-200">
        <p className="font-semibold">Current State:</p>
        <pre className="mt-2 text-sm bg-white p-2 rounded">
          {JSON.stringify(features, null, 2)}
        </pre>
      </div>

      <button
        onClick={handleToggleAndSave}
        disabled={loading}
        className="px-6 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? 'Saving...' : 'Toggle reaction_wall & Save'}
      </button>

      {result && (
        <div
          className={`mt-6 p-4 rounded border-2 ${
            result.error
              ? 'bg-red-50 border-red-200'
              : result.isCorrect
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <p className="font-semibold text-lg mb-2">
            {result.error ? '❌ Error' : result.isCorrect ? '✅ Success!' : '⚠️ Partial'}
          </p>

          {!result.error && (
            <>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Toggled:</span> {result.toggled}
                </p>
                <p>
                  <span className="font-semibold">API Response:</span> reaction_wall ={' '}
                  <span
                    className={
                      result.apiCorrect
                        ? 'text-green-600 font-bold'
                        : 'text-red-600 font-bold'
                    }
                  >
                    {String(result.apiReturned)}
                  </span>
                  {result.apiCorrect && ' ✓'}
                </p>
                <p>
                  <span className="font-semibold">Database:</span> reaction_wall ={' '}
                  <span
                    className={
                      result.dbCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'
                    }
                  >
                    {String(result.databaseSaved)}
                  </span>
                  {result.dbCorrect && ' ✓'}
                </p>
              </div>

              {!result.isCorrect && (
                <div className="mt-4 p-3 bg-red-100 rounded text-sm">
                  <p className="font-semibold mb-1">Issues Found:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {!result.apiCorrect && <li>API returned wrong value</li>}
                    {!result.dbCorrect && <li>Database has wrong value</li>}
                  </ul>
                </div>
              )}
            </>
          )}

          {result.error && <p className="text-red-700">{result.error}</p>}
        </div>
      )}
    </div>
  )
}
