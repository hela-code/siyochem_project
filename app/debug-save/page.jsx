'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function SaveDebugPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [currentFeatures, setCurrentFeatures] = useState(null)
  const [modifiedFeatures, setModifiedFeatures] = useState(null)
  const [saveResponse, setSaveResponse] = useState(null)
  const [error, setError] = useState(null)

  // Step 1: Load current features
  const loadFeatures = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Step 1: Fetching current features...')
      const { data } = await axios.get('/api/features/status')
      console.log('Response:', data)
      setCurrentFeatures(data.features)
      
      // Create modified version with messages disabled
      const modified = { ...data.features }
      modified.messages = false
      setModifiedFeatures(modified)
      
      setStep(1)
    } catch (err) {
      console.error('Failed to load features:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Send PUT request to save
  const sendSaveRequest = async () => {
    setLoading(true)
    setError(null)
    setSaveResponse(null)
    try {
      console.log('Step 2: Sending PUT request to /api/features/status')
      console.log('Payload:', { features: modifiedFeatures })
      
      const response = await axios.put('/api/features/status', { features: modifiedFeatures })
      
      console.log('PUT Response:', response)
      console.log('Response Data:', response.data)
      console.log('Response Status:', response.status)
      
      setSaveResponse({
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      })
      
      setStep(2)
    } catch (err) {
      console.error('PUT Request Failed:', err)
      console.error('Error Response:', err.response)
      setError({
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      })
      setSaveResponse(err.response?.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (step === 0) {
      loadFeatures()
    }
  }, [step])

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-2">Debug: Teacher Save Flow</h1>
      <p className="text-gray-400 mb-8">Simulates what happens when teacher toggles and saves</p>

      <div className="space-y-6">
        {/* Step 1: Load Current Features */}
        <div className={`p-6 rounded-lg border-2 ${step >= 0 ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Step 1: Load Current Features</h2>
            {step === 0 && loading && <Loader2 className="animate-spin text-blue-400 w-6 h-6" />}
            {step > 0 && !error && <CheckCircle className="text-green-400 w-6 h-6" />}
          </div>

          <p className="text-gray-300 mb-4">Simulating: Teacher visits /teacher-settings</p>

          {currentFeatures && (
            <div className="bg-gray-700 rounded p-4 space-y-3">
              <p className="text-gray-400 font-semibold">Current Features from Database:</p>
              {Object.entries(currentFeatures).map(([name, enabled]) => (
                <div key={name} className="bg-gray-800 p-3 rounded">
                  <p className="font-mono">
                    <span className="text-yellow-400">{name}</span>
                    {': '}
                    <span className={enabled ? 'text-green-400' : 'text-red-400'}>
                      {enabled ? 'true (ENABLED)' : 'false (DISABLED)'}
                    </span>
                  </p>
                </div>
              ))}

              <button
                onClick={sendSaveRequest}
                disabled={loading}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : ''}
                Proceed to Step 2: Send Save Request
              </button>
            </div>
          )}

          {error && !currentFeatures && (
            <div className="bg-red-500/20 border border-red-500 rounded p-4 text-red-300">
              Error loading features: {error}
            </div>
          )}
        </div>

        {/* Step 2: Show What Will Be Sent */}
        {step >= 1 && modifiedFeatures && (
          <div className={`p-6 rounded-lg border-2 ${step >= 1 ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800'}`}>
            <h2 className="text-2xl font-bold text-white mb-4">Step 1.5: Modified Features (What Will Be Sent)</h2>

            <p className="text-gray-300 mb-4">Simulating: Teacher clicks toggle for "Lab Notes" to disable it</p>

            <div className="bg-gray-700 rounded p-4 space-y-3">
              <p className="text-gray-400 font-semibold">Features to be sent in PUT request:</p>
              {Object.entries(modifiedFeatures).map(([name, enabled]) => {
                const changed = currentFeatures?.[name] !== enabled
                return (
                  <div key={name} className={`p-3 rounded ${changed ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-gray-800'}`}>
                    <p className="font-mono">
                      <span className="text-yellow-400">{name}</span>
                      {': '}
                      <span className={enabled ? 'text-green-400' : 'text-red-400'}>
                        {enabled ? 'true (ENABLED)' : 'false (DISABLED)'}
                      </span>
                      {changed && <span className="ml-2 text-orange-400">← CHANGED</span>}
                    </p>
                  </div>
                )
              })}

              <div className="bg-gray-800 p-3 rounded mt-4">
                <p className="text-gray-400 text-sm mb-2">Exact request body:</p>
                <pre className="text-green-400 text-xs overflow-auto">
{`PUT /api/features/status HTTP/1.1
Content-Type: application/json

{
  "features": {
    "experiments": ${modifiedFeatures.experiments},
    "messages": ${modifiedFeatures.messages},
    "reaction_wall": ${modifiedFeatures.reaction_wall}
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Save Response */}
        {step >= 2 && (
          <div className={`p-6 rounded-lg border-2 ${saveResponse?.data?.success ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Step 2: Save Response</h2>
              {saveResponse?.data?.success ? (
                <CheckCircle className="text-green-400 w-6 h-6" />
              ) : (
                <AlertCircle className="text-red-400 w-6 h-6" />
              )}
            </div>

            <p className="text-gray-300 mb-4">Simulating: Teacher clicks "Save Settings"</p>

            {saveResponse && (
              <div className="bg-gray-700 rounded p-4 space-y-4">
                <div>
                  <p className="text-gray-400 font-semibold mb-2">HTTP Status Code:</p>
                  <p className={`font-mono text-lg ${saveResponse.status === 200 ? 'text-green-400' : 'text-red-400'}`}>
                    {saveResponse.status} {saveResponse.statusText}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 font-semibold mb-2">Response Body:</p>
                  <pre className={`p-3 rounded font-mono text-sm overflow-auto ${
                    saveResponse.data?.success ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                  }`}>
                    {JSON.stringify(saveResponse.data, null, 2)}
                  </pre>
                </div>

                {saveResponse.data?.success ? (
                  <div className="bg-green-500/20 border border-green-500 rounded p-4">
                    <p className="text-green-400 font-bold">✓ Update Successful!</p>
                    <p className="text-green-300 text-sm mt-1">
                      The database should now show messages = false
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-500/20 border border-red-500 rounded p-4">
                    <p className="text-red-400 font-bold">✗ Update Failed</p>
                    <p className="text-red-300 text-sm mt-1">
                      {saveResponse.data?.message || 'Check browser console for details'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded p-4 mt-4">
                <p className="text-red-400 font-bold mb-2">Request Error:</p>
                <div className="text-red-300 text-sm space-y-1">
                  <p>Message: {error.message}</p>
                  {error.status && <p>Status: {error.status}</p>}
                  {error.statusText && <p>Status Text: {error.statusText}</p>}
                  {error.data && (
                    <div className="mt-2">
                      <p>Response Data:</p>
                      <pre className="bg-gray-800 p-2 rounded text-xs overflow-auto mt-1">
                        {JSON.stringify(error.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Verification */}
        {step >= 2 && saveResponse?.data?.success && (
          <div className="p-6 rounded-lg border-2 border-blue-500 bg-blue-500/10">
            <h2 className="text-2xl font-bold text-white mb-4">Step 3: Verify Database Updated</h2>
            
            <div className="bg-blue-900/30 border border-blue-500/50 rounded p-4">
              <p className="text-blue-300 mb-3">To verify the database was updated:</p>
              <ol className="text-blue-300 space-y-2 list-decimal list-inside">
                <li>Visit <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400">/api/features/status</code></li>
                <li>Should show: <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400">"messages": false</code></li>
                <li>New student login should see "Lab Notes" disabled</li>
              </ol>
            </div>
          </div>
        )}

        {/* Debug Instructions */}
        <div className="p-6 rounded-lg border-2 border-gray-700 bg-gray-800">
          <h3 className="text-lg font-bold text-white mb-3">🔍 Debug Instructions:</h3>
          <ol className="text-gray-300 space-y-2 list-decimal list-inside">
            <li>Open browser DevTools (F12) → Console tab</li>
            <li>This page will log every step</li>
            <li>Look for "Step 1: Fetching..." and "Step 2: Sending PUT..." messages</li>
            <li>If there's an error, it will show in the Response section</li>
            <li>All HTTP request/response details are logged to console</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
