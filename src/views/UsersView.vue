<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useTechnicians, technicians } from '@/composables/useTechnicians'

// Type definitions
interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  phone: string
  status: string
  lastLogin: string
  joinDate: string
  avatar: string
  statusColor: string
  address: string
  birthDate: string
  position: string
  manager: string
}

interface EditForm {
  name: string
  email: string
  phone: string
  role: string
  department: string
  status: string
  address: string
  position: string
  manager: string
}

const users = ref([
  {
    id: 'USR-001',
    name: 'Jan Kowalski',
    email: 'jan.kowalski@company.com',
    role: 'admin',
    department: 'IT',
    phone: '+48 123 456 789',
    status: 'active',
    lastLogin: '2024-03-02 14:30',
    joinDate: '2023-01-15',
    avatar: '👨‍💼',
    statusColor: 'bg-green-500',
    address: 'ul. Krakowska 12, 00-001 Warszawa',
    birthDate: '1985-06-15',
    position: 'Główny Administrator',
    manager: 'Brak'
  },
  {
    id: 'USR-002',
    name: 'Anna Nowak',
    email: 'anna.nowak@company.com',
    role: 'manager',
    department: 'Administracja',
    phone: '+48 234 567 890',
    status: 'active',
    lastLogin: '2024-03-02 09:15',
    joinDate: '2023-03-20',
    avatar: '👩‍💼',
    statusColor: 'bg-green-500',
    address: 'ul. Wrocławska 45, 50-001 Wrocław',
    birthDate: '1990-03-22',
    position: 'Menedżer Administracji',
    manager: 'Jan Kowalski'
  },
  {
    id: 'USR-003',
    name: 'Piotr Wiśniewski',
    email: 'piotr.wisniewski@company.com',
    role: 'technician',
    department: 'Techniczny',
    phone: '+48 345 678 901',
    status: 'active',
    lastLogin: '2024-03-01 16:45',
    joinDate: '2023-06-10',
    avatar: '👨‍🔧',
    statusColor: 'bg-green-500',
    address: 'ul. Poznańska 78, 60-001 Poznań',
    birthDate: '1988-11-08',
    position: 'Technik Serwisowy',
    manager: 'Anna Nowak'
  },
  {
    id: 'USR-004',
    name: 'Katarzyna Dąbrowska',
    email: 'katarzyna.dabrowska@company.com',
    role: 'user',
    department: 'Marketing',
    phone: '+48 456 789 012',
    status: 'inactive',
    lastLogin: '2024-02-20 11:30',
    joinDate: '2023-09-05',
    avatar: '👩‍💻',
    statusColor: 'bg-gray-500',
    address: 'ul. Gdańska 23, 80-001 Gdańsk',
    birthDate: '1992-07-30',
    position: 'Specjalista Marketingu',
    manager: 'Magdalena Zielińska'
  },
  {
    id: 'USR-005',
    name: 'Tomasz Lewandowski',
    email: 'tomasz.lewandowski@company.com',
    role: 'technician',
    department: 'Techniczny',
    phone: '+48 567 890 123',
    status: 'suspended',
    lastLogin: '2024-01-15 13:20',
    joinDate: '2023-02-28',
    avatar: '👨‍🔧',
    statusColor: 'bg-red-500',
    address: 'ul. Łódzka 56, 90-001 Łódź',
    birthDate: '1987-04-12',
    position: 'Technik Utrzymania Ruchu',
    manager: 'Anna Nowak'
  },
  {
    id: 'USR-006',
    name: 'Magdalena Zielińska',
    email: 'magdalena.zielinska@company.com',
    role: 'manager',
    department: 'HR',
    phone: '+48 678 901 234',
    status: 'active',
    lastLogin: '2024-03-02 10:00',
    joinDate: '2023-04-12',
    avatar: '👩‍💼',
    statusColor: 'bg-green-500',
    address: 'ul. Katowicka 89, 40-001 Katowice',
    birthDate: '1989-12-18',
    position: 'Menedżer HR',
    manager: 'Jan Kowalski'
  },
  {
    id: 'USR-007',
    name: 'Marek Kowalczyk',
    email: 'marek.kowalczyk@company.com',
    role: 'technician',
    department: 'Techniczny',
    phone: '+48 111 222 333',
    status: 'active',
    lastLogin: '2024-03-02 08:30',
    joinDate: '2023-05-15',
    avatar: '👨‍🔧',
    statusColor: 'bg-green-500',
    address: 'ul. Warszawska 100, 00-001 Warszawa',
    birthDate: '1986-09-20',
    position: 'Technik Serwisowy',
    manager: 'Anna Nowak'
  },
  {
    id: 'USR-008',
    name: 'Krzysztof Jankowski',
    email: 'krzysztof.jankowski@company.com',
    role: 'technician',
    department: 'Techniczny',
    phone: '+48 444 555 666',
    status: 'active',
    lastLogin: '2024-03-01 17:00',
    joinDate: '2023-07-01',
    avatar: '👨‍🔧',
    statusColor: 'bg-green-500',
    address: 'ul. Krakowska 50, 30-001 Kraków',
    birthDate: '1991-02-14',
    position: 'Technik Utrzymania Ruchu',
    manager: 'Anna Nowak'
  }
])

