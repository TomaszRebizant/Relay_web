import { ref, computed } from 'vue'
import api from '@/utils/api'
import { fetchServiceTechnicians, unwrapList, type ApiUserBrief } from '@/utils/faults'

export interface Technician {
  id: string
  apiId: number
  name: string
  role: string
  avatar: string
  activeReports: number
  email?: string
  department?: string
  status?: string
}

export const technicians = ref<Technician[]>([])
export const techniciansLoading = ref(false)

export const fetchTechnicians = async () => {
  try {
    techniciansLoading.value = true
    const serviceUsers = await fetchServiceTechnicians()

    technicians.value = serviceUsers.map((user: ApiUserBrief) => ({
      id: String(user.id),
      apiId: user.id,
      name: user.name,
      role: 'Technik Serwisowy',
      avatar: '👨‍🔧',
      activeReports: 0,
      email: user.email,
      department: 'Techniczny',
      status: 'active'
    }))
  } catch (error) {
    console.error('Error fetching technicians:', error)
    technicians.value = []
  } finally {
    techniciansLoading.value = false
  }
}

export function useTechnicians() {
  const getTechnicianByName = (name: string): Technician | undefined =>
    technicians.value.find((t) => t.name === name)

  const getTechnicianById = (id: string): Technician | undefined =>
    technicians.value.find((t) => t.id === id)

  const getTechnicianByApiId = (apiId: number): Technician | undefined =>
    technicians.value.find((t) => t.apiId === apiId)

  const incrementActiveReports = (techId: string) => {
    const tech = technicians.value.find((t) => t.id === techId)
    if (tech) tech.activeReports++
  }

  const decrementActiveReports = (techId: string) => {
    const tech = technicians.value.find((t) => t.id === techId)
    if (tech && tech.activeReports > 0) tech.activeReports--
  }

  const syncActiveReportsFromAssignments = (assignments: Map<number, number>) => {
    technicians.value.forEach((tech) => {
      tech.activeReports = assignments.get(tech.apiId) ?? 0
    })
  }

  const activeTechnicians = computed(() =>
    technicians.value.filter((t) => t.status === 'active')
  )

  return {
    technicians,
    techniciansLoading,
    activeTechnicians,
    fetchTechnicians,
    getTechnicianByName,
    getTechnicianById,
    getTechnicianByApiId,
    incrementActiveReports,
    decrementActiveReports,
    syncActiveReportsFromAssignments
  }
}
