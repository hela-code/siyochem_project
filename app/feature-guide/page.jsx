'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Settings, Users } from 'lucide-react'

export default function FeatureControlGuide() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4">✓ Feature Control System</h1>
        <p className="text-gray-400 text-xl mb-8">Complete guide to using the teacher-controlled feature system</p>

        {/* Status */}
        <div className="bg-green-900/20 border-2 border-green-500 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <h2 className="text-2xl font-bold text-green-300">Status: WORKING ✓</h2>
          </div>
          <p className="text-green-300">Database is connected and feature control is functional!</p>
        </div>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-4xl font-bold text-cyan-400 mb-3">1</div>
              <h3 className="text-white font-bold mb-2">Teacher Controls</h3>
              <p className="text-gray-300 text-sm">
                Teacher goes to settings and enables/disables features by clicking a toggle button.
              </p>
              <div className="mt-4 text-xs text-gray-500 bg-gray-900 p-2 rounded font-mono">
                Features: Lab Notes, Design Experiment, Reaction Wall
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-4xl font-bold text-purple-400 mb-3">2</div>
              <h3 className="text-white font-bold mb-2">Database Saves</h3>
              <p className="text-gray-300 text-sm">
                The change is saved immediately to PostgreSQL. Each feature has a true/false setting.
              </p>
              <div className="mt-4 text-xs text-gray-500 bg-gray-900 p-2 rounded font-mono">
                Table: feature_settings (3 rows)
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-4xl font-bold text-emerald-400 mb-3">3</div>
              <h3 className="text-white font-bold mb-2">Students See It</h3>
              <p className="text-gray-300 text-sm">
                Student's navbar polls the API every 5 seconds. When they see a disabled feature, that button disappears.
              </p>
              <div className="mt-4 text-xs text-gray-500 bg-gray-900 p-2 rounded font-mono">
                Polling: 5 seconds interval
              </div>
            </div>
          </div>
        </section>

        {/* Taking Control */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Taking Control</h2>
          
          <div className="space-y-4">
            <Link
              href="/teacher-settings"
              className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition text-center"
            >
              👨‍🏫 Go to Teacher Settings
            </Link>

            <Link
              href="/feature-control"
              className="block bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition text-center"
            >
              ⚙️ Feature Control Panel (Test)
            </Link>

            <Link
              href="/api/diagnose-connection"
              className="block bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-6 rounded-lg transition text-center"
            >
              🔍 Check Database Connection
            </Link>
          </div>
        </section>

        {/* Features Explained */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Features You Can Control</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Lab Notes',
                key: 'messages',
                description: 'Students can send you messages',
                icon: '💬'
              },
              {
                name: 'Design Experiment',
                key: 'experiments',
                description: 'Create and manage chemistry quizzes',
                icon: '🧪'
              },
              {
                name: 'Reaction Wall',
                key: 'reaction_wall',
                description: 'Students can share and comment on posts',
                icon: '👥'
              }
            ].map((feature) => (
              <div key={feature.key} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-white font-bold mb-2">{feature.name}</h3>
                <p className="text-gray-300 text-sm mb-3">{feature.description}</p>
                <code className="text-xs text-gray-500 bg-gray-900 p-2 rounded block">
                  {feature.key}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* What Students See */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">What Students See</h2>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <h3 className="text-white font-bold mb-4">When Feature is ENABLED:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Lab Notes', 'Design Experiment', 'Reaction Wall'].map((btn) => (
                <button
                  key={btn}
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded"
                  disabled
                >
                  {btn}
                </button>
              ))}
            </div>
            <p className="text-gray-400 mt-4 text-sm">✓ Student can see all buttons in navbar</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white font-bold mb-4">When Feature is DISABLED:</h3>
            <div className="space-y-3">
              <button
                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                disabled
              >
                Lab Notes
              </button>
              <button
                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                disabled
              >
                Design Experiment
              </button>
              <p className="text-gray-400 text-sm">✗ Reaction Wall button is hidden</p>
            </div>
            <p className="text-gray-400 mt-4 text-sm">Students can only see ENABLED features</p>
          </div>
        </section>

        {/* Database Structure */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Database Structure</h2>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 font-mono text-sm">
            <p className="text-gray-400 mb-4">Table: <span className="text-cyan-400">feature_settings</span></p>
            
            <div className="space-y-2 text-green-400">
              <p>id: UUID (primary key)</p>
              <p>feature_name: VARCHAR (messages, experiments, reaction_wall)</p>
              <p className="text-yellow-400">is_enabled: BOOLEAN ← Teacher changes this</p>
              <p>description: VARCHAR</p>
              <p>created_at: TIMESTAMP</p>
              <p>updated_at: TIMESTAMP (changes when teacher updates)</p>
            </div>

            <p className="text-gray-400 mt-4 pt-4 border-t border-gray-700">
              Each feature has exactly 1 row. By changing is_enabled, you control what students see.
            </p>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">API Endpoints</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="font-mono text-emerald-400 mb-3">GET /api/features/status</div>
              <p className="text-gray-300 text-sm mb-3">Returns current state of all features</p>
              <div className="bg-gray-900 p-4 rounded text-xs text-gray-300 overflow-x-auto">
                <code>{`{
  "success": true,
  "features": {
    "experiments": true,
    "messages": true,
    "reaction_wall": false
  }
}`}</code>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="font-mono text-cyan-400 mb-3">PUT /api/features/status</div>
              <p className="text-gray-300 text-sm mb-3">Update feature settings (used by teacher-settings page)</p>
              <div className="bg-gray-900 p-4 rounded text-xs text-gray-300 overflow-x-auto">
                <code>{`Request body:
{
  "features": {
    "experiments": true,
    "messages": true,
    "reaction_wall": false
  }
}`}</code>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="bg-blue-900/20 border-2 border-blue-500 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-blue-300 mb-6">Quick Start</h2>
          
          <ol className="text-blue-300 space-y-3 list-decimal list-inside">
            <li>
              <strong>Go to /teacher-settings page</strong>
              <p className="text-gray-400 text-sm ml-6">Log in as a teacher first</p>
            </li>
            <li>
              <strong>Toggle any feature OFF or ON</strong>
              <p className="text-gray-400 text-sm ml-6">Click the toggle button</p>
            </li>
            <li>
              <strong>Click "Save Settings"</strong>
              <p className="text-gray-400 text-sm ml-6">Database updates immediately</p>
            </li>
            <li>
              <strong>Wait 5 seconds (or refresh)</strong>
              <p className="text-gray-400 text-sm ml-6">Student's navbar polls and updates</p>
            </li>
            <li>
              <strong>Login as student and check</strong>
              <p className="text-gray-400 text-sm ml-6">Disabled features won't show buttons</p>
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}