// Modal states
const showDetailsModal = ref(false)
const showEditModal = ref(false)
const showTasksModal = ref(false)
const selectedUser = ref<User | null>(null)
const userTasks = ref<Array<{id: string, title: string, status: string, priority: string, device: string, updatedAt: string}>>([])

// Import reports data to show user tasks
const getUserTasks = (userName: string) => {
  // This would normally fetch from backend, here we simulate
  // In real app: return await fetch(`/api/users/${userId}/tasks`)
  
  // For now, we'll sync with technicians data
  const tech = technicians.value.find(t => t.name === userName)
  if (tech) {
    // Return mock tasks based on activeReports count
    const tasks = []
    for (let i = 0; i < tech.activeReports; i++) {
      tasks.push({
        id: `TASK-${i + 1}`,
        title: `Zadanie serwisowe ${i + 1}`,
        status: i % 2 === 0 ? 'in_progress' : 'new',
        priority: i % 3 === 0 ? 'high' : 'medium',
        device: 'Urządzenie ' + (i + 1),
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      })
    }
    return tasks
  }
  return []
}

const showUserTasks = (user: User) => {
  selectedUser.value = user
  userTasks.value = getUserTasks(user.name)
  showTasksModal.value = true
}

const closeTasksModal = () => {
  showTasksModal.value = false
  selectedUser.value = null
  userTasks.value = []
}

const getTaskStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    new: 'bg-red-500',
    in_progress: 'bg-amber-500',
    resolved: 'bg-green-500'
  }
  return colors[status] || 'bg-gray-500'
}

const getTaskStatusText = (status: string) => {
  const texts: Record<string, string> = {
    new: 'Nowe',
    in_progress: 'W realizacji',
    resolved: 'Zakończone'
  }
  return texts[status] || status
}

const getTaskPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500'
  }
  return colors[priority] || 'bg-gray-500'
}

const getTaskPriorityText = (priority: string) => {
  const texts: Record<string, string> = {
    high: 'Wysoki',
    medium: 'Średni',
    low: 'Niski'
  }
  return texts[priority] || priority
}

// Form data for editing
const editForm = ref<EditForm>({
  name: '',
  email: '',
  phone: '',
  role: '',
  department: '',
  status: '',
  address: '',
  position: '',
  manager: ''
})

const getStatusText = (status: string) => {
  const statusMap = {
    active: 'Aktywny',
    inactive: 'Nieaktywny',
    suspended: 'Zablokowany'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getRoleText = (role: string) => {
  const roleMap = {
    admin: 'Administrator',
    manager: 'Menedżer',
    technician: 'Technik',
    user: 'Użytkownik'
  }
  return roleMap[role as keyof typeof roleMap] || role
}

const getRoleColor = (role: string) => {
  const roleColorMap = {
    admin: 'bg-purple-500',
    manager: 'bg-blue-500',
    technician: 'bg-amber-500',
    user: 'bg-gray-500'
  }
  return roleColorMap[role as keyof typeof roleColorMap] || 'bg-gray-500'
}

const filteredUsers = ref(users.value)
const searchQuery = ref('')
const selectedRole = ref('all')
const selectedStatus = ref('all')
const selectedDepartment = ref('all')

const roles = ['all', 'admin', 'manager', 'technician', 'user']
const statusOptions = ['all', 'active', 'inactive', 'suspended']
const departments = ['all', 'IT', 'Administracja', 'Techniczny', 'Marketing', 'HR']

const filterUsers = () => {
  let filtered = users.value.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = selectedRole.value === 'all' || user.role === selectedRole.value
    const matchesStatus = selectedStatus.value === 'all' || user.status === selectedStatus.value
    const matchesDepartment = selectedDepartment.value === 'all' || user.department === selectedDepartment.value
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment
  })
  filteredUsers.value = filtered
}

