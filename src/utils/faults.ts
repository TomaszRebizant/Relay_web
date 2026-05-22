import api from '@/utils/api'

export interface ApiFault {
  id: number
  device_uuid: string
  title: string
  description: string | null
  reported_by: string
  contact: string | null
  status: string
  resolved_at: string | null
  created_at: string
  updated_at: string
  device?: {
    id: number
    uuid: string
    name: string
    type: string
    model: string
    brand: string
    location: string
  }
}

export interface ApiDeviceSummary {
  uuid: string
  name?: string
  type?: string
  location?: string
}

export interface ApiUserBrief {
  id: number
  name: string
  email?: string
  is_service?: boolean
  is_admin?: boolean
  is_installer?: boolean
}

export interface UserFault {
  id: number
  title: string
  description: string
  status: string
  statusLabel: string
  deviceName: string
  deviceLocation: string
  reportedBy: string
  updatedAt: string
}

const statusToUi: Record<string, string> = {
  pending: 'new',
  in_progress: 'in_progress',
  resolved: 'resolved',
  closed: 'resolved'
}

const statusLabels: Record<string, string> = {
  new: 'Nowe',
  pending: 'Nowe',
  in_progress: 'W realizacji',
  resolved: 'Rozwiązane'
}

export const mapApiStatusToUi = (status: string): string =>
  statusToUi[status] || status

export const getFaultStatusLabel = (status: string): string =>
  statusLabels[status] || status

export const mapApiFaultToUserFault = (fault: ApiFault): UserFault => ({
  id: fault.id,
  title: fault.title || `Zgłoszenie #${fault.id}`,
  description: fault.description || '-',
  status: mapApiStatusToUi(fault.status),
  statusLabel: getFaultStatusLabel(mapApiStatusToUi(fault.status)),
  deviceName: fault.device?.name || fault.device_uuid,
  deviceLocation: fault.device?.location || 'Nieznana',
  reportedBy: fault.reported_by,
  updatedAt: fault.updated_at
    ? fault.updated_at.replace('T', ' ').substring(0, 16)
    : '-'
})

export const unwrapList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data) {
    const inner = (data as { data: unknown }).data
    return Array.isArray(inner) ? inner : []
  }
  return []
}

export const fetchServiceTechnicians = async (): Promise<ApiUserBrief[]> => {
  try {
    const response = await api.get('/users')
    const users = unwrapList<ApiUserBrief>(response.data)
    return users.filter((user) => user.is_service)
  } catch (error: any) {
    console.error('Error fetching service technicians:', error)
    if (error.response?.status === 403) {
      console.warn('User does not have permission to fetch all users')
    }
    return []
  }
}

/** Mapuje urządzenie → technik na podstawie GET /users/{id}/devices (mniej zapytań niż /devices/{uuid}/users). */
export const fetchDeviceTechnicianMap = async (): Promise<Map<string, ApiUserBrief>> => {
  const map = new Map<string, ApiUserBrief>()
  const technicians = await fetchServiceTechnicians()

  await Promise.all(
    technicians.map(async (technician) => {
      try {
        const response = await api.get(`/users/${technician.id}/devices`)
        const devices = unwrapList<ApiDeviceSummary>(response.data)
        devices.forEach((device) => map.set(device.uuid, technician))
      } catch {
        // brak urządzeń lub błąd pojedynczego technika
      }
    })
  )

  return map
}

export const getAssignedTechnicianFromMap = (
  deviceUuid: string,
  deviceTechnicianMap: Map<string, ApiUserBrief>
): { id: number; name: string } | null => {
  const technician = deviceTechnicianMap.get(deviceUuid)
  return technician ? { id: technician.id, name: technician.name } : null
}

export const assignTechnicianToDevice = async (
  deviceUuid: string,
  userId: number
): Promise<void> => {
  await api.post(`/devices/${deviceUuid}/assign`, { user_id: userId })
}

export const unassignTechnicianFromDevice = async (
  deviceUuid: string,
  userId: number
): Promise<void> => {
  await api.delete(`/devices/${deviceUuid}/assign/${userId}`)
}

export const updateFaultStatus = async (
  faultId: number,
  status: 'pending' | 'in_progress' | 'resolved'
): Promise<void> => {
  await api.patch(`/faults/${faultId}`, { status })
}

export const fetchFaultsForUser = async (userId: number): Promise<UserFault[]> => {
  const devicesRes = await api.get(`/users/${userId}/devices`)
  const devices = unwrapList<ApiDeviceSummary>(devicesRes.data)
  const deviceUuids = new Set(devices.map((d) => d.uuid))

  if (deviceUuids.size === 0) return []

  const faultsRes = await api.get('/faults')
  const faults = unwrapList<ApiFault>(faultsRes.data)

  return faults
    .filter((fault) => deviceUuids.has(fault.device_uuid))
    .map(mapApiFaultToUserFault)
    .sort((a, b) => b.id - a.id)
}
