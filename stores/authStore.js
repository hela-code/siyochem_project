'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,

      // Actions
      login: async (credentials) => {
        try {
          set({ loading: true })
          const response = await axios.post('/api/auth/login', credentials)
          const { user, token } = response.data

          set({ user, token, isAuthenticated: true, loading: false })
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          // Re-fetch full user data from /me to get all fields (socialLinks, etc.)
          try {
            const meResponse = await axios.get('/api/auth/me')
            // Only update if token hasn't changed (no concurrent login/logout)
            if (get().token === token) {
              set({ user: meResponse.data.user })
            }
          } catch (_) {
            // Login data is already set, /me refresh is a bonus
          }

          return { success: true }
        } catch (error) {
          set({ loading: false })
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed',
          }
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true })
          const response = await axios.post('/api/auth/register', userData)
          const { user, token } = response.data

          set({ user, token, isAuthenticated: true, loading: false })
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          return { success: true }
        } catch (error) {
          set({ loading: false })
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed',
          }
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, loading: false })
        delete axios.defaults.headers.common['Authorization']
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ loading: false })
          return
        }

        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await axios.get('/api/auth/me')
          // Only update if the token hasn't changed since we started
          // (prevents race condition where a new login overwrites with stale data)
          if (get().token === token) {
            set({ user: response.data.user, isAuthenticated: true, loading: false })
          }
        } catch (error) {
          // Only logout if the token is still the same (wasn't replaced by a new login)
          if (get().token === token) {
            get().logout()
          }
        }
      },

      updateProfile: async (profileData) => {
        try {
          const response = await axios.put(`/api/users/${get().user.id}`, profileData)
          set({ user: response.data.user })
          return { success: true }
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Profile update failed',
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export { useAuthStore }
