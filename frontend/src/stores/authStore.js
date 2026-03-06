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
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          })

          // Set default axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          return { success: true }
        } catch (error) {
          set({ loading: false })
          return { 
            success: false, 
            message: error.response?.data?.message || 'Login failed' 
          }
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true })
          const response = await axios.post('/api/auth/register', userData)
          
          const { user, token } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          })

          // Set default axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          return { success: true }
        } catch (error) {
          set({ loading: false })
          return { 
            success: false, 
            message: error.response?.data?.message || 'Registration failed' 
          }
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        })

        // Remove axios header
        delete axios.defaults.headers.common['Authorization']
      },

      checkAuth: async () => {
        const { token } = get()
        
        if (!token) {
          set({ loading: false })
          return
        }

        try {
          // Set axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          const response = await axios.get('/api/auth/me')
          
          set({
            user: response.data.user,
            isAuthenticated: true,
            loading: false
          })
        } catch (error) {
          // Token is invalid, clear auth state
          get().logout()
        }
      },

      updateProfile: async (profileData) => {
        try {
          const response = await axios.put(`/api/users/${get().user.id}`, profileData)
          
          set({
            user: response.data.user
          })

          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            message: error.response?.data?.message || 'Profile update failed' 
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Check auth on app load
useAuthStore.getState().checkAuth()

export { useAuthStore }
