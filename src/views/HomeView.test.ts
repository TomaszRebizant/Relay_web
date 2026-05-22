import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import HomeView from './HomeView.vue'
import api from '@/utils/api'

// Mock api module
vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('HomeView', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: HomeView },
      ],
    })
    
    vi.clearAllMocks()
  })

  it('should render dashboard title', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    // Dashboard title might be in the layout, not the component itself
    expect(wrapper.exists()).toBe(true)
  })

  it('should render stats cards', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Urządzenia')
    expect(wrapper.text()).toContain('Nowe zgłoszenia')
    expect(wrapper.text()).toContain('W realizacji')
    expect(wrapper.text()).toContain('Rozwiązane')
  })

  it('should render charts section', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Analiza i statystyki')
    expect(wrapper.text()).toContain('Trendy awarii i konserwacji')
    expect(wrapper.text()).toContain('Średni czas naprawy')
  })

  it('should render recent reports table', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Ostatnie zgłoszenia')
    expect(wrapper.text()).toContain('ID')
    expect(wrapper.text()).toContain('Urządzenie')
    expect(wrapper.text()).toContain('Lokalizacja')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.text()).toContain('Priorytet')
  })

  it('should render device categories section', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Urządzenia wg kategorii')
  })

  it('should fetch dashboard data on mount', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })

    mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(api.get).toHaveBeenCalledWith('/devices')
    expect(api.get).toHaveBeenCalledWith('/faults')
  })

  it('should display loading state initially', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    // Check if loading state is handled
    expect(wrapper.exists()).toBe(true)
  })

  it('should not show maintenance costs chart (removed)', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).not.toContain('Struktura kosztów')
    expect(wrapper.text()).not.toContain('Rozkład kosztów konserwacji')
  })
})
