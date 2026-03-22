'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function TeacherSaveTest() {
  const [features, setFeatures] = useState({
    messages: true,
    experiments: true,
    reaction_wall: true,
  })
  const [loading, setLoading] = useState(false)
  const [saveResult, setSaveResult] = useState(null)
  const [error, setError] = useState(null)
  const [dbState, setDbState] = useState(null)

  // Load current features from database
  const loadFromDB = async () => {
    try {
      const { data } = await axios.get('/api/features/status')
      setFeatures(data.features)
      setDbState(data.features)
      console.log('✓ Loaded from database:', data.features)
    } catch (err) {
      console.error('Failed to load from database:', err)
    }
  }

  // Toggle a feature
  const handleToggle = (key) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Save features (exactly like teacher-settings does)
  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSaveResult(null)

    try {
      console.log('=== SIMULATING TEACHER SAVE ===')
      console.log('Features to save:', features)
      
      const { data } = await axios.put('/api/features/status', { features })

      console.log('PUT Response:', data)
      setSaveResult(data)

      if (data.success) {
        console.log('✓ Save success! Database features:', data.features)
        // In real app, this would update local state
        setFeatures(data.features)
        setDbState(data.features)
      } else {
        console.error('✗ Save returned error:', data.message)
        setError(data.message)
      }
    } catch (err) {
      console.error('✗ Save failed:', err)
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Check database state after save
  const checkDB = async () => {
    try {
      console.log('Checking database state...')
      const { data } = await axios.get('/api/features/status')
      setDbState(data.features)
      console.log('✓ Database state:', data.features)
    } catch (err) {
      console.error('Failed to check database:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-2">Teacher Save Test</h1>
      <p className="text-gray-400 mb-8">Simulates the teacher-settings save workflow</p>

      <div className="grid grid-cols-2 gap-8">
        {/* Left: Controls */}
        <div className="space-y-6">
          {/* Load Button */}
          <button
            onClick={loadFromDB}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition"
          >
            1. Load Current Features
          </button>

          {/* Feature Toggles */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white font-bold mb-4">2. Toggle Features:</h3>
            <div className="space-y-3">
              {Object.entries(features).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleToggle(key)}
                  className={`w-full p-3 rounded font-semibold transition flex items-center justify-between ${
                    value
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <span className="capitalize">{key.replace('_', ' ')}</span>
                  <span>{value ? '✓ ON' : '✗ OFF'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin w-5 h-5" />}
            3. Save Settings
          </button>

          {/* Check DB Button */}
          <button
            onClick={checkDB}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-4 rounded transition"
          >
            4. Check Database (After 5s Refresh)
          </button>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          {/* Local State */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white font-bold mb-3">Local State (UI):</h3>
            <div className="space-y-2 text-sm font-mono">
              {Object.entries(features).map(([key, value]) => (
                <p key={key} className="text-gray-300">
                  {key}: <span className={value ? 'text-green-400' : 'text-red-400'}>{String(value)}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Database State */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white font-bold mb-3">Database State:</h3>
            {dbState ? (
              <div className="space-y-2 text-sm font-mono">
                {Object.entries(dbState).map(([key, value]) => (
                  <p key={key} className="text-gray-300">
                    {key}: <span className={value ? 'text-green-400' : 'text-red-400'}>{String(value)}</span>
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Click "Load" to fetch</p>
            )}
          </div>

          {/* Save Result */}
          {saveResult && (
            <div className={`rounded-lg p-4 border ${saveResult.success ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
              <h4 className={`font-bold mb-2 ${saveResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {saveResult.success ? '✓ Save Response' : '✗ Save Failed'}
              </h4>
              <p className="text-sm text-gray-300 mb-2">{saveResult.message}</p>
              {saveResult.features && (
                <div className="text-xs font-mono text-gray-400">
                  <p>Features returned: {JSON.stringify(saveResult.features)}</p>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg p-4 border border-red-500 bg-red-500/10">
              <h4 className="font-bold mb-2 text-red-400">✗ Error</h4>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Status Match */}
          {dbState && features && (
            <div className={`rounded-lg p-4 border-2 ${
              JSON.stringify(dbState) === JSON.stringify(features)
                ? 'border-green-500 bg-green-500/10'
                : 'border-yellow-500 bg-yellow-500/10'
            }`}>
              <p className={JSON.stringify(dbState) === JSON.stringify(features) ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>
                {JSON.stringify(dbState) === JSON.stringify(features)
                  ? '✓ Local and Database match!'
                  : '⚠ Local and Database DO NOT match'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-900/20 rounded-lg p-6 border border-blue-500/30">
        <h3 className="text-blue-300 font-bold mb-2">Instructions:</h3>
        <ol className="text-blue-300 space-y-1 list-decimal list-inside text-sm">
          <li>Click "Load Current Features" to fetch what's in the database</li>
          <li>Toggle one or more features OFF</li>
          <li>Click "Save Settings" to send the update</li>
          <li>Check the console (F12) for detailed logs</li>
          <li>Wait 5 seconds (simulating navbar refresh)</li>
          <li>Click "Check Database" to see the current database state</li>
          <li>Compare Local State vs Database State</li>
        </ol>
      </div>
    </div>
  )
}
