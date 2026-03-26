'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function TestUpdateFeature() {
  const [selectedFeature, setSelectedFeature] = useState('messages')
  const [newState, setNewState] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [currentState, setCurrentState] = useState(null)

  const features = ['messages', 'experiments', 'reaction_wall']

  const handleGetCurrentState = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/test/update-feature')
      setCurrentState(data.features)
      console.log('Current state:', data.features)
    } catch (error) {
      console.error('Error:', error)
      setResult({
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestUpdate = async () => {
    try {
      setLoading(true)
      setResult(null)

      console.log(`Testing update: ${selectedFeature} = ${newState}`)

      const { data } = await axios.post('/api/test/update-feature', {
        featureName: selectedFeature,
        isEnabled: newState
      })

      console.log('Test result:', data)
      setResult(data)

      // Re-fetch state
      setTimeout(handleGetCurrentState, 500)
    } catch (error) {
      console.error('Error:', error)
      setResult({
        error: error.response?.data?.message || error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Test Database Updates</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Test Update</h2>

          <div className="space-y-4">
            {/* Feature Selector */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Select Feature:
              </label>
              <select
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600"
              >
                {features.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* State Selector */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                New State:
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setNewState(true)}
                  className={`flex-1 px-4 py-2 rounded font-semibold transition ${
                    newState
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  ENABLED
                </button>
                <button
                  onClick={() => setNewState(false)}
                  className={`flex-1 px-4 py-2 rounded font-semibold transition ${
                    !newState
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  DISABLED
                </button>
              </div>
            </div>

            {/* Request Info */}
            <div className="bg-gray-700 rounded p-3 text-sm">
              <p className="text-gray-400 mb-2">Request that will be sent:</p>
              <pre className="text-green-400 overflow-auto">
                {`POST /api/test/update-feature
{
  "featureName": "${selectedFeature}",
  "isEnabled": ${newState}
}`}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleGetCurrentState}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition"
              >
                {loading ? <Loader2 className="inline mr-2 animate-spin" /> : ''}
                Get Current State
              </button>
              <button
                onClick={handleTestUpdate}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition"
              >
                {loading ? <Loader2 className="inline mr-2 animate-spin" /> : ''}
                Test Update
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Results</h2>

          {currentState && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Current Database State:</h3>
              <div className="space-y-2">
                {currentState.map((f, idx) => (
                  <div key={idx} className="bg-gray-700 p-3 rounded">
                    <p className="font-mono">
                      <span className="text-yellow-400">{f.name}</span>
                      {': '}
                      <span className={f.enabled ? 'text-green-400' : 'text-red-400'}>
                        {f.enabled ? '✓ ENABLED' : '✗ DISABLED'}
                      </span>
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Updated: {new Date(f.last_updated).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Last Test Result:</h3>

              <div
                className={`p-4 rounded-lg mb-4 border ${
                  result.error
                    ? 'bg-red-500/10 border-red-500 text-red-400'
                    : result.status === 'SUCCESS'
                      ? 'bg-green-500/10 border-green-500 text-green-400'
                      : 'bg-yellow-500/10 border-yellow-500 text-yellow-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.error ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  <span className="font-bold">{result.error ? 'ERROR' : result.status}</span>
                </div>
                {result.error && <p>{result.error}</p>}
                {result.message && <p>{result.message}</p>}
              </div>

              {result.details && (
                <div className="bg-gray-700 rounded p-3 text-sm space-y-2">
                  <p>
                    <span className="text-gray-400">Feature:</span>
                    <span className="text-yellow-400 ml-2 font-mono">{result.details.feature_name}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Requested State:</span>
                    <span className="ml-2 font-mono">
                      {result.details.requested_is_enabled ? (
                        <span className="text-green-400">true (ENABLED)</span>
                      ) : (
                        <span className="text-red-400">false (DISABLED)</span>
                      )}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Actual New State:</span>
                    <span className="ml-2 font-mono">
                      {result.details.actual_is_enabled ? (
                        <span className="text-green-400">true (ENABLED)</span>
                      ) : (
                        <span className="text-red-400">false (DISABLED)</span>
                      )}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Update Success:</span>
                    <span className="ml-2 font-mono">
                      {result.details.requested_is_enabled === result.details.actual_is_enabled ? (
                        <span className="text-green-400">✓ YES</span>
                      ) : (
                        <span className="text-red-400">✗ NO</span>
                      )}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Rows Affected:</span>
                    <span className="text-blue-400 ml-2 font-mono">{result.details.rows_affected}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">DB Timestamp:</span>
                    <span className="text-purple-400 ml-2 font-mono">
                      {new Date(result.details.database_updated_at).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}

              {result.before && result.after && (
                <div className="mt-4 space-y-3">
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-gray-400 text-sm mb-2">BEFORE Update:</p>
                    <p className="font-mono">
                      <span className="text-cyan-400">{result.before.name}</span>
                      {': '}
                      <span
                        className={
                          result.before.enabled ? 'text-green-400' : 'text-red-400'
                        }
                      >
                        {result.before.enabled ? 'true' : 'false'}
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-gray-400 text-sm mb-2">AFTER Update:</p>
                    <p className="font-mono">
                      <span className="text-cyan-400">{result.after.name}</span>
                      {': '}
                      <span
                        className={
                          result.after.enabled ? 'text-green-400' : 'text-red-400'
                        }
                      >
                        {result.after.enabled ? 'true' : 'false'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && !currentState && (
            <p className="text-gray-400">Click "Get Current State" or "Test Update" to see results</p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-3">How to Use:</h3>
        <ol className="text-gray-300 space-y-2 list-decimal list-inside">
          <li>Click "Get Current State" to see what's in the database right now</li>
          <li>Select a feature (messages, experiments, or reaction_wall)</li>
          <li>Select the new state (ENABLED or DISABLED)</li>
          <li>Click "Test Update" to simulate what happens</li>
          <li>
            Check the results:
            <ul className="ml-8 mt-2 space-y-1">
              <li>
                ✓ <span className="text-green-400">SUCCESS</span> = Database was updated correctly
              </li>
              <li>
                ✗ <span className="text-red-400">FAILED</span> = Update didn't work as expected
              </li>
            </ul>
          </li>
          <li>Verify the values match what you requested</li>
        </ol>
      </div>
    </div>
  )
}
