import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTechnicians, technicians } from './useTechnicians'
import { fetchServiceTechnicians } from '@/utils/faults'

// Mock faults utilities
vi.mock('@/utils/faults', () => ({
  fetchServiceTechnicians: vi.fn(),
}))

describe('useTechnicians composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    technicians.value = []
  })

  describe('initial state', () => {
    it('should initialize with empty technicians array', () => {
      const { technicians: techs } = useTechnicians()
      expect(techs.value).toEqual([])
    })

    it('should initialize with loading state false', () => {
      const { techniciansLoading } = useTechnicians()
      expect(techniciansLoading.value).toBe(false)
    })
  })

  describe('fetchTechnicians', () => {
    it('should fetch and map technicians from API', async () => {
      const mockServiceUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', is_service: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', is_service: true },
      ]
      vi.mocked(fetchServiceTechnicians).mockResolvedValue(mockServiceUsers)

      const { fetchTechnicians, technicians: techs } = useTechnicians()
      await fetchTechnicians()

      expect(fetchServiceTechnicians).toHaveBeenCalled()
      expect(techs.value).toHaveLength(2)
      expect(techs.value[0]).toEqual({
        id: '1',
        apiId: 1,
        name: 'John Doe',
        role: 'Technik Serwisowy',
        avatar: '👨‍🔧',
        activeReports: 0,
        email: 'john@example.com',
        department: 'Techniczny',
        status: 'active',
      })
    })

    it('should filter out non-service users', async () => {
      // The fetchServiceTechnicians already filters by is_service
      const mockServiceUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', is_service: true },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', is_service: true },
      ]
      vi.mocked(fetchServiceTechnicians).mockResolvedValue(mockServiceUsers)

      const { fetchTechnicians, technicians: techs } = useTechnicians()
      await fetchTechnicians()

      expect(techs.value).toHaveLength(2)
      expect(techs.value.map((t) => t.name)).toEqual(['John Doe', 'Bob Johnson'])
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(fetchServiceTechnicians).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([]), 100)
          })
      )

      const { fetchTechnicians, techniciansLoading } = useTechnicians()
      const fetchPromise = fetchTechnicians()

      expect(techniciansLoading.value).toBe(true)
      await fetchPromise
      expect(techniciansLoading.value).toBe(false)
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(fetchServiceTechnicians).mockRejectedValue(new Error('API Error'))

      const { fetchTechnicians, technicians: techs } = useTechnicians()
      await fetchTechnicians()

      expect(techs.value).toEqual([])
    })
  })

  describe('getTechnicianByName', () => {
    it('should find technician by name', () => {
      technicians.value = [
        { id: '1', name: 'John Doe', apiId: 1, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'john@example.com', department: 'Techniczny', status: 'active' },
        { id: '2', name: 'Jane Smith', apiId: 2, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'jane@example.com', department: 'Techniczny', status: 'active' },
      ]

      const { getTechnicianByName } = useTechnicians()
      const result = getTechnicianByName('John Doe')

      expect(result).toEqual(technicians.value[0])
    })

    it('should return undefined if technician not found', () => {
      technicians.value = [
        { id: '1', name: 'John Doe', apiId: 1, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'john@example.com', department: 'Techniczny', status: 'active' },
      ]

      const { getTechnicianByName } = useTechnicians()
      const result = getTechnicianByName('Unknown')

      expect(result).toBeUndefined()
    })
  })

  describe('getTechnicianById', () => {
    it('should find technician by ID', () => {
      technicians.value = [
        { id: '1', name: 'John Doe', apiId: 1, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'john@example.com', department: 'Techniczny', status: 'active' },
        { id: '2', name: 'Jane Smith', apiId: 2, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'jane@example.com', department: 'Techniczny', status: 'active' },
      ]

      const { getTechnicianById } = useTechnicians()
      const result = getTechnicianById('1')

      expect(result).toEqual(technicians.value[0])
    })

    it('should return undefined if ID not found', () => {
      technicians.value = [
        { id: '1', name: 'John Doe', apiId: 1, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'john@example.com', department: 'Techniczny', status: 'active' },
      ]

      const { getTechnicianById } = useTechnicians()
      const result = getTechnicianById('999')

      expect(result).toBeUndefined()
    })
  })

  describe('getTechnicianByApiId', () => {
    it('should find technician by API ID', () => {
      technicians.value = [
        { id: '1', name: 'John Doe', apiId: 1, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'john@example.com', department: 'Techniczny', status: 'active' },
        { id: '2', name: 'Jane Smith', apiId: 2, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'jane@example.com', department: 'Techniczny', status: 'active' },
      ]

      const { getTechnicianByApiId } = useTechnicians()
      const result = getTechnicianByApiId(1)

      expect(result).toEqual(technicians.value[0])
    })

    it('should return undefined if API ID not found', () => {
      technicians.value = [
        { id: '1', name: 'John Doe', apiId: 1, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'john@example.com', department: 'Techniczny', status: 'active' },
      ]

      const { getTechnicianByApiId } = useTechnicians()
      const result = getTechnicianByApiId(999)

      expect(result).toBeUndefined()
    })
  })

  describe('incrementActiveReports', () => {
    it('should increment active reports for technician', () => {
      technicians.value = [
        { id: '1', name: 'John Doe', apiId: 1, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 2, email: 'john@example.com', department: 'Techniczny', status: 'active' },
      ]

      const { incrementActiveReports } = useTechnicians()
      incrementActiveReports('1')

      expect(technicians.value[0]?.activeReports).toBe(3)
    })

    it('should not throw if technician not found', () => {
      technicians.value = []

      const { incrementActiveReports } = useTechnicians()
      expect(() => incrementActiveReports('1')).not.toThrow()
    })
  })

  describe('decrementActiveReports', () => {
    it('should decrement active reports for technician', () => {
      technicians.value = [
        { id: '1', name: 'John Doe', apiId: 1, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 2, email: 'john@example.com', department: 'Techniczny', status: 'active' },
      ]

      const { decrementActiveReports } = useTechnicians()
      decrementActiveReports('1')

      expect(technicians.value[0]?.activeReports).toBe(1)
    })

    it('should not go below zero', () => {
      technicians.value = [
        { id: '1', name: 'John Doe', apiId: 1, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'john@example.com', department: 'Techniczny', status: 'active' },
      ]

      const { decrementActiveReports } = useTechnicians()
      decrementActiveReports('1')

      expect(technicians.value[0]?.activeReports).toBe(0)
    })

    it('should not throw if technician not found', () => {
      technicians.value = []

      const { decrementActiveReports } = useTechnicians()
      expect(() => decrementActiveReports('1')).not.toThrow()
    })
  })

  describe('syncActiveReportsFromAssignments', () => {
    it('should sync active reports from assignments map', () => {
      technicians.value = [
        { id: '1', name: 'John Doe', apiId: 1, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'john@example.com', department: 'Techniczny', status: 'active' },
        { id: '2', name: 'Jane Smith', apiId: 2, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 0, email: 'jane@example.com', department: 'Techniczny', status: 'active' },
      ]

      const assignments = new Map([
        [1, 2],
        [2, 1],
      ])

      const { syncActiveReportsFromAssignments } = useTechnicians()
      syncActiveReportsFromAssignments(assignments)

      expect(technicians.value[0]?.activeReports).toBe(2)
      expect(technicians.value[1]?.activeReports).toBe(1)
    })

    it('should reset all to zero if no assignments', () => {
      technicians.value = [
        { id: '1', name: 'John Doe', apiId: 1, role: 'Technik Serwisowy', avatar: '👨‍🔧', activeReports: 5, email: 'john@example.com', department: 'Techniczny', status: 'active' },
      ]

      const { syncActiveReportsFromAssignments } = useTechnicians()
      syncActiveReportsFromAssignments(new Map())

      expect(technicians.value[0]?.activeReports).toBe(0)
    })
  })
})
