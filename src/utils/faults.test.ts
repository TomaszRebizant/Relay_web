import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api'
import {
  mapApiStatusToUi,
  getFaultStatusLabel,
  mapApiFaultToUserFault,
  unwrapList,
  assignTechnicianToDevice,
  unassignTechnicianFromDevice,
  updateFaultStatus,
  fetchServiceTechnicians,
  fetchDeviceTechnicianMap,
  getAssignedTechnicianFromMap,
} from './faults'

// Mock api module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('faults utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('mapApiStatusToUi', () => {
    it('should map pending to new', () => {
      expect(mapApiStatusToUi('pending')).toBe('new')
    })

    it('should map in_progress to in_progress', () => {
      expect(mapApiStatusToUi('in_progress')).toBe('in_progress')
    })

    it('should map resolved to resolved', () => {
      expect(mapApiStatusToUi('resolved')).toBe('resolved')
    })

    it('should map closed to resolved', () => {
      expect(mapApiStatusToUi('closed')).toBe('resolved')
    })

    it('should return original status if not mapped', () => {
      expect(mapApiStatusToUi('unknown')).toBe('unknown')
    })
  })

  describe('getFaultStatusLabel', () => {
    it('should return Polish label for new', () => {
      expect(getFaultStatusLabel('new')).toBe('Nowe')
    })

    it('should return Polish label for pending', () => {
      expect(getFaultStatusLabel('pending')).toBe('Nowe')
    })

    it('should return Polish label for in_progress', () => {
      expect(getFaultStatusLabel('in_progress')).toBe('W realizacji')
    })

    it('should return Polish label for resolved', () => {
      expect(getFaultStatusLabel('resolved')).toBe('Rozwiązane')
    })

    it('should return original status if not mapped', () => {
      expect(getFaultStatusLabel('unknown')).toBe('unknown')
    })
  })

  describe('unwrapList', () => {
    it('should return array if data is array', () => {
      const data = [{ id: 1 }, { id: 2 }]
      expect(unwrapList(data)).toEqual(data)
    })

    it('should unwrap data.data if data is object with data property', () => {
      const data = { data: [{ id: 1 }, { id: 2 }] }
      expect(unwrapList(data)).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should return empty array if data is null', () => {
      expect(unwrapList(null)).toEqual([])
    })

    it('should return empty array if data is undefined', () => {
      expect(unwrapList(undefined)).toEqual([])
    })

    it('should return empty array if data.data is not array', () => {
      const data = { data: 'not an array' }
      expect(unwrapList(data)).toEqual([])
    })
  })

  describe('mapApiFaultToUserFault', () => {
    it('should map API fault to user fault format', () => {
      const apiFault = {
        id: 1,
        title: 'Test fault',
        description: 'Test description',
        status: 'pending',
        created_at: '2024-01-01T10:00:00',
        updated_at: '2024-01-01T10:00:00',
        resolved_at: null,
        contact: null,
        device_uuid: 'abc-123',
        device: {
          id: 1,
          uuid: 'abc-123',
          name: 'Test Device',
          type: 'Klimatyzacja',
          model: 'Model X',
          brand: 'Brand Y',
          location: 'Budynek A',
        },
        reported_by: 'John Doe',
      }

      const result = mapApiFaultToUserFault(apiFault)

      expect(result).toEqual({
        id: 1,
        title: 'Test fault',
        description: 'Test description',
        status: 'new',
        statusLabel: 'Nowe',
        updatedAt: '2024-01-01 10:00',
        deviceName: 'Test Device',
        deviceLocation: 'Budynek A',
        reportedBy: 'John Doe',
      })
    })

    it('should handle missing device information', () => {
      const apiFault = {
        id: 2,
        title: 'Test fault',
        description: 'Test description',
        status: 'in_progress',
        created_at: '2024-01-01T10:00:00',
        updated_at: '2024-01-01T10:00:00',
        resolved_at: null,
        contact: null,
        device_uuid: 'abc-123',
        reported_by: 'Jane Doe',
      }

      const result = mapApiFaultToUserFault(apiFault)

      expect(result.deviceName).toBe('abc-123')
      expect(result.deviceLocation).toBe('Nieznana')
    })
  })

  describe('assignTechnicianToDevice', () => {
    it('should call POST API with correct parameters', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: {} })

      await assignTechnicianToDevice('device-uuid-123', 456)

      expect(api.post).toHaveBeenCalledWith('/devices/device-uuid-123/assign', {
        user_id: 456,
      })
    })
  })

  describe('unassignTechnicianFromDevice', () => {
    it('should call DELETE API with correct parameters', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: {} })

      await unassignTechnicianFromDevice('device-uuid-123', 456)

      expect(api.delete).toHaveBeenCalledWith('/devices/device-uuid-123/assign/456')
    })
  })

  describe('updateFaultStatus', () => {
    it('should call PATCH API with correct parameters', async () => {
      vi.mocked(api.patch).mockResolvedValue({ data: {} })

      await updateFaultStatus(123, 'in_progress')

      expect(api.patch).toHaveBeenCalledWith('/faults/123', {
        status: 'in_progress',
      })
    })
  })

  describe('fetchServiceTechnicians', () => {
    it('should fetch users and filter by is_service', async () => {
      const mockUsers = [
        { id: 1, name: 'John', is_service: true },
        { id: 2, name: 'Jane', is_service: false },
        { id: 3, name: 'Bob', is_service: true },
      ]
      vi.mocked(api.get).mockResolvedValue({ data: mockUsers })

      const result = await fetchServiceTechnicians()

      expect(api.get).toHaveBeenCalledWith('/users')
      expect(result).toEqual([
        { id: 1, name: 'John', is_service: true },
        { id: 3, name: 'Bob', is_service: true },
      ])
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('API Error'))

      await expect(fetchServiceTechnicians()).rejects.toThrow('API Error')
    })
  })

  describe('fetchDeviceTechnicianMap', () => {
    it('should build map of device UUIDs to technicians', async () => {
      const mockTechnicians = [
        { id: 1, name: 'John', is_service: true },
        { id: 2, name: 'Jane', is_service: true },
      ]
      vi.mocked(api.get).mockResolvedValue({ data: mockTechnicians })

      // Mock device assignments
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockTechnicians })
        .mockResolvedValueOnce({ data: [{ uuid: 'device-1' }] })
        .mockResolvedValueOnce({ data: [{ uuid: 'device-2' }] })

      const result = await fetchDeviceTechnicianMap()

      expect(result).toBeInstanceOf(Map)
    })
  })

  describe('getAssignedTechnicianFromMap', () => {
    it('should return technician if device is assigned', () => {
      const map = new Map([
        ['device-1', { id: 1, name: 'John' }],
        ['device-2', { id: 2, name: 'Jane' }],
      ])

      const result = getAssignedTechnicianFromMap('device-1', map)

      expect(result).toEqual({ id: 1, name: 'John' })
    })

    it('should return null if device is not assigned', () => {
      const map = new Map([
        ['device-1', { id: 1, name: 'John' }],
      ])

      const result = getAssignedTechnicianFromMap('device-2', map)

      expect(result).toBeNull()
    })
  })
})
