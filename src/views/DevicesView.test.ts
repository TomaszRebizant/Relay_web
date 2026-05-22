import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import DevicesView from './DevicesView.vue'
import api from '@/utils/api'

// Mock api module
vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock QRCode library
vi.mock('qrcode', () => ({
  toDataURL: vi.fn((text: string, callback: (error: any, url: string) => void) => {
    callback(null, 'data:image/png;base64,mock-qr-code')
  }),
}))

import { ref } from 'vue'

describe('DevicesView', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/devices', component: DevicesView },
      ],
    })
    
    vi.clearAllMocks()
  })

  it('should render devices view', () => {
    const wrapper = mount(DevicesView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should render devices table', () => {
    const wrapper = mount(DevicesView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Panel urządzeń')
  })

  it('should render search input', () => {
    const wrapper = mount(DevicesView, {
      global: {
        plugins: [router, pinia],
      },
    })

    const searchInput = wrapper.find('input[type="text"]')
    expect(searchInput.exists()).toBe(true)
  })

  it('should render filter controls', () => {
    const wrapper = mount(DevicesView, {
      global: {
        plugins: [router, pinia],
      },
    })

    // Filter controls exist (check for search input)
    const searchInput = wrapper.find('input[type="text"]')
    expect(searchInput.exists()).toBe(true)
  })

  it('should fetch devices on mount', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    mount(DevicesView, {
      global: {
        plugins: [router, pinia],
      },
    })

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(api.get).toHaveBeenCalledWith('/devices')
  })

  it('should have add device button', () => {
    const wrapper = mount(DevicesView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Dodaj urządzenie')
  })

  it('should have export functionality', () => {
    const wrapper = mount(DevicesView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Eksport CSV')
    expect(wrapper.text()).toContain('Eksport PDF')
  })

  it('should have QR code functionality', () => {
    const wrapper = mount(DevicesView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('QR')
  })
})
