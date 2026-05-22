import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ReportsView from './ReportsView.vue'
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

// Mock faults utilities
vi.mock('@/utils/faults', () => ({
  fetchServiceTechnicians: vi.fn(),
  fetchDeviceTechnicianMap: vi.fn(),
  assignTechnicianToDevice: vi.fn(),
  unassignTechnicianFromDevice: vi.fn(),
  updateFaultStatus: vi.fn(),
  mapApiStatusToUi: vi.fn((status: string) => status),
  getFaultStatusLabel: vi.fn((status: string) => status),
  mapApiFaultToUserFault: vi.fn((fault: any) => fault),
  unwrapList: vi.fn((data: any) => Array.isArray(data) ? data : []),
  getAssignedTechnicianFromMap: vi.fn(() => null),
}))

// Mock useTechnicians
vi.mock('@/composables/useTechnicians', () => ({
  useTechnicians: () => ({
    technicians: ref([]),
    techniciansLoading: ref(false),
    fetchTechnicians: vi.fn(),
    getTechnicianByName: vi.fn(),
    getTechnicianById: vi.fn(),
    getTechnicianByApiId: vi.fn(),
    incrementActiveReports: vi.fn(),
    decrementActiveReports: vi.fn(),
    syncActiveReportsFromAssignments: vi.fn(),
  }),
  technicians: ref([]),
  techniciansLoading: ref(false),
}))

describe('ReportsView', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/reports', component: ReportsView },
      ],
    })
    
    vi.clearAllMocks()
  })

  it('should render reports view', () => {
    const wrapper = mount(ReportsView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should render reports table', () => {
    const wrapper = mount(ReportsView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Panel zgłoszeń')
  })

  it('should render filter controls', () => {
    const wrapper = mount(ReportsView, {
      global: {
        plugins: [router, pinia],
      },
    })

    // Filter controls exist (check for search input)
    const searchInput = wrapper.find('input[type="text"]')
    expect(searchInput.exists()).toBe(true)
  })

  it('should render search input', () => {
    const wrapper = mount(ReportsView, {
      global: {
        plugins: [router, pinia],
      },
    })

    const searchInput = wrapper.find('input[type="text"]')
    expect(searchInput.exists()).toBe(true)
  })

  it('should fetch reports on mount', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    mount(ReportsView, {
      global: {
        plugins: [router, pinia],
      },
    })

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(api.get).toHaveBeenCalledWith('/faults')
  })

  it('should not show technician assignment buttons (admin only)', () => {
    const wrapper = mount(ReportsView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).not.toContain('Przypisz do mnie')
  })

  it('should have create report button', () => {
    const wrapper = mount(ReportsView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Nowe zgłoszenie')
  })

  it('should render status filter options', () => {
    const wrapper = mount(ReportsView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Wszystkie')
    expect(wrapper.text()).toContain('Nowe')
    expect(wrapper.text()).toContain('W realizacji')
    expect(wrapper.text()).toContain('Rozwiązane')
  })

  it('should render priority filter options', () => {
    const wrapper = mount(ReportsView, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Wysoki')
    expect(wrapper.text()).toContain('Średni')
    expect(wrapper.text()).toContain('Niski')
  })
})
