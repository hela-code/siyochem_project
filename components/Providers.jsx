'use client'

import React, { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

export default function Providers({ children }) {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </>
  )
}
