'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FlaskConical, Phone, Key, ArrowLeft, User, GraduationCap } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [step, setStep] = useState('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [registerData, setRegisterData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    school: '',
    grade: '',
  })
  const [loading, setLoading] = useState(false)

  const { isAuthenticated, setAuthSession } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, router])

  const normalizePhone = (rawPhone = '') => {
    const digits = String(rawPhone).replace(/\D/g, '')
    if (/^0\d{9}$/.test(digits)) return `94${digits.slice(1)}`
    if (/^94\d{9}$/.test(digits)) return digits
    return null
  }

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formattedPhone = normalizePhone(phoneNumber)
    if (!formattedPhone) {
      toast.error('Enter a valid Sri Lankan mobile number')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      })
      const data = await res.json()

      if (data.success) {
        setPhoneNumber(data.phone || formattedPhone)
        toast.success('Secret Formula sent to WhatsApp')
        setStep('otp')
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formattedPhone = normalizePhone(phoneNumber)
    if (!formattedPhone) {
      toast.error('Enter a valid Sri Lankan mobile number')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, otp: otpCode }),
      })
      const data = await res.json()

      if (data.success && data.token && data.user) {
        setAuthSession(data.user, data.token)
        toast.success('Access granted')
        router.push('/dashboard')
      } else if (data.success && data.requiresRegistration) {
        setStep('register')
        toast('Phone verified. Please complete registration.', { icon: '📝' })
      } else {
        toast.error(data.message || 'Invalid Formula')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formattedPhone = normalizePhone(phoneNumber)
    if (!formattedPhone) {
      toast.error('Enter a valid Sri Lankan mobile number')
      setLoading(false)
      return
    }

    if (!registerData.email || !registerData.firstName || !registerData.lastName) {
      toast.error('Email, first name, and last name are required')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          school: registerData.school,
          grade: registerData.grade,
        }),
      })
      const data = await res.json()

      if (data.success && data.token && data.user) {
        setAuthSession(data.user, data.token)
        toast.success('Registration successful')
        router.push('/dashboard')
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center molecular-bg py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 rounded-2xl">
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <FlaskConical className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Lab Access</h1>
            <p className="text-gray-300">
              {step === 'phone' && 'Enter mobile number to authenticate'}
              {step === 'otp' && 'Enter the Secret Formula (OTP)'}
              {step === 'register' && 'No account found. Complete registration to continue'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.form
                key="phone-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestOTP} 
                className="space-y-6"
              >
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">WhatsApp Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="input-field pl-10"
                      placeholder="077XXXXXXX or 9477XXXXXXX"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center">
                  {loading ? 'Sending...' : 'Request Access Code'}
                </button>
              </motion.form>
            ) : (
              <>
                {step === 'otp' && (
                  <motion.form
                    key="otp-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleVerifyOTP}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Secret Formula</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          required
                          className="input-field pl-10 tracking-widest text-center"
                          placeholder="••••••"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center">
                      {loading ? 'Verifying...' : 'Enter the Lab'}
                    </button>

                    <div className="text-center mt-4">
                      <button type="button" onClick={() => setStep('phone')} className="text-gray-400 hover:text-white flex items-center justify-center mx-auto text-sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Change Number
                      </button>
                    </div>
                  </motion.form>
                )}

                {step === 'register' && (
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleRegister}
                    className="space-y-4"
                  >
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-300">
                      Registering mobile: <span className="text-primary-300">{normalizePhone(phoneNumber) || phoneNumber}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                        <input
                          type="email"
                          required
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="input-field"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            required
                            value={registerData.firstName}
                            onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                            className="input-field pl-10"
                            placeholder="First name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            required
                            value={registerData.lastName}
                            onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                            className="input-field pl-10"
                            placeholder="Last name"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">School</label>
                        <input
                          type="text"
                          value={registerData.school}
                          onChange={(e) => setRegisterData({ ...registerData, school: e.target.value })}
                          className="input-field"
                          placeholder="School name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Grade</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            value={registerData.grade}
                            onChange={(e) => setRegisterData({ ...registerData, grade: e.target.value })}
                            className="input-field pl-10"
                          >
                            <option value="">Select grade</option>
                            <option value="Grade 10">Grade 10</option>
                            <option value="Grade 11">Grade 11</option>
                            <option value="A/L">A/L</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center">
                      {loading ? 'Registering...' : 'Complete Registration'}
                    </button>

                    <div className="text-center mt-4">
                      <button type="button" onClick={() => setStep('phone')} className="text-gray-400 hover:text-white flex items-center justify-center mx-auto text-sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Use Different Number
                      </button>
                    </div>
                  </motion.form>
                )}
              </>
            )}
          </AnimatePresence>

          <div className="text-center mt-6">
            <p className="text-gray-300 text-sm">
              Want full signup form instead?{' '}
              <Link href="/register" className="text-primary-400 hover:text-primary-300 transition-colors">
                Register Here
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  )
}