import { ref, computed, type Ref } from 'vue'

export interface Technician {
  id: string
  name: string
  role: string
  avatar: string
  activeReports: number
  email?: string
  department?: string
  status?: string
  phone?: string
}

// Shared technicians data - synchronized between UsersView and ReportsView
export const technicians = ref<Technician[]>([
  { 
    id: 'tech-1', 
    name: 'Piotr Wiśniewski', 
    role: 'Główny Technik', 
    avatar: '👨‍🔧', 
    activeReports: 2,
    email: 'piotr.wisniewski@company.com',
    department: 'Techniczny',
    status: 'active',
    phone: '+48 345 678 901'
  },
  { 
    id: 'tech-2', 
    name: 'Tomasz Lewandowski', 
    role: 'Technik', 
    avatar: '👨‍🔧', 
    activeReports: 1,
    email: 'tomasz.lewandowski@company.com',
    department: 'Techniczny',
    status: 'suspended',
    phone: '+48 567 890 123'
  },
  { 
    id: 'tech-3', 
    name: 'Marek Kowalczyk', 
    role: 'Technik', 
    avatar: '👨‍🔧', 
    activeReports: 0,
    email: 'marek.kowalczyk@company.com',
    department: 'Techniczny',
    status: 'active',
    phone: '+48 111 222 333'
  },
  { 
    id: 'tech-4', 
    name: 'Krzysztof Jankowski', 
    role: 'Technik', 
    avatar: '👨‍🔧', 
    activeReports: 1,
    email: 'krzysztof.jankowski@company.com',
    department: 'Techniczny',
    status: 'active',
    phone: '+48 444 555 666'
  }
])

export function useTechnicians() {
  const getTechnicianByName = (name: string): Technician | undefined => {
    return technicians.value.find(t => t.name === name)
  }
  
  const getTechnicianById = (id: string): Technician | undefined => {
    return technicians.value.find(t => t.id === id)
  }
  
  const incrementActiveReports = (techId: string) => {
    const tech = technicians.value.find(t => t.id === techId)
    if (tech) {
      tech.activeReports++
    }
  }
  
  const decrementActiveReports = (techId: string) => {
    const tech = technicians.value.find(t => t.id === techId)
    if (tech && tech.activeReports > 0) {
      tech.activeReports--
    }
  }
  
  const activeTechnicians = computed(() => 
    technicians.value.filter(t => t.status === 'active')
  )
  
  return {
    technicians,
    activeTechnicians,
    getTechnicianByName,
    getTechnicianById,
    incrementActiveReports,
    decrementActiveReports
  }
}