const stats = ref({
  total: users.value.length,
  active: users.value.filter(u => u.status === 'active').length,
  inactive: users.value.filter(u => u.status === 'inactive').length,
  suspended: users.value.filter(u => u.status === 'suspended').length
})

const filterByStatus = (status: string) => {
  selectedStatus.value = status
  selectedRole.value = 'all'
  selectedDepartment.value = 'all'
  filterUsers()
}

const clearAllFilters = () => {
  selectedStatus.value = 'all'
  selectedRole.value = 'all'
  selectedDepartment.value = 'all'
  searchQuery.value = ''
  filterUsers()
}

// Modal functions
const showUserDetails = (user: User) => {
  selectedUser.value = user
  showDetailsModal.value = true
}

const showUserEdit = (user: User) => {
  selectedUser.value = user
  editForm.value = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    department: user.department,
    status: user.status,
    address: user.address,
    position: user.position,
    manager: user.manager
  }
  showEditModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedUser.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedUser.value = null
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return

  if (showTasksModal.value) {
    closeTasksModal()
    return
  }

  if (showEditModal.value) {
    closeEditModal()
    return
  }

  if (showDetailsModal.value) {
    closeDetailsModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

const saveUser = () => {
  // Find user index and update
  const userIndex = users.value.findIndex(u => u.id === selectedUser.value?.id)
  if (userIndex !== -1 && selectedUser.value) {
    const updatedUser: User = {
      id: selectedUser.value.id,
      name: editForm.value.name,
      email: editForm.value.email,
      phone: editForm.value.phone,
      role: editForm.value.role,
      department: editForm.value.department,
      status: editForm.value.status,
      address: editForm.value.address,
      position: editForm.value.position,
      manager: editForm.value.manager,
      lastLogin: selectedUser.value.lastLogin,
      joinDate: selectedUser.value.joinDate,
      avatar: selectedUser.value.avatar,
      birthDate: selectedUser.value.birthDate,
      statusColor: editForm.value.status === 'active' ? 'bg-green-500' : 
                  editForm.value.status === 'inactive' ? 'bg-gray-500' : 'bg-red-500'
    }
    users.value[userIndex] = updatedUser
    // Update filtered users
    filterUsers()
  }
  closeEditModal()
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Header with stats -->
    <section>
      <h1 class="mb-6 font-bold text-slate-800 text-3xl">Panel użytkowników</h1>
      
      <!-- Stats Cards -->
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div 
          @click="clearAllFilters"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'all' && selectedRole === 'all' && selectedDepartment === 'all' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-blue-500 rounded-lg w-10 h-10 text-white">
              👥
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.total }}</div>
              <div class="text-gray-500 text-sm">Wszyscy użytkownicy</div>
            </div>
          </div>
        </div>
        
        <div 
          @click="filterByStatus('active')"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'active' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-green-500 rounded-lg w-10 h-10 text-white">
              ✅
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.active }}</div>
              <div class="text-gray-500 text-sm">Aktywni</div>
            </div>
          </div>
        </div>
        
        <div 
          @click="filterByStatus('inactive')"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'inactive' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-gray-500 rounded-lg w-10 h-10 text-white">
              ⏸️
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.inactive }}</div>
              <div class="text-gray-500 text-sm">Nieaktywni</div>
            </div>
          </div>
        </div>
        
        <div 
          @click="filterByStatus('suspended')"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'suspended' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-red-500 rounded-lg w-10 h-10 text-white">
              🚫
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.suspended }}</div>
              <div class="text-gray-500 text-sm">Zablokowani</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <div class="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4">
        <div class="flex lg:flex-row flex-col lg:items-center gap-4">
          <div class="relative">
            <input 
              v-model="searchQuery"
              @input="filterUsers"
              type="text" 
              placeholder="Szukaj użytkownika..."
              class="py-2 pr-4 pl-10 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <span class="top-2.5 left-3 absolute text-gray-400">🔍</span>
          </div>
          
          <select 
            v-model="selectedRole"
            @change="filterUsers"
            class="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie role</option>
            <option v-for="role in roles.slice(1)" :key="role" :value="role">
              {{ getRoleText(role) }}
            </option>
          </select>
          
          <select 
            v-model="selectedDepartment"
            @change="filterUsers"
            class="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie działy</option>
            <option v-for="dept in departments.slice(1)" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>
          
          <select 
            v-model="selectedStatus"
            @change="filterUsers"
            class="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="active">Aktywni</option>
            <option value="inactive">Nieaktywni</option>
            <option value="suspended">Zablokowani</option>
          </select>
        </div>
        
        <button class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors">
          + Dodaj użytkownika
        </button>
      </div>
    </section>

    <!-- Users Grid -->
    <section>
      <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="user in filteredUsers" 
          :key="user.id"
          class="bg-white shadow-sm hover:shadow-lg p-6 border border-gray-200 rounded-xl transition-all hover:-translate-y-1 duration-300"
        >
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div class="text-3xl">{{ user.avatar }}</div>
              <div>
                <h3 class="font-semibold text-slate-800 text-lg">{{ user.name }}</h3>
                <p class="text-gray-500 text-sm">{{ user.id }}</p>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <span 
                :class="user.statusColor"
                class="px-2 py-1 rounded-full font-medium text-white text-xs"
              >
                {{ getStatusText(user.status) }}
              </span>
              <span 
                :class="getRoleColor(user.role)"
                class="px-2 py-1 rounded-full font-medium text-white text-xs"
              >
                {{ getRoleText(user.role) }}
              </span>
            </div>
          </div>
          
          <!-- User Info -->
          <div class="space-y-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-gray-400 text-sm">📧</span>
              <span class="text-sm">{{ user.email }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400 text-sm">📱</span>
              <span class="text-sm">{{ user.phone }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400 text-sm">🏢</span>
              <span class="text-sm">{{ user.department }}</span>
            </div>
          </div>
          
          <!-- Activity Info -->
          <div class="gap-3 grid grid-cols-1 bg-gray-50 mb-4 p-3 rounded-lg">
            <div>
              <div class="text-gray-500 text-xs">Ostatnie logowanie</div>
              <div class="font-semibold text-slate-800 text-sm">{{ user.lastLogin }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-xs">Data dołączenia</div>
              <div class="font-semibold text-slate-800 text-sm">{{ user.joinDate }}</div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-2">
            <button 
              @click="showUserDetails(user)"
              class="flex-1 bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg text-white text-sm transition-colors"
            >
              Szczegóły
            </button>
            <button 
              @click="showUserEdit(user)"
              class="flex-1 hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors"
            >
              Edytuj
            </button>
            <button 
              v-if="user.role === 'technician'"
              @click="showUserTasks(user)"
              class="flex-1 bg-amber-500 hover:bg-amber-600 px-3 py-2 rounded-lg text-white text-sm transition-colors"
            >
              📋 Zadania
            </button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="py-12 text-center">
        <div class="mb-4 text-6xl">🔍</div>
        <h3 class="mb-2 font-semibold text-slate-800 text-lg">Nie znaleziono użytkowników</h3>
        <p class="text-gray-500">Spróbuj zmienić kryteria wyszukiwania</p>
      </div>
    </section>

    <!-- User Details Modal -->
    <div v-if="showDetailsModal && selectedUser" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-gray-200 border-b">
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-slate-800 text-xl">Szczegóły użytkownika</h2>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <span class="text-2xl">✕</span>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="text-5xl">{{ selectedUser.avatar }}</div>
            <div>
              <h3 class="font-semibold text-slate-800 text-lg">{{ selectedUser.name }}</h3>
              <p class="text-gray-500">{{ selectedUser.id }}</p>
              <div class="flex gap-2 mt-2">
                <span :class="selectedUser.statusColor" class="px-2 py-1 rounded-full font-medium text-white text-xs">
                  {{ getStatusText(selectedUser.status) }}
                </span>
                <span :class="getRoleColor(selectedUser.role)" class="px-2 py-1 rounded-full font-medium text-white text-xs">
                  {{ getRoleText(selectedUser.role) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div class="space-y-3">
              <div>
                <div class="text-gray-500 text-xs">Email</div>
                <div class="font-medium">{{ selectedUser.email }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Telefon</div>
                <div class="font-medium">{{ selectedUser.phone }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Dział</div>
                <div class="font-medium">{{ selectedUser.department }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Stanowisko</div>
                <div class="font-medium">{{ selectedUser.position }}</div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <div class="text-gray-500 text-xs">Adres</div>
                <div class="font-medium">{{ selectedUser.address }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Data urodzenia</div>
                <div class="font-medium">{{ selectedUser.birthDate }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Przełożony</div>
                <div class="font-medium">{{ selectedUser.manager }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Data dołączenia</div>
                <div class="font-medium">{{ selectedUser.joinDate }}</div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 mt-6 p-4 rounded-lg">
            <div class="mb-1 text-gray-500 text-xs">Ostatnie logowanie</div>
            <div class="font-medium">{{ selectedUser.lastLogin }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal && selectedUser" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-gray-200 border-b">
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-slate-800 text-xl">Edytuj użytkownika</h2>
            <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
              <span class="text-2xl">✕</span>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="saveUser" class="space-y-4">
            <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Imię i nazwisko</label>
                <input 
                  v-model="editForm.name" 
                  type="text" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Email</label>
                <input 
                  v-model="editForm.email" 
                  type="email" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Telefon</label>
                <input 
                  v-model="editForm.phone" 
                  type="tel" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Rola</label>
                <select 
                  v-model="editForm.role" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="admin">Administrator</option>
                  <option value="manager">Menedżer</option>
                  <option value="technician">Technik</option>
                  <option value="user">Użytkownik</option>
                </select>
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Dział</label>
                <select 
                  v-model="editForm.department" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="IT">IT</option>
                  <option value="Administracja">Administracja</option>
                  <option value="Techniczny">Techniczny</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Status</label>
                <select 
                  v-model="editForm.status" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="active">Aktywny</option>
                  <option value="inactive">Nieaktywny</option>
                  <option value="suspended">Zablokowany</option>
                </select>
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Stanowisko</label>
                <input 
                  v-model="editForm.position" 
                  type="text" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Przełożony</label>
                <input 
                  v-model="editForm.manager" 
                  type="text" 
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
            </div>
            
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Adres</label>
              <input 
                v-model="editForm.address" 
                type="text" 
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
            </div>
            
            <div class="flex gap-3 pt-4">
              <button 
                type="submit" 
                class="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Zapisz zmiany
              </button>
              <button 
                type="button" 
                @click="closeEditModal"
                class="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- User Tasks Modal -->
    <div v-if="showTasksModal && selectedUser" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div class="flex justify-between items-center p-6 border-gray-200 border-b">
          <div>
            <h2 class="font-semibold text-slate-800 text-xl">📋 Zadania użytkownika</h2>
            <p class="mt-1 text-gray-500 text-sm">{{ selectedUser.name }} - {{ selectedUser.position }}</p>
          </div>
          <button @click="closeTasksModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div v-if="userTasks.length === 0" class="py-8 text-center">
            <div class="mb-3 text-5xl">📋</div>
            <h3 class="mb-2 font-semibold text-slate-800 text-lg">Brak aktywnych zadań</h3>
            <p class="text-gray-500">Ten użytkownik nie ma obecnie przypisanych zadań</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="task in userTasks" 
              :key="task.id"
              class="hover:shadow-md p-4 border border-gray-200 rounded-lg transition-shadow"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-slate-800">{{ task.title }}</h3>
                <div class="flex gap-2">
                  <span 
                    :class="getTaskStatusColor(task.status)"
                    class="px-2 py-1 rounded-full font-medium text-white text-xs"
                  >
                    {{ getTaskStatusText(task.status) }}
                  </span>
                  <span 
                    :class="getTaskPriorityColor(task.priority)"
                    class="px-2 py-1 rounded-full font-medium text-white text-xs"
                  >
                    {{ getTaskPriorityText(task.priority) }}
                  </span>
                </div>
              </div>
              <p class="mb-2 text-gray-600 text-sm">{{ task.device }}</p>
              <div class="flex justify-between items-center text-gray-500 text-xs">
                <span>ID: {{ task.id }}</span>
                <span>Zaktualizowano: {{ task.updatedAt }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 p-6 border-gray-200 border-t">
          <button 
            @click="closeTasksModal"
            class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
