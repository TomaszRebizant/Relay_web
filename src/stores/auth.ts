import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id?: number; name?: string; email: string; token?: string; is_admin?: boolean; is_service?: boolean; is_installer?: boolean } | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const intermediateToken = ref<string | null>(null)
  const requires2FA = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.is_admin === true)
  const isService = computed(() => user.value?.is_service === true)
  const isInstaller = computed(() => user.value?.is_installer === true)

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    requires2FA.value = false
    intermediateToken.value = null
    
    try {
      console.log('Attempting login with:', email)
      const response = await api.post('/login', {
        email,
        password
      })

      console.log('Login response:', response.data)

      if (response.data.requires_2fa) {
        requires2FA.value = true
        intermediateToken.value = response.data.intermediate_token
        console.log('2FA required, intermediate token saved')
        return '2fa_required'
      }
      
      if (response.data.access_token || response.data.token) {
        const authToken = response.data.access_token || response.data.token
        token.value = authToken
        user.value = response.data.user || { email, token: authToken }
        localStorage.setItem('auth_token', authToken)
        console.log('Login successful, token saved')
        console.log('User data:', user.value)
        console.log('is_admin:', user.value?.is_admin)
        console.log('is_service:', user.value?.is_service)
        console.log('is_installer:', user.value?.is_installer)
        return true
      }
      
      console.log('No token in response')
      error.value = 'No token received from server'
      return false
    } catch (err: any) {
      console.error('Login error:', err)
      console.error('Error response:', err.response?.data)
      error.value = err.response?.data?.message || err.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function verify2FA(code: string) {
    loading.value = true
    error.value = null
    
    try {
      console.log('Verifying 2FA with code:', code)
      const response = await api.post('/auth/2fa/verify', {
        intermediate_token: intermediateToken.value,
        code
      })

      console.log('2FA verify response:', response.data)

      if (response.data.access_token || response.data.token) {
        const authToken = response.data.access_token || response.data.token
        token.value = authToken
        user.value = response.data.user || { email: user.value?.email || '', token: authToken }
        localStorage.setItem('auth_token', authToken)
        intermediateToken.value = null
        requires2FA.value = false
        console.log('2FA verification successful')
        return true
      }
      
      error.value = 'Invalid 2FA code'
      return false
    } catch (err: any) {
      console.error('2FA verification error:', err)
      console.error('Error response:', err.response?.data)
      error.value = err.response?.data?.message || err.message || '2FA verification failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function setup2FA() {
    loading.value = true
    error.value = null

    try {
      console.log('Setting up 2FA')
      const response = await api.post('/auth/2fa/setup')

      console.log('2FA setup response:', response.data)
      return response.data
    } catch (err: any) {
      console.error('2FA setup error:', err)
      console.error('Error response:', err.response?.data)
      error.value = err.response?.data?.message || err.message || '2FA setup failed'
      return null
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle(providerToken: string) {
    loading.value = true
    error.value = null
    requires2FA.value = false
    intermediateToken.value = null

    try {
      console.log('Attempting Google login')
      const response = await api.post('/auth/google', {
        provider_token: providerToken
      })

      console.log('Google login response:', response.data)

      if (response.data.requires_2fa) {
        requires2FA.value = true
        intermediateToken.value = response.data.intermediate_token
        console.log('2FA required after Google login, intermediate token saved')
        return '2fa_required'
      }

      if (response.data.access_token || response.data.token) {
        const authToken = response.data.access_token || response.data.token
        token.value = authToken
        user.value = response.data.user || { email: user.value?.email || '', token: authToken }
        localStorage.setItem('auth_token', authToken)
        console.log('Google login successful, token saved')
        return true
      }

      error.value = 'No token received from server'
      return false
    } catch (err: any) {
      console.error('Google login error:', err)
      console.error('Error response:', err.response?.data)
      error.value = err.response?.data?.message || err.message || 'Google login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function requestPasswordReset(email: string) {
    loading.value = true
    error.value = null

    try {
      console.log('Requesting password reset for:', email)
      const response = await api.post('/public/mobile/password/email', {
        email
      })

      console.log('Password reset request response:', response.data)
      return true
    } catch (err: any) {
      console.error('Password reset request error:', err)
      console.error('Error response:', err.response?.data)
      error.value = err.response?.data?.message || err.message || 'Password reset request failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(token: string, email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      console.log('Resetting password with token')
      const response = await api.post('/public/mobile/password/reset', {
        token,
        email,
        password
      })

      console.log('Password reset response:', response.data)
      return true
    } catch (err: any) {
      console.error('Password reset error:', err)
      console.error('Error response:', err.response?.data)
      error.value = err.response?.data?.message || err.message || 'Password reset failed'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  function initAuth() {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      token.value = savedToken
    }
  }

  return {
    user,
    token,
    intermediateToken,
    requires2FA,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isService,
    isInstaller,
    login,
    verify2FA,
    setup2FA,
    loginWithGoogle,
    requestPasswordReset,
    resetPassword,
    logout,
    initAuth
  }
})
