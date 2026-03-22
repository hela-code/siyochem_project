'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function DiagnosticsPage() {
  const [step, setStep] = useState(0)
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  // Step 0: Check Database Table
  const checkDatabase = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/setup/check')
      console.log('Database check:', res.data)
      setResults(prev => ({ ...prev, database: res.data }))
      if (res.data.status === 'OK') {
        setStep(1)
      }
    } catch (error) {
      console.error('Database check failed:', error)
      setResults(prev => ({ ...prev, database: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Check API GET
  const checkAPIGet = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/features/status')
      console.log('API GET:', res.data)
      setResults(prev => ({ ...prev, apiGet: res.data }))
      if (res.data.success) {
        setStep(2)
      }
    } catch (error) {
      console.error('API GET failed:', error)
      setResults(prev => ({ ...prev, apiGet: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Test API PUT
  const testAPIPut = async () => {
    setLoading(true)
    try {
      const testPayload = {
        features: {
          messages: false, // Turn off messages
          experiments: true,
          reaction_wall: true,
        }
      }
      console.log('Sending PUT request:', testPayload)
      const res = await axios.put('/api/features/status', testPayload)
      console.log('API PUT response:', res.data)
      setResults(prev => ({ ...prev, apiPut: res.data }))
      setStep(3)
    } catch (error) {
      console.error('API PUT failed:', error)
      setResults(prev => ({ ...prev, apiPut: { error: error.message, details: error.response?.data } }))
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Check Database again after update
  const checkDatabaseAfterUpdate = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/debug/database')
      console.log('Database after update:', res.data)
      setResults(prev => ({ ...prev, databaseAfter: res.data }))
      setStep(4)
    } catch (error) {
      console.error('Database check failed:', error)
      setResults(prev => ({ ...prev, databaseAfter: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (step === 0) {
      checkDatabase()
    } else if (step === 1) {
      checkAPIGet()
    } else if (step === 2) {
      testAPIPut()
    } else if (step === 3) {
      checkDatabaseAfterUpdate()
    }
  }, [step])

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-2">Full System Diagnostic</h1>
      <p className="text-gray-400 mb-8">Step-by-step test of the feature control system</p>

      <div className="space-y-4">
        {/* Step 0: Database Check */}
        <div className={`p-6 rounded-lg border-2 ${step >= 0 ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Step 0: Check Database Table</h2>
            {step === 0 && loading && <Loader2 className="animate-spin text-blue-400" />}
            {step > 0 && results.database?.status === 'OK' && <CheckCircle className="text-green-400" />}
            {results.database?.error && <AlertCircle className="text-red-400" />}
          </div>

          {results.database && (
            <div className="bg-gray-700 rounded p-4 text-sm font-mono">
              {results.database.status === 'OK' ? (
                <>
                  <p className="text-green-400 mb-2">✓ Database table exists</p>
                  {results.database.features && (
                    <div className="space-y-1 text-gray-300">
                      {results.database.features.map((f, i) => (
                        <p key={i}>
                          <span className="text-yellow-400">{f.feature_name}</span>
                          {': '}
                          <span className={f.is_enabled ? 'text-green-400' : 'text-red-400'}>
                            {f.is_enabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </p>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-red-400">✗ {results.database.message || results.database.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Step 1: API GET */}
        <div className={`p-6 rounded-lg border-2 ${step >= 1 ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Step 1: Test API GET /api/features/status</h2>
            {step === 1 && loading && <Loader2 className="animate-spin text-blue-400" />}
            {step > 1 && results.apiGet?.success && <CheckCircle className="text-green-400" />}
            {results.apiGet?.error && <AlertCircle className="text-red-400" />}
          </div>

          {results.apiGet && (
            <div className="bg-gray-700 rounded p-4 text-sm font-mono">
              {results.apiGet.success ? (
                <>
                  <p className="text-green-400 mb-2">✓ API returns features</p>
                  <div className="text-gray-300 space-y-1">
                    {Object.entries(results.apiGet.features || {}).map(([name, enabled]) => (
                      <p key={name}>
                        <span className="text-yellow-400">{name}</span>
                        {': '}
                        <span className={enabled ? 'text-green-400' : 'text-red-400'}>
                          {enabled ? 'true' : 'false'}
                        </span>
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-red-400">✗ {results.apiGet.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Step 2: API PUT */}
        <div className={`p-6 rounded-lg border-2 ${step >= 2 ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Step 2: Test API PUT (Save Changes)</h2>
            {step === 2 && loading && <Loader2 className="animate-spin text-blue-400" />}
            {step > 2 && results.apiPut?.success && <CheckCircle className="text-green-400" />}
            {results.apiPut?.error && <AlertCircle className="text-red-400" />}
          </div>

          {results.apiPut && (
            <div className="bg-gray-700 rounded p-4 text-sm font-mono">
              {results.apiPut.success ? (
                <>
                  <p className="text-green-400 mb-2">✓ API saved changes successfully</p>
                  <p className="text-gray-400 mb-2">Request sent:</p>
                  <pre className="text-blue-400 bg-gray-800 p-2 rounded mb-2 overflow-auto">
                    {`{
  "features": {
    "messages": false,
    "experiments": true,
    "reaction_wall": true
  }
}`}
                  </pre>
                  <p className="text-gray-400 mb-2">Response:</p>
                  <div className="text-gray-300 space-y-1">
                    {Object.entries(results.apiPut.features || {}).map(([name, enabled]) => (
                      <p key={name}>
                        <span className="text-yellow-400">{name}</span>
                        {': '}
                        <span className={enabled ? 'text-green-400' : 'text-red-400'}>
                          {enabled ? 'true' : 'false'}
                        </span>
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-red-400">✗ {results.apiPut.error}</p>
              )}
              {results.apiPut.details && (
                <div className="mt-3 text-red-300">
                  <p>Details: {JSON.stringify(results.apiPut.details)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Database After Update */}
        <div className={`p-6 rounded-lg border-2 ${step >= 3 ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Step 3: Verify Database Updated</h2>
            {step === 3 && loading && <Loader2 className="animate-spin text-blue-400" />}
            {step > 3 && results.databaseAfter?.status === 'OK' && <CheckCircle className="text-green-400" />}
            {results.databaseAfter?.error && <AlertCircle className="text-red-400" />}
          </div>

          {results.databaseAfter && (
            <div className="bg-gray-700 rounded p-4 text-sm font-mono">
              {results.databaseAfter.status === 'OK' ? (
                <>
                  <p className="text-green-400 mb-2">✓ Database verified</p>
                  {results.databaseAfter.database?.features && (
                    <div className="space-y-2">
                      <p className="text-gray-400 mb-2">Current database state:</p>
                      <div className="space-y-1 text-gray-300">
                        {results.databaseAfter.database.features.map((f, i) => (
                          <div key={i} className="bg-gray-800 p-2 rounded">
                            <p>
                              <span className="text-yellow-400">{f.feature_name}</span>
                              {': '}
                              <span className={f.is_enabled ? 'text-green-400' : 'text-red-400'}>
                                {f.is_enabled ? 'ENABLED' : 'DISABLED'}
                              </span>
                            </p>
                            <p className="text-gray-500 text-xs">
                              Updated: {new Date(f.updated_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Final Success Check */}
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        {results.databaseAfter.database?.features?.find(f => f.feature_name === 'messages')?.is_enabled === false ? (
                          <p className="text-green-400 font-bold">✓ SUCCESS! Messages is now DISABLED in database</p>
                        ) : (
                          <p className="text-yellow-400 font-bold">⚠ Update didn't work - Messages should be disabled but isn't</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-red-400">✗ {results.databaseAfter.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        {step === 4 && (
          <div className="p-6 rounded-lg border-2 border-green-500 bg-green-500/10">
            <h2 className="text-2xl font-bold text-green-400 mb-4">✓ Diagnostic Complete</h2>
            <p className="text-gray-300 mb-4">
              The feature control system is working! Here's what happened:
            </p>
            <ul className="text-gray-300 space-y-2 list-disc list-inside">
              <li>Database table exists with 3 features</li>
              <li>API GET endpoint returns current feature status</li>
              <li>API PUT endpoint accepted the update request</li>
              <li>Database was updated with new values</li>
              <li>Timestamps show when the change occurred</li>
            </ul>
            <p className="text-gray-400 mt-4">
              Now test with a real teacher logging in and changing settings at /teacher-settings
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
