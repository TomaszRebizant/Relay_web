import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import router from './index'
import { useAuthStore } from '@/stores/auth'

describe('Router configuration', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it('should have defined routes', () => {
    const routes = router.getRoutes()
    
    expect(routes).toHaveLength(10) // login, register, home, devices, reports, installer, users, settings, about
  })

  it('should have login route', () => {
    const routes = router.getRoutes()
    const loginRoute = routes.find((r: any) => r.name === 'login')
    
    expect(loginRoute).toBeDefined()
    expect(loginRoute?.path).toBe('/login')
  })

  it('should have register route', () => {
    const routes = router.getRoutes()
    const registerRoute = routes.find((r: any) => r.name === 'register')
    
    expect(registerRoute).toBeDefined()
    expect(registerRoute?.path).toBe('/register')
  })

  it('should have home route', () => {
    const routes = router.getRoutes()
    const homeRoute = routes.find((r: any) => r.name === 'home')
    
    expect(homeRoute).toBeDefined()
    expect(homeRoute?.path).toBe('/')
  })

  it('should have devices route', () => {
    const routes = router.getRoutes()
    const devicesRoute = routes.find((r: any) => r.name === 'devices')
    
    expect(devicesRoute).toBeDefined()
    expect(devicesRoute?.path).toBe('/devices')
  })

  it('should have reports route', () => {
    const routes = router.getRoutes()
    const reportsRoute = routes.find((r: any) => r.name === 'reports')
    
    expect(reportsRoute).toBeDefined()
    expect(reportsRoute?.path).toBe('/reports')
  })

  it('should not have calendar route (removed)', () => {
    const routes = router.getRoutes()
    const calendarRoute = routes.find((r: any) => r.name === 'calendar')
    
    expect(calendarRoute).toBeUndefined()
  })

  it('should not have building map route (removed)', () => {
    const routes = router.getRoutes()
    const mapRoute = routes.find((r: any) => r.name === 'building-map')
    
    expect(mapRoute).toBeUndefined()
  })

  it('should not have SLA route (removed)', () => {
    const routes = router.getRoutes()
    const slaRoute = routes.find((r: any) => r.name === 'sla')
    
    expect(slaRoute).toBeUndefined()
  })

  describe('navigation guard - authentication', () => {
    it('should redirect to login if not authenticated', async () => {
      const authStore = useAuthStore()
      authStore.user = null
      authStore.token = null

      await router.push('/devices')
      
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should allow access if authenticated (any role)', async () => {
      const authStore = useAuthStore()
      authStore.user = { id: 1, name: 'John', email: 'john@example.com', is_service: true }
      authStore.token = 'test-token'

      await router.push('/devices')
      
      expect(router.currentRoute.value.path).toBe('/devices')
    })

    it('should redirect authenticated users away from login', async () => {
      const authStore = useAuthStore()
      authStore.user = { id: 1, name: 'John', email: 'john@example.com' }
      authStore.token = 'test-token'

      await router.push('/login')
      
      expect(router.currentRoute.value.path).toBe('/')
    })

    it('should redirect authenticated users away from register', async () => {
      const authStore = useAuthStore()
      authStore.user = { id: 1, name: 'John', email: 'john@example.com' }
      authStore.token = 'test-token'

      await router.push('/register')
      
      expect(router.currentRoute.value.path).toBe('/')
    })
  })
})
