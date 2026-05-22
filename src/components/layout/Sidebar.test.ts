import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import Sidebar from './Sidebar.vue'
import { useAuthStore } from '@/stores/auth'

describe('Sidebar component', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/devices', component: { template: '<div>Devices</div>' } },
        { path: '/reports', component: { template: '<div>Reports</div>' } },
        { path: '/users', component: { template: '<div>Users</div>' } },
        { path: '/settings', component: { template: '<div>Settings</div>' } },
      ],
    })
  })

  it('should render sidebar with menu items', () => {
    const wrapper = mount(Sidebar, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.find('aside').exists()).toBe(true)
    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Urządzenia')
    expect(wrapper.text()).toContain('Zgłoszenia')
    expect(wrapper.text()).toContain('Użytkownicy')
    expect(wrapper.text()).toContain('Ustawienia')
  })

  it('should not show Calendar, Building Map, and SLA options', () => {
    const wrapper = mount(Sidebar, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).not.toContain('Kalendarz')
    expect(wrapper.text()).not.toContain('Mapa budynku')
    expect(wrapper.text()).not.toContain('SLA Monitoring')
  })

  it('should display user name from auth store', () => {
    const authStore = useAuthStore()
    authStore.user = { name: 'John Doe', email: 'john@example.com' }

    const wrapper = mount(Sidebar, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('John Doe')
  })

  it('should display "Administrator" role for admin users', () => {
    const authStore = useAuthStore()
    authStore.user = { name: 'John Doe', email: 'john@example.com', is_admin: true }

    const wrapper = mount(Sidebar, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Administrator')
  })

  it('should display "Użytkownik" role for non-admin users', () => {
    const authStore = useAuthStore()
    authStore.user = { name: 'John Doe', email: 'john@example.com', is_admin: false }

    const wrapper = mount(Sidebar, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Użytkownik')
  })

  it('should call logout when logout button is clicked', async () => {
    const authStore = useAuthStore()
    authStore.user = { name: 'John Doe', email: 'john@example.com' }
    authStore.logout = vi.fn()

    const wrapper = mount(Sidebar, {
      global: {
        plugins: [router, pinia],
      },
    })

    const logoutButton = wrapper.find('button')
    await logoutButton.trigger('click')

    expect(authStore.logout).toHaveBeenCalled()
  })

  it('should highlight active route', async () => {
    await router.push('/devices')

    const wrapper = mount(Sidebar, {
      global: {
        plugins: [router, pinia],
      },
    })

    const devicesLink = wrapper.findAll('a').find((link) => link.text().includes('Urządzenia'))
    expect(devicesLink?.classes()).toContain('bg-white/15')
    expect(devicesLink?.classes()).toContain('border-l-blue-500')
  })
})
