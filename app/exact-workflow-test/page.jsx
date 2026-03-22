'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Loader2, CheckCircle, AlertCircle, RotateCw } from 'lucide-react'

export default function ExactWorkflowDebug() {
  const [log, setLog] = useState([])
  const [features, setFeatures] = useState(null)
  const [testRunning, setTestRunning] = useState(false)

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
    setLog(prev => [...prev, {
      message,
      type,
      timestamp
    }])
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`)
  }

  const runTest = async () => {
    setTestRunning(true)
    setLog([])
    setFeatures(null)

    try {
      // Step 1: Load features
      addLog('STEP 1: Loading current features from database...', 'step')
      const loadResponse = await axios.get('/api/features/status')
      const initialFeatures = loadResponse.data.features
      setFeatures(initialFeatures)
      addLog(`Initial state: experiments=${initialFeatures.experiments}, messages=${initialFeatures.messages}, reaction_wall=${initialFeatures.reaction_wall}`, 'success')
      
      // Step 2: Toggle reaction_wall
      addLog('', 'info')
      addLog('STEP 2: Toggling reaction_wall OFF (like user clicking button)...', 'step')
      const modifiedFeatures = {
        ...initialFeatures,
        reaction_wall: false // Toggle OFF
      }
      addLog(`Local state changed: reaction_wall = false`, 'info')
      
      // Step 3: Save using PUT
      addLog('', 'info')
      addLog('STEP 3: Sending PUT request to save (clicking Save button)...', 'step')
      addLog(`Sending: {features: {experiments: ${modifiedFeatures.experiments}, messages: ${modifiedFeatures.messages}, reaction_wall: ${modifiedFeatures.reaction_wall}}}`, 'info')
      
      const saveResponse = await axios.put('/api/features/status', { features: modifiedFeatures })
      addLog(`PUT Response: success=${saveResponse.data.success}`, 'success')
      addLog(`Server says features are now: experiments=${saveResponse.data.features.experiments}, messages=${saveResponse.data.features.messages}, reaction_wall=${saveResponse.data.features.reaction_wall}`, 'success')
      
      // Step 4: Check database immediately
      addLog('', 'info')
      addLog('STEP 4: Checking database IMMEDIATELY after save...', 'step')
      const check1Response = await axios.get('/api/features/status')
      const check1Features = check1Response.data.features
      addLog(`Database CHECK 1: experiments=${check1Features.experiments}, messages=${check1Features.messages}, reaction_wall=${check1Features.reaction_wall}`, 
        check1Features.reaction_wall === false ? 'success' : 'error')
      
      if (check1Features.reaction_wall === false) {
        addLog('✓ Database was updated correctly!', 'success')
      } else {
        addLog('✗ ERROR: reaction_wall reverted back to TRUE!', 'error')
      }
      
      // Step 5: Wait 5 seconds (simulating navbar polling)
      addLog('', 'info')
      addLog('STEP 5: Waiting 5 seconds (simulating navbar auto-refresh)...', 'step')
      for (let i = 5; i > 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        addLog(`${i} seconds remaining...`, 'info')
      }
      
      // Step 6: Check database after 5 seconds
      addLog('', 'info')
      addLog('STEP 6: Checking database AFTER 5 seconds (like navbar fetch would)...', 'step')
      const check2Response = await axios.get('/api/features/status')
      const check2Features = check2Response.data.features
      addLog(`Database CHECK 2: experiments=${check2Features.experiments}, messages=${check2Features.messages}, reaction_wall=${check2Features.reaction_wall}`,
        check2Features.reaction_wall === false ? 'success' : 'error')
      
      if (check2Features.reaction_wall === false) {
        addLog('✓ Database still has correct value!', 'success')
        addLog('✓✓✓ TEST PASSED - Feature toggles are working correctly!', 'success')
      } else {
        addLog('✗✗✗ ERROR: reaction_wall changed back to TRUE after 5 seconds!', 'error')
        addLog('This is the bug the user is experiencing!', 'error')
      }
      
      setFeatures(check2Features)

    } catch (error) {
      addLog(`ERROR: ${error.message}`, 'error')
      if (error.response) {
        addLog(`Response status: ${error.response.status}`, 'error')
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error')
      }
    } finally {
      setTestRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-2">Exact User Workflow Test</h1>
      <p className="text-gray-400 mb-8">Simulates: Load → Toggle OFF → Save → Wait 5s → Check if OFF still</p>

      <button
        onClick={runTest}
        disabled={testRunning}
        className="mb-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded flex items-center gap-2 transition"
      >
        {testRunning && <Loader2 className="animate-spin w-5 h-5" />}
        {testRunning ? 'Test Running... (45 seconds)' : 'Run Complete Workflow Test'}
      </button>

      {/* Log Display */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8 max-h-[600px] overflow-y-auto font-mono text-sm">
        {log.length === 0 ? (
          <p className="text-gray-500">Click button to start test...</p>
        ) : (
          log.map((entry, idx) => (
            <div key={idx} className={`mb-2 ${
              entry.type === 'error' ? 'text-red-400' :
              entry.type === 'success' ? 'text-green-400' :
              entry.type === 'step' ? 'text-cyan-400 font-bold' :
              'text-gray-300'
            }`}>
              {entry.timestamp && <span className="text-gray-500">[{entry.timestamp}] </span>}
              {entry.message}
            </div>
          ))
        )}
      </div>

      {/* Final State */}
      {features && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-white font-bold mb-4">Final Database State:</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(features).map(([name, enabled]) => (
              <div key={name} className={`p-4 rounded ${
                enabled ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'
              }`}>
                <p className="text-white font-semibold capitalize">{name.replace('_', ' ')}</p>
                <p className={enabled ? 'text-green-400 text-xl font-bold' : 'text-red-400 text-xl font-bold'}>
                  {enabled ? '✓ ON' : '✗ OFF'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-blue-900/20 rounded-lg p-6 border border-blue-500/30">
        <h3 className="text-blue-300 font-bold mb-2">What This Test Does:</h3>
        <ol className="text-blue-300 space-y-1 list-decimal list-inside text-sm">
          <li>Loads current features from database</li>
          <li>Toggles reaction_wall to OFF (like teacher clicking button)</li>
          <li>Sends PUT request to save (like teacher clicking Save)</li>
          <li>Checks database IMMEDIATELY - should be OFF</li>
          <li>Waits 5 seconds (navbar polling interval)</li>
          <li>Checks database AGAIN - should STILL be OFF</li>
          <li>Reports if the bug exists (value reverting back to ON)</li>
        </ol>
      </div>
    </div>
  )
}
