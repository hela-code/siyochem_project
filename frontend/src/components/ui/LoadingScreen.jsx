import React from 'react'
import { motion } from 'framer-motion'
import { FlaskConical } from 'lucide-react'

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center molecular-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Animated Logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 mx-auto mb-6 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute inset-4 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full opacity-30 blur-2xl"></div>
          <div className="absolute inset-8 glass-card rounded-full flex items-center justify-center">
            <FlaskConical className="w-12 h-12 text-primary-400" />
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-gradient mb-4"
        >
          Chem Hub
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-gray-300 mb-8"
        >
          Loading your chemistry learning platform...
        </motion.p>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center space-x-2"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
              className="w-3 h-3 bg-primary-500 rounded-full"
            />
          ))}
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 left-20 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg opacity-20"
          />
          <motion.div
            animate={{ y: [20, -20, 20] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute bottom-20 right-20 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg opacity-20"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 right-40 w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full opacity-30"
          />
        </div>
      </motion.div>
    </div>
  )
}

export default LoadingScreen
