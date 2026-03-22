'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function FeatureDebug() {
  const [dbStatus, setDbStatus] = useState(null)
  const [apiStatus, setApiStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkDatabaseAndAPI = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check database
        console.log('Checking database...')
        const dbRes = await axios.get('/api/debug/database')
        console.log('Database response:', dbRes.data)
        setDbStatus(dbRes.data)

        // Check API
        console.log('Checking API features...')
        const apiRes = await axios.get('/api/features/status')
        console.log('API response:', apiRes.data)
        setApiStatus(apiRes.data)
      } catch (err) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkDatabaseAndAPI()
  }, [])

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Feature System Debug</h1>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-8">
          <p className="font-bold">ERROR:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Database Status */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Database Status</h2>
          {dbStatus ? (
            <>
              <div className={`mb-4 p-3 rounded ${dbStatus.status === 'OK' ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
                <p className={dbStatus.status === 'OK' ? 'text-green-400' : 'text-red-400'}>
                  Status: <strong>{dbStatus.status}</strong>
                </p>
                <p className="text-gray-300 mt-2">{dbStatus.message}</p>
              </div>

              {dbStatus.database && (
                <>
                  <h3 className="text-lg font-semibold text-blue-400 mt-6 mb-3">Features in Database:</h3>
                  <div className="space-y-2">
                    {dbStatus.database.features.map((f, idx) => (
                      <div key={idx} className="bg-gray-700 p-3 rounded">
                        <p className="font-mono text-sm">
                          <span className="text-yellow-400">{f.feature_name}</span>
                          {' '}: <span className={f.is_enabled ? 'text-green-400' : 'text-red-400'}>
                            {f.is_enabled ? '✓ ENABLED' : '✗ DISABLED'}
                          </span>
                        </p>
                        <p className="text-gray-400 text-xs mt-1">Updated: {new Date(f.updated_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-blue-400 mt-6 mb-3">Users:</h3>
                  <div className="bg-gray-700 p-3 rounded text-sm">
                    <p className="text-gray-300">Total: {dbStatus.database.users.total}</p>
                    <p className="text-gray-300">Teachers: {dbStatus.database.users.teachers}</p>
                    <p className="text-gray-300">Students: {dbStatus.database.users.students}</p>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-gray-400">No database data</p>
          )}
        </div>

        {/* API Status */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">API Response</h2>
          {apiStatus ? (
            <>
              <div className={`mb-4 p-3 rounded ${apiStatus.success ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
                <p className={apiStatus.success ? 'text-green-400' : 'text-red-400'}>
                  Status: <strong>{apiStatus.success ? 'SUCCESS' : 'FAILED'}</strong>
                </p>
              </div>

              {apiStatus.features && (
                <>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Returned Features:</h3>
                  <div className="space-y-2">
                    {Object.entries(apiStatus.features).map(([name, enabled]) => (
                      <div key={name} className="bg-gray-700 p-3 rounded">
                        <p className="font-mono text-sm">
                          <span className="text-yellow-400">{name}</span>
                          {' '}: <span className={enabled ? 'text-green-400' : 'text-red-400'}>
                            {enabled ? '✓ ENABLED' : '✗ DISABLED'}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-6 p-3 bg-gray-700 rounded">
                <p className="text-gray-400 text-xs font-mono">
                  <pre>{JSON.stringify(apiStatus, null, 2)}</pre>
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-400">No API data</p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-3">What to do next:</h3>
        <ol className="text-gray-300 space-y-2 list-decimal list-inside">
          <li>Check the "Database Status" section - verify the table exists and has the 3 features</li>
          <li>Check the "API Response" section - verify it returns the same feature status</li>
          <li>If database shows ENABLED but you want DISABLED, go to <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400">/teacher-settings</code> and toggle</li>
          <li>Refresh this page to see updated values</li>
          <li>Check browser console (F12 → Console) for detailed logs</li>
        </ol>
      </div>
    </div>
  )
}
