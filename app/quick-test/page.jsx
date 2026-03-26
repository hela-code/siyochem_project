'use client'

import { useState, useEffect } from 'react'

export default function QuickSaveTest() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function runTest() {
    setLoading(true)
    try {
      // Step 1: Get initial
      const initial = await fetch('/api/features/status').then(r => r.json())
      const oldVal = initial.features.reaction_wall

      // Step 2: Toggle locally
      const newVal = !oldVal

      // Step 3: Send PUT
      const putRes = await fetch('/api/features/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: {
            ...initial.features,
            reaction_wall: newVal
          }
        })
      }).then(r => r.json())

      const putValue = putRes.features.reaction_wall

      // Step 4: GET to verify
      await new Promise(r => setTimeout(r, 300))
      const verify = await fetch('/api/features/status').then(r => r.json())
      const dbValue = verify.features.reaction_wall

      setResult({
        initial: oldVal,
        toggled: newVal,
        putResponse: putValue,
        database: dbValue,
        putCorrect: putValue === newVal,
        dbCorrect: dbValue === newVal,
        allCorrect: putValue === newVal && dbValue === newVal
      })
    } catch (e) {
      setResult({ error: e.message })
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Quick Save Test</h1>
      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? 'Testing...' : 'Run Test'}
      </button>

      {result && (
        <div className="bg-slate-50 p-6 rounded-lg border space-y-3">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Initial:</span> {String(result.initial)}</p>
                <p><span className="font-semibold">Toggled to:</span> {String(result.toggled)}</p>
                <p className={`${result.putCorrect ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                  PUT Response: {String(result.putResponse)} {result.putCorrect ? '✅' : '❌'}
                </p>
                <p className={`${result.dbCorrect ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                  Database: {String(result.database)} {result.dbCorrect ? '✅' : '❌'}
                </p>
              </div>
              <div className={`p-3 rounded text-center font-bold ${result.allCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {result.allCorrect ? '✅ SUCCESS' : '❌ FAILED'} - PUT: {result.putCorrect ? '✅' : '❌'} | DB: {result.dbCorrect ? '✅' : '❌'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
