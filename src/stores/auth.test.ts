import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth'
import api from '@/utils/api'

// Mock api module
vi.mock('@/utils/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should initialize with null user', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
    })

    it('should initialize with token from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token')
      const store = useAuthStore()
      store.initAuth()
      expect(store.token).toBe('test-token')
    })

    it('should be not authenticated when no token', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should be authenticated when token exists', () => {
      localStorage.setItem('auth_token', 'test-token')
      const store = useAuthStore()
      store.initAuth()
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('should login successfully with token', async () => {
      const mockResponse = {
        data: {
          access_token: 'new-token',
          user: { id: 1, name: 'John Doe', email: 'john@example.com' },
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const store = useAuthStore()
      const result = await store.login('john@example.com', 'password')

      expect(result).toBe(true)
      expect(store.token).toBe('new-token')
      expect(store.user).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      })
      expect(localStorage.getItem('auth_token')).toBe('new-token')
    })

    it('should handle 2FA requirement', async () => {
      const mockResponse = {
        data: {
          requires_2fa: true,
          intermediate_token: 'intermediate-token',
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const store = useAuthStore()
      const result = await store.login('john@example.com', 'password')

      expect(result).toBe('2fa_required')
      expect(store.requires2FA).toBe(true)
      expect(store.intermediateToken).toBe('intermediate-token')
    })

    it('should handle login error', async () => {
      vi.mocked(api.post).mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } },
      })

      const store = useAuthStore()
      const result = await store.login('john@example.com', 'wrong-password')

      expect(result).toBe(false)
      expect(store.error).toBe('Invalid credentials')
    })

    it('should handle fallback to token property', async () => {
      const mockResponse = {
        data: {
          token: 'fallback-token',
          user: { id: 1, name: 'John Doe', email: 'john@example.com' },
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const store = useAuthStore()
      await store.login('john@example.com', 'password')

      expect(store.token).toBe('fallback-token')
    })
  })

  describe('verify2FA', () => {
    it('should verify 2FA code successfully', async () => {
      const store = useAuthStore()
      store.intermediateToken = 'intermediate-token'
      store.requires2FA = true

      const mockResponse = {
        data: {
          access_token: 'verified-token',
          user: { id: 1, name: 'John Doe', email: 'john@example.com' },
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await store.verify2FA('123456')

      expect(result).toBe(true)
      expect(store.token).toBe('verified-token')
      expect(store.requires2FA).toBe(false)
      expect(store.intermediateToken).toBeNull()
    })

    it('should handle 2FA verification error', async () => {
      const store = useAuthStore()
      store.intermediateToken = 'intermediate-token'

      vi.mocked(api.post).mockRejectedValue({
        response: { data: { message: 'Invalid code' } },
      })

      const result = await store.verify2FA('000000')

      expect(result).toBe(false)
      expect(store.error).toBe('Invalid code')
    })
  })

  describe('setup2FA', () => {
    it('should setup 2FA successfully', async () => {
      const mockResponse = {
        data: {
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
          secret: 'JBSWY3DPEHPK3PXP',
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const store = useAuthStore()
      const result = await store.setup2FA()

      expect(result).toEqual(mockResponse.data)
    })

    it('should handle 2FA setup error', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Setup failed'))

      const store = useAuthStore()
      const result = await store.setup2FA()

      expect(result).toBeNull()
      expect(store.error).toBe('Setup failed')
    })
  })

  describe('logout', () => {
    it('should clear user and token', () => {
      localStorage.setItem('auth_token', 'test-token')
      const store = useAuthStore()
      store.initAuth()
      store.user = { id: 1, name: 'John', email: 'john@example.com' }

      store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('initAuth', () => {
    it('should load token from localStorage', () => {
      localStorage.setItem('auth_token', 'saved-token')
      const store = useAuthStore()

      store.initAuth()

      expect(store.token).toBe('saved-token')
    })

    it('should handle missing token in localStorage', () => {
      const store = useAuthStore()

      store.initAuth()

      expect(store.token).toBeFalsy()
    })
  })
})
