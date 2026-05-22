import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import api from './api'

describe('API utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should have get method', () => {
    expect(api.get).toBeDefined()
  })

  it('should have post method', () => {
    expect(api.post).toBeDefined()
  })

  it('should have patch method', () => {
    expect(api.patch).toBeDefined()
  })

  it('should have delete method', () => {
    expect(api.delete).toBeDefined()
  })

  it('should have put method', () => {
    expect(api.put).toBeDefined()
  })

  describe('localStorage token management', () => {
    it('should store token in localStorage', () => {
      localStorage.setItem('auth_token', 'test-token')
      expect(localStorage.getItem('auth_token')).toBe('test-token')
    })

    it('should remove token from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token')
      localStorage.removeItem('auth_token')
      expect(localStorage.getItem('auth_token')).toBeFalsy()
    })

    it('should handle missing token', () => {
      expect(localStorage.getItem('auth_token')).toBeFalsy()
    })
  })
})
