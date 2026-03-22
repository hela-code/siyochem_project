'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function SimpleSaveTest() {
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState([])
  const [result, setResult] = useState(null)

  const addLog = (msg, level = 'info') => {
    setLog(prev => [...prev, { msg, level, time: new Date().toLocaleTimeString() }])
    console.log(`[${level}]`, msg)
  }

  const testSave = async () => {
    setLoading(true)
    setLog([])
    setResult(null)

    try {
      addLog('Step 1: Get current state', 'info')
      const getResp1 = await axios.get('/api/features/status')
      const current = getResp1.data.features
      addLog(`📊 Current: experiments=${current.experiments}, messages=${current.messages}, reaction_wall=${current.reaction_wall}`, 'success')

      addLog('', 'info')
      addLog('Step 2: Send PUT to toggle reaction_wall', 'info')
      const newState = {
        ...current,
        reaction_wall: !current.reaction_wall  // Toggle it
      }
      addLog(`📤 Sending: reaction_wall=${newState.reaction_wall}`, 'info')

      const putResp = await axios.put('/api/features/status', { features: newState })
      addLog(`✓ PUT Response: reaction_wall=${putResp.data.features.reaction_wall}`, 
        putResp.data.features.reaction_wall === newState.reaction_wall ? 'success' : 'error')

      addLog('', 'info')
      addLog('Step 3: Check database IMMEDIATELY', 'info')
      const getResp2 = await axios.get('/api/features/status')
      const after = getResp2.data.features
      addLog(`📊 Database now shows: reaction_wall=${after.reaction_wall}`, 
        after.reaction_wall === newState.reaction_wall ? 'success' : 'error')

      addLog('', 'info')
      addLog('Step 4: Analysis', 'info')
      
      const putSaysCorrect = putResp.data.features.reaction_wall === newState.reaction_wall
      const dbHasCorrect = after.reaction_wall === newState.reaction_wall
      const bothMatch = putResp.data.features.reaction_wall === after.reaction_wall

      addLog(`PUT response: ${putSaysCorrect ? '✓ CORRECT' : '✗ WRONG'}`, putSaysCorrect ? 'success' : 'error')
      addLog(`Database state: ${dbHasCorrect ? '✓ CORRECT' : '✗ WRONG'}`, dbHasCorrect ? 'success' : 'error')
      addLog(`PUT & DB match: ${bothMatch ? '✓ YES' : '✗ NO'}`, bothMatch ? 'success' : 'error')

      if (putSaysCorrect && dbHasCorrect && bothMatch) {
        setResult({
          success: true,
          message: '✓ SAVE IS WORKING CORRECTLY!',
          details: 'PUT request updates database correctly'
        })
        addLog('', 'info')
        addLog('✓✓✓ CONCLUSION: The save feature works correctly!', 'success')
      } else if (!dbHasCorrect) {
        setResult({
          success: false,
          message: '✗ DATABASE NOT PERSISTING CHANGES',
          details: `PUT says reaction_wall=${putResp.data.features.reaction_wall} but database shows ${after.reaction_wall}`
        })
        addLog('', 'info')
        addLog('✗ CONCLUSION: Changes are not being saved to database!', 'error')
      } else if (!putSaysCorrect) {
        setResult({
          success: false,
          message: '✗ PUT ENDPOINT RETURNING WRONG DATA',
          details: `PUT returned wrong value for reaction_wall`
        })
        addLog('', 'info')
        addLog('✗ CONCLUSION: API endpoint has a bug!', 'error')
      }

    } catch (error) {
      addLog(`✗ Error: ${error.message}`, 'error')
      setResult({
        success: false,
        message: `Error: ${error.message}`,
        details: error.response?.data?.message || 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-2">Simple Save Test</h1>
      <p className="text-gray-400 mb-8">Test if saving features actually works</p>

      <button
        onClick={testSave}
        disabled={loading}
        className="mb-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded flex items-center gap-2 transition text-lg"
      >
        {loading && <Loader2 className="animate-spin w-5 h-5" />}
        {loading ? 'Testing... Please Wait' : 'Start Save Test'}
      </button>

      {result && (
        <div className={`mb-8 rounded-lg border-2 p-6 ${
          result.success 
            ? 'border-green-500 bg-green-500/10' 
            : 'border-red-500 bg-red-500/10'
        }`}>
          <h2 className={`text-2xl font-bold mb-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
            {result.message}
          </h2>
          <p className={`text-lg ${result.success ? 'text-green-300' : 'text-red-300'}`}>
            {result.details}
          </p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6 max-h-[400px] overflow-y-auto font-mono text-sm">
        {log.length === 0 ? (
          <p className="text-gray-500">Click button to run test...</p>
        ) : (
          log.map((entry, idx) => (
            <div
              key={idx}
              className={`mb-1 ${
                entry.level === 'error' ? 'text-red-400' :
                entry.level === 'success' ? 'text-green-400' :
                entry.level === 'warn' ? 'text-yellow-400' :
                'text-gray-300'
              }`}
            >
              <span className="text-gray-500">[{entry.time}]</span> {entry.msg}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
