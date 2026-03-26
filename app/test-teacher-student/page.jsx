'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function TeacherStudentFeatureTest() {
  const [log, setLog] = useState([])
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState(null)

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    setLog(prev => [...prev, { message, type, timestamp }])
    console.log(`[${timestamp}] [${type}] ${message}`)
  }

  const runTest = async () => {
    setTesting(true)
    setLog([])
    setResult(null)

    try {
      // ============================================
      // PART 1: TEACHER ACTION
      // ============================================
      addLog('═══════════════════════════════════════', 'section')
      addLog('PART 1: TEACHER DISABLES A FEATURE', 'section')
      addLog('═══════════════════════════════════════', 'section')
      
      addLog('Teacher: Loading current settings...', 'info')
      const teacherLoadResponse = await axios.get('/api/features/status')
      const initialState = teacherLoadResponse.data.features
      addLog(`✓ Current state: experiments=${initialState.experiments}, messages=${initialState.messages}, reaction_wall=${initialState.reaction_wall}`, 'success')
      
      addLog('Teacher: Clicking toggle for "Reaction Wall"...', 'info')
      const teacherSaveRequest = {
        ...initialState,
        reaction_wall: false  // Teacher disables this
      }
      addLog(`Teacher: Saving new state...`, 'info')
      
      const teacherSaveResponse = await axios.put('/api/features/status', { features: teacherSaveRequest })
      addLog(`✓ Teacher save response: reaction_wall=${teacherSaveResponse.data.features.reaction_wall}`, 'success')
      
      // ============================================
      // PART 2: CHECK DATABASE IMMEDIATELY
      // ============================================
      addLog('', 'info')
      addLog('═══════════════════════════════════════', 'section')
      addLog('PART 2: DATABASE STATE AFTER TEACHER SAVE', 'section')
      addLog('═══════════════════════════════════════', 'section')
      
      addLog('Checking database immediately after teacher saves...', 'info')
      const dbCheck1 = await axios.get('/api/features/status')
      const dbState1 = dbCheck1.data.features
      addLog(`Database: experiments=${dbState1.experiments}, messages=${dbState1.messages}, reaction_wall=${dbState1.reaction_wall}`, 
        dbState1.reaction_wall === false ? 'success' : 'error')
      
      if (dbState1.reaction_wall !== false) {
        addLog('✗ ERROR: Database did not save the change!', 'error')
        setResult({
          success: false,
          issue: 'Database not persisting changes',
          details: `Teacher set reaction_wall=false but database shows: ${dbState1.reaction_wall}`
        })
        setTesting(false)
        return
      }
      
      // ============================================
      // PART 3: WAIT FOR NAVBAR REFRESH (5 seconds)
      // ============================================
      addLog('', 'info')
      addLog('═══════════════════════════════════════', 'section')
      addLog('PART 3: WAITING FOR STUDENT REFRESH (5 seconds)', 'section')
      addLog('═══════════════════════════════════════', 'section')
      addLog('(Students have navbar polling every 5 seconds)', 'info')
      
      for (let i = 5; i > 0; i--) {
        addLog(`${i}s remaining...`, 'info')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // ============================================
      // PART 4: STUDENT CHECKS FEATURE STATUS
      // ============================================
      addLog('', 'info')
      addLog('═══════════════════════════════════════', 'section')
      addLog('PART 4: STUDENT LOADS PAGE (Reaction Wall)', 'section')
      addLog('═══════════════════════════════════════', 'section')
      
      addLog('Student: Loading page with feature check...', 'info')
      const studentLoadResponse = await axios.get('/api/features/status')
      const studentState = studentLoadResponse.data.features
      addLog(`✓ Student sees: experiments=${studentState.experiments}, messages=${studentState.messages}, reaction_wall=${studentState.reaction_wall}`, 'success')
      
      // ============================================
      // PART 5: VERIFY STUDENT SEES DISABLED STATE
      // ============================================
      addLog('', 'info')
      addLog('═══════════════════════════════════════', 'section')
      addLog('PART 5: CHECKING IF STUDENT SEES CORRECT STATE', 'section')
      addLog('═══════════════════════════════════════', 'section')
      
      if (studentState.reaction_wall === false) {
        addLog('✓✓✓ SUCCESS! Student can see that Reaction Wall is DISABLED', 'success')
        addLog('The feature toggle system is working correctly!', 'success')
        
        setResult({
          success: true,
          message: 'Feature control system is working perfectly!',
          workflow: [
            { step: '1. Teacher disabled reaction_wall', status: '✓' },
            { step: '2. Database updated correctly', status: '✓' },
            { step: '3. Waited for 5-second refresh', status: '✓' },
            { step: '4. Student sees disabled state', status: '✓' }
          ]
        })
      } else {
        addLog('✗✗✗ ERROR! Student still sees reaction_wall as ENABLED', 'error')
        addLog('The feature control system is NOT working!', 'error')
        
        setResult({
          success: false,
          issue: 'Student not seeing teacher\'s disabled state',
          details: `Teacher disabled it, but student sees: reaction_wall=${studentState.reaction_wall}`
        })
      }

    } catch (error) {
      addLog(`✗ ERROR: ${error.message}`, 'error')
      if (error.response?.data) {
        addLog(`Response: ${JSON.stringify(error.response.data)}`, 'error')
      }
      setResult({
        success: false,
        issue: 'API Error',
        details: error.message
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-2">Teacher ↔ Student Feature Control Test</h1>
      <p className="text-gray-400 mb-8">Tests if teacher can control features and students see the changes</p>

      <button
        onClick={runTest}
        disabled={testing}
        className="mb-8 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded flex items-center gap-2 transition text-lg"
      >
        {testing && <Loader2 className="animate-spin w-5 h-5" />}
        {testing ? 'Testing... (15 seconds)' : 'Start Complete Test'}
      </button>

      {/* Results */}
      {result && (
        <div className={`mb-8 rounded-lg border-2 p-6 ${
          result.success 
            ? 'border-green-500 bg-green-500/10' 
            : 'border-red-500 bg-red-500/10'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {result.success ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-400" />
            )}
            <h2 className={`text-2xl font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? '✓ TEST PASSED' : '✗ TEST FAILED'}
            </h2>
          </div>
          
          <p className={`text-lg ${result.success ? 'text-green-300' : 'text-red-300'}`}>
            {result.message || result.issue}
          </p>
          
          {result.workflow && (
            <div className="mt-4 space-y-2">
              {result.workflow.map((item, idx) => (
                <p key={idx} className="text-green-300">
                  {item.status} {item.step}
                </p>
              ))}
            </div>
          )}
          
          {result.details && (
            <p className="mt-4 text-sm text-gray-300 bg-gray-800 p-3 rounded">
              {result.details}
            </p>
          )}
        </div>
      )}

      {/* Log */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-h-[500px] overflow-y-auto font-mono text-xs">
        {log.length === 0 ? (
          <p className="text-gray-500">Click button to start test. Logs will appear here...</p>
        ) : (
          log.map((entry, idx) => (
            <div key={idx} className={`mb-1 ${
              entry.type === 'section' ? 'text-cyan-400 font-bold border-l-2 border-cyan-500 pl-2 my-2' :
              entry.type === 'error' ? 'text-red-400' :
              entry.type === 'success' ? 'text-green-400' :
              'text-gray-300'
            }`}>
              <span className="text-gray-500">[{entry.timestamp}]</span> {entry.message}
            </div>
          ))
        )}
      </div>

      {/* How it works */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-300 font-bold mb-2">Step 1: Teacher</h3>
          <p className="text-blue-300 text-sm">
            Teacher logs in, goes to settings, and disables "Reaction Wall" feature by clicking toggle and saving.
          </p>
        </div>

        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-300 font-bold mb-2">Step 2: Database Update</h3>
          <p className="text-blue-300 text-sm">
            The API updates the database with reaction_wall = false
          </p>
        </div>

        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-300 font-bold mb-2">Step 3: Student</h3>
          <p className="text-blue-300 text-sm">
            Student's navbar polls the API (every 5 seconds), sees the feature is disabled, and hides the button.
          </p>
        </div>
      </div>
    </div>
  )
}
