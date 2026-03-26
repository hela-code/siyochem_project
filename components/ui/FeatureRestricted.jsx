import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react'

export default function FeatureRestricted({ feature = 'This feature' }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="glass-card rounded-2xl p-8 text-center border border-accent-500/20 bg-accent-500/5">
          {/* Icon */}
          <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-accent-400" />
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-white mb-2">Feature Not Available</h1>
          <p className="text-gray-400 mb-2">
            {feature} is not currently available.
          </p>
          <p className="text-gray-500 text-sm mb-6 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Teachers will enable this when it's ready
          </p>

          {/* Info box */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <p className="text-gray-300 text-sm">
              This feature is reserved for teachers. Check back later!
            </p>
          </div>

          {/* Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
