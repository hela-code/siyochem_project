'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function FeatureControlTest() {
  const [features, setFeatures] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [results, setResults] = useState([])

  // Load features
  const loadFeatures = async () => {
    try {
      setLoading(true)
      setMessage('')
      const { data } = await axios.get('/api/features/status')
      setFeatures(data.features)
      return data.features
    } catch (error) {
      setMessage(`Error loading features: ${error.message}`)
      console.error(error)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Toggle a feature
  const toggleFeature = async (featureName) => {
    if (!features) return
    
    const newState = {
      ...features,
      [featureName]: !features[featureName]
    }

    try {
      setLoading(true)
      setMessage('Saving...')
      
      const { data } = await axios.put('/api/features/status', { features: newState })
      
      if (data.success) {
        setFeatures(data.features)
        setMessage(`✓ ${featureName} updated successfully!`)
        setResults(prev => [...prev, {
          action: `Toggled ${featureName} to ${newState[featureName]}`,
          status: 'success',
          time: new Date().toLocaleTimeString()
        }])
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.response?.data?.message || error.message}`)
      setResults(prev => [...prev, {
        action: `Failed to toggle ${featureName}`,
        status: 'error',
        time: new Date().toLocaleTimeString()
      }])
    } finally {
      setLoading(false)
    }
  }

  // Verify database state
  const verifyDatabase = async () => {
    try {
      setLoading(true)
      setMessage('Checking database...')
      
      const { data } = await axios.get('/api/features/status')
      
      const diffs = []
      Object.entries(data.features).forEach(([name, value]) => {
        if (features[name] !== value) {
          diffs.push(`${name}: local=${features[name]}, db=${value}`)
        }
      })
      
      if (diffs.length === 0) {
        setMessage('✓ Database matches local state perfectly!')
        setResults(prev => [...prev, {
          action: 'Database verification',
          status: 'success',
          time: new Date().toLocaleTimeString(),
          detail: 'All features match'
        }])
      } else {
        setMessage('⚠ Database mismatch detected!')
        setResults(prev => [...prev, {
          action: 'Database verification',
          status: 'warning',
          time: new Date().toLocaleTimeString(),
          detail: diffs.join('; ')
        }])
      }
    } catch (error) {
      setMessage(`✗ Verification error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadFeatures()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-2">Feature Control System</h1>
      <p className="text-gray-400 mb-8">Test and control features that students can see</p>

      {/* Status Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.startsWith('✓') ? 'bg-green-500/20 border border-green-500 text-green-300' :
          message.startsWith('✗') ? 'bg-red-500/20 border border-red-500 text-red-300' :
          message.startsWith('⚠') ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-300' :
          'bg-blue-500/20 border border-blue-500 text-blue-300'
        }`}>
          {message}
        </div>
      )}

      {/* Feature Controls */}
      {features && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(features).map(([name, enabled]) => (
            <div
              key={name}
              className={`rounded-lg p-6 border-2 transition ${
                enabled
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-red-500 bg-red-500/10'
              }`}
            >
              <h3 className="text-white font-bold mb-2 capitalize">
                {name.replace('_', ' ')}
              </h3>
              
              <p className={`text-lg font-bold mb-4 ${enabled ? 'text-green-400' : 'text-red-400'}`}>
                {enabled ? '✓ ENABLED' : '✗ DISABLED'}
              </p>
              
              <button
                onClick={() => toggleFeature(name)}
                disabled={loading}
                className={`w-full py-2 px-4 rounded font-semibold transition flex items-center justify-center gap-2 ${
                  enabled
                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white'
                    : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white'
                }`}
              >
                {loading && <Loader2 className="animate-spin w-4 h-4" />}
                {enabled ? 'Click to DISABLE' : 'Click to ENABLE'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={loadFeatures}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          Refresh from Database
        </button>

        <button
          onClick={verifyDatabase}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          Verify Database
        </button>
      </div>

      {/* Action History */}
      {results.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-white font-bold mb-4">Action History:</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`p-3 rounded text-sm ${
                  result.status === 'success'
                    ? 'bg-green-900/30 border-l-4 border-green-500 text-green-300'
                    : result.status === 'error'
                    ? 'bg-red-900/30 border-l-4 border-red-500 text-red-300'
                    : 'bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-300'
                }`}
              >
                <p className="font-mono text-xs text-gray-400">{result.time}</p>
                <p className="font-semibold">{result.action}</p>
                {result.detail && <p className="text-xs mt-1">{result.detail}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-blue-900/20 rounded-lg p-6 border border-blue-500/30">
        <h3 className="text-blue-300 font-bold mb-3">How It Works:</h3>
        <ol className="text-blue-300 space-y-2 list-decimal list-inside text-sm">
          <li>Click any button to enable/disable a feature</li>
          <li>The change is saved immediately to the database</li>
          <li>Students' next page load will show the updated state</li>
          <li>Use "Verify Database" to confirm changes are saved</li>
          <li>Use "Refresh from Database" to reload the current state</li>
        </ol>
      </div>
    </div>
  )
}
