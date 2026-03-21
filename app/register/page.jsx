'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FlaskConical, Eye, EyeOff, Mail, Lock, Phone, Key } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    school: '',
    grade: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)

  const { register, isAuthenticated, setAuthSession } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, router])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const normalizePhone = (rawPhone = '') => {
    const digits = String(rawPhone).replace(/\D/g, '')
    if (/^0\d{9}$/.test(digits)) return `94${digits.slice(1)}`
    if (/^94\d{9}$/.test(digits)) return digits
    return null
  }

  const handleRequestOTP = async () => {
    const normalizedPhone = normalizePhone(formData.phone)
    if (!normalizedPhone) {
      toast.error('Enter a valid Sri Lankan mobile number')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone }),
      })
      const data = await res.json()

      if (data.success) {
        setFormData((prev) => ({ ...prev, phone: data.phone || normalizedPhone }))
        setOtpSent(true)
        setPhoneVerified(false)
        toast.success('OTP sent to WhatsApp')
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    const normalizedPhone = normalizePhone(formData.phone)
    if (!normalizedPhone || !otpCode) {
      toast.error('Enter phone number and OTP')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, otp: otpCode }),
      })
      const data = await res.json()

      if (data.success && data.token && data.user) {
        setAuthSession(data.user, data.token)
        toast.success('This phone is already registered. Logging you in...')
        router.push('/dashboard')
      } else if (data.success && data.requiresRegistration) {
        setPhoneVerified(true)
        toast.success('Phone verified. You can complete registration now.')
      } else {
        toast.error(data.message || 'Invalid OTP')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!phoneVerified) {
      toast.error('Please verify your phone number before registering')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const result = await register(formData)
      if (result.success) {
        toast.success('Registration successful!')
        router.push('/dashboard')
      } else {
        toast.error(result.message || 'Registration failed')
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
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <FlaskConical className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Join Chem Hub</h1>
            <p className="text-gray-300">Create your formula to enter the lab</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="johndoe"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="077XXXXXXX or 9477XXXXXXX"
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-gray-200 transition-colors"
                >
                  Send OTP
                </button>
                {phoneVerified && <span className="text-xs text-green-400">Phone verified</span>}
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Verify OTP</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="mt-2 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-sm text-white transition-colors"
                >
                  Verify OTP
                </button>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="chemist@example.com"
                />
              </div>
            </div>

            {/* School & Grade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">School</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="School name"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Grade</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select grade</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="A/L">A/L</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Secret Formula</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Formula</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Synthesizing profile...</span>
                </div>
              ) : (
                'Synthesize Profile'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
                Enter the Lab
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
