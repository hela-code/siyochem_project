'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestDatabaseUpdate() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('Running database update test...')
      const { data } = await axios.get('/api/test-db-update')
      console.log('Test result:', data)
      setResult(data)

      if (!data.success) {
        setError('Database update test FAILED - the update is not working correctly')
      }
    } catch (err) {
      console.error('Test error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-2">Database Update Test</h1>
      <p className="text-gray-400 mb-8">Tests if database updates are working correctly</p>

      <button
        onClick={runTest}
        disabled={loading}
        className="mb-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded flex items-center gap-2"
      >
        {loading && <Loader2 className="animate-spin w-5 h-5" />}
        {loading ? 'Running Test...' : 'Run Database Update Test'}
      </button>

      {result && (
        <div className={`rounded-lg border-2 p-6 ${result.success ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
          <div className="flex items-center gap-2 mb-4">
            {result.success ? (
              <CheckCircle className="text-green-400 w-6 h-6" />
            ) : (
              <AlertCircle className="text-red-400 w-6 h-6" />
            )}
            <h2 className={`text-2xl font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.message}
            </h2>
          </div>

          {/* Test Details */}
          <div className="space-y-4 text-white">
            {/* Current State Before Update */}
            <div className="bg-gray-800 rounded p-4">
              <p className="font-semibold mb-2 text-yellow-400">Before Update:</p>
              <div className="space-y-1 text-sm font-mono">
                {result.before?.map(f => (
                  <p key={f.name}>
                    {f.name}: <span className={f.enabled ? 'text-green-400' : 'text-red-400'}>{String(f.enabled)}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Update Details */}
            <div className="bg-gray-800 rounded p-4">
              <p className="font-semibold mb-2 text-cyan-400">Update Details (reaction_wall → false):</p>
              <div className="space-y-1 text-sm">
                <p>Update executed: <span className={result.details.update_executed ? 'text-green-400' : 'text-red-400'}>{String(result.details.update_executed)}</span></p>
                <p>Rows affected: <span className="text-blue-400">{result.details.update_rows_affected}</span></p>
                <p>Update response: <span className="text-blue-400">{JSON.stringify(result.details.update_response)}</span></p>
              </div>
            </div>

            {/* State After Update */}
            <div className="bg-gray-800 rounded p-4">
              <p className="font-semibold mb-2 text-yellow-400">After Update (reaction_wall only):</p>
              <div className="space-y-1 text-sm font-mono">
                {result.after?.map(f => (
                  <p key={f.name}>
                    {f.name}: <span className={f.enabled ? 'text-green-400' : 'text-red-400'}>{String(f.enabled)}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div className={`rounded p-4 ${result.details.match ? 'bg-green-900/30 border-l-4 border-green-500' : 'bg-red-900/30 border-l-4 border-red-500'}`}>
              <p className="font-semibold mb-1">Verification:</p>
              <p>Expected value: <span className="text-blue-400">false</span></p>
              <p>Actual value: <span className={result.details.after_value ? 'text-red-400' : 'text-green-400'}>{String(result.details.after_value)}</span></p>
              <p>Match: <span className={result.details.match ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{result.details.match ? '✓ YES' : '✗ NO'}</span></p>
            </div>

            {/* Final State */}
            <div className="bg-gray-800 rounded p-4">
              <p className="font-semibold mb-2 text-yellow-400">Final State (all features):</p>
              <div className="space-y-1 text-sm font-mono">
                {result.final?.map(f => (
                  <p key={f.name}>
                    {f.name}: <span className={f.enabled ? 'text-green-400' : 'text-red-400'}>{String(f.enabled)}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className={`mt-6 rounded p-4 ${result.success ? 'bg-green-500/20 border-l-4 border-green-500' : 'bg-red-500/20 border-l-4 border-red-500'}`}>
            <p className={`font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success 
                ? '✓ Database updates ARE working properly. The issue must be elsewhere.' 
                : '✗ Database updates are NOT working. The value is not changing in the database.'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-6 text-red-300">
          <p className="font-bold mb-2">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white font-bold mb-3">How to Use:</h3>
        <ol className="text-gray-300 space-y-2 list-decimal list-inside">
          <li>Click "Run Database Update Test" button above</li>
          <li>Check the results below - it will show before/after states</li>
          <li>If "Match: ✓ YES" then database updates work fine</li>
          <li>If "Match: ✗ NO" then there's a database issue</li>
          <li>Check your browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  )
}
