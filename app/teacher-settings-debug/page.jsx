'use client'

import { useState, useEffect } from 'react'

export default function TeacherSettingsDebug() {
  const [features, setFeatures] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastSaveResult, setLastSaveResult] = useState(null)
  const [pollData, setPollData] = useState([])

  useEffect(() => {
    // Load features
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

  async function handleSave() {
    if (!features) return

    setLoading(true)
    setLastSaveResult(null)
    setPollData([])

    try {
      console.log('Sending PUT with features:', features)
      const res = await fetch('/api/features/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features })
      })

      const data = await res.json()
      console.log('PUT Response:', data)

      // Record immediate response
      setPollData(current => [...current, {
        time: 'Immediate (PUT response)',
        reaction_wall: data.features.reaction_wall,
        source: 'API Response'
      }])

      // Update local state
      setFeatures(data.features)
      setLastSaveResult({
        success: true,
        response: data.features
      })

      // Poll after 100ms
      await new Promise(r => setTimeout(r, 100))
      const verify1 = await fetch('/api/features/status')
      const verify1Data = await verify1.json()
      setPollData(current => [...current, {
        time: '100ms',
        reaction_wall: verify1Data.features.reaction_wall,
        source: 'GET poll'
      }])

      // Poll after 500ms
      await new Promise(r => setTimeout(r, 400))
      const verify2 = await fetch('/api/features/status')
      const verify2Data = await verify2.json()
      setPollData(current => [...current, {
        time: '500ms',
        reaction_wall: verify2Data.features.reaction_wall,
        source: 'GET poll'
      }])

      // Poll after 1s
      await new Promise(r => setTimeout(r, 500))
      const verify3 = await fetch('/api/features/status')
      const verify3Data = await verify3.json()
      setPollData(current => [...current, {
        time: '1000ms',
        reaction_wall: verify3Data.features.reaction_wall,
        source: 'GET poll'
      }])

    } catch (err) {
      console.error('Error:', err)
      setLastSaveResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (!features) return <div className="p-4">Loading...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Teacher Settings Debug</h1>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Features</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(features).map(([key, value]) => (
            <div key={key} className="bg-white p-4 rounded border">
              <p className="text-sm text-gray-600 font-semibold">{key}</p>
              <p className={`text-2xl font-bold ${value ? 'text-green-600' : 'text-red-600'}`}>
                {value ? 'ON' : 'OFF'}
              </p>
              <button
                onClick={() => setFeatures(f => ({ ...f, [key]: !f[key] }))}
                className="mt-2 w-full px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Toggle
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 mb-6"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {lastSaveResult && (
        <div
          className={`mb-6 p-4 rounded-lg border-2 ${
            lastSaveResult.error
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <h3 className="font-bold text-lg mb-2">
            {lastSaveResult.error ? '❌ Save Failed' : '✅ Save Successful'}
          </h3>
          {lastSaveResult.error && <p className="text-red-600">{lastSaveResult.error}</p>}
          {lastSaveResult.response && (
            <pre className="bg-white p-3 rounded text-sm overflow-auto">
              {JSON.stringify(lastSaveResult.response, null, 2)}
            </pre>
          )}
        </div>
      )}

      {pollData.length > 0 && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-bold text-lg mb-4">Post-Save Poll Results</h3>
          <div className="space-y-3">
            {pollData.map((poll, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{poll.time}</span>
                  <span className={`text-lg font-bold ${poll.reaction_wall ? 'text-green-600' : 'text-red-600'}`}>
                    reaction_wall = {poll.reaction_wall ? 'TRUE' : 'FALSE'} <span className="text-xs text-gray-500">({poll.source})</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
