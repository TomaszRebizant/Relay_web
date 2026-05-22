<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import api from '@/utils/api'
import {
  fetchFaultsForUser,
  getFaultStatusLabel,
  type UserFault
} from '@/utils/faults'

// API User type (from backend)
interface ApiUser {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  is_admin: boolean
  is_installer: boolean
  is_service: boolean
  created_at: string
  updated_at: string
  provider: string | null
  provider_id: string | null
  two_factor_confirmed_at: string | null
  fcm_token: string | null
  has_2fa_enabled: boolean
}

// UI User type (for display)
interface User {
  id: string
  apiId: number
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
  is_admin: boolean
  is_installer: boolean
  is_service: boolean
  has_2fa_enabled: boolean
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

interface AddUserForm {
  name: string
  email: string
  password: string
  role: string
}

interface ResetPasswordForm {
  newPassword: string
  confirmPassword: string
}

const users = ref<User[]>([])

// Modal states
const showDetailsModal = ref(false)
const showEditModal = ref(false)
const showReportsModal = ref(false)
const showAddUserModal = ref(false)
const showResetPasswordModal = ref(false)
const selectedUser = ref<User | null>(null)
const userReports = ref<UserFault[]>([])
const userReportsLoading = ref(false)
const userReportsError = ref('')

const showUserReports = async (user: User) => {
  selectedUser.value = user
  showReportsModal.value = true
  userReports.value = []
  userReportsError.value = ''
  userReportsLoading.value = true

  try {
    userReports.value = await fetchFaultsForUser(user.apiId)
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    userReportsError.value =
      err.response?.data?.message || err.message || 'Nie udało się pobrać zgłoszeń'
    console.error('Error fetching user reports:', error)
  } finally {
    userReportsLoading.value = false
  }
}

const closeReportsModal = () => {
  showReportsModal.value = false
  selectedUser.value = null
  userReports.value = []
  userReportsError.value = ''
}

const getReportStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    new: 'bg-red-500',
    in_progress: 'bg-amber-500',
    resolved: 'bg-green-500'
  }
  return colors[status] || 'bg-gray-500'
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

// Form data for adding user
const addUserForm = ref<AddUserForm>({
  name: '',
  email: '',
  password: '',
  role: 'user'
})

// Form data for password reset
const resetPasswordForm = ref<ResetPasswordForm>({
  newPassword: '',
  confirmPassword: ''
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
    installer: 'Instalator',
    technician: 'Technik Serwisowy',
    user: 'Użytkownik'
  }
  return roleMap[role as keyof typeof roleMap] || role
}

const getRoleColor = (role: string) => {
  const roleColorMap = {
    admin: 'bg-purple-500',
    installer: 'bg-blue-500',
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

// Map API user to UI user format
const mapApiUserToUiUser = (apiUser: ApiUser): User => {
  const role = apiUser.is_admin ? 'admin' : apiUser.is_service ? 'technician' : apiUser.is_installer ? 'installer' : 'user'
  const roleText = apiUser.is_admin ? 'Administrator' : apiUser.is_service ? 'Technik Serwisowy' : apiUser.is_installer ? 'Instalator' : 'Użytkownik'
  
  return {
    id: `USR-${apiUser.id.toString().padStart(3, '0')}`,
    apiId: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: role,
    department: apiUser.is_admin ? 'IT' : apiUser.is_service ? 'Techniczny' : apiUser.is_installer ? 'Instalacje' : 'Użytkownik',
    phone: '',
    status: 'active',
    lastLogin: apiUser.updated_at ? apiUser.updated_at.replace('T', ' ').substring(0, 16) : '-',
    joinDate: apiUser.created_at ? apiUser.created_at.substring(0, 10) : '-',
    avatar: apiUser.is_admin ? '👨‍💼' : apiUser.is_service ? '👨‍🔧' : apiUser.is_installer ? '👷' : '👤',
    statusColor: 'bg-green-500',
    address: '',
    birthDate: '-',
    position: roleText,
    manager: apiUser.is_admin ? 'Brak' : 'Administrator',
    is_admin: apiUser.is_admin,
    is_installer: apiUser.is_installer,
    is_service: apiUser.is_service,
    has_2fa_enabled: apiUser.has_2fa_enabled
  }
}

// Fetch users from API
const fetchUsers = async () => {
  try {
    console.log('Fetching users from API...')
    const response = await api.get('/users')
    console.log('Users API response:', response.data)
    
    const mappedUsers = response.data.map((apiUser: ApiUser) => mapApiUserToUiUser(apiUser))
    users.value = mappedUsers
    filteredUsers.value = mappedUsers
    
    stats.value = {
      total: mappedUsers.length,
      active: mappedUsers.filter((u: User) => u.status === 'active').length,
      inactive: mappedUsers.filter((u: User) => u.status === 'inactive').length,
      suspended: mappedUsers.filter((u: User) => u.status === 'suspended').length
    }
  } catch (error: any) {
    console.error('Error fetching users:', error)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)
    console.error('Error message:', error.message)
  }
}

const roles = ['all', 'admin', 'installer', 'technician', 'user']
const statusOptions = ['all', 'active', 'inactive', 'suspended']
const departments = ['all', 'IT', 'Instalacje', 'Techniczny', 'Inni']

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

const showAddUser = () => {
  addUserForm.value = {
    name: '',
    email: '',
    password: '',
    role: 'user'
  }
  showAddUserModal.value = true
}

const closeAddUserModal = () => {
  showAddUserModal.value = false
  addUserForm.value = {
    name: '',
    email: '',
    password: '',
    role: 'user'
  }
}

const showResetPassword = (user: User) => {
  selectedUser.value = user
  resetPasswordForm.value = {
    newPassword: '',
    confirmPassword: ''
  }
  showResetPasswordModal.value = true
}

const closeResetPasswordModal = () => {
  showResetPasswordModal.value = false
  selectedUser.value = null
  resetPasswordForm.value = {
    newPassword: '',
    confirmPassword: ''
  }
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return

  if (showReportsModal.value) {
    closeReportsModal()
    return
  }

  if (showEditModal.value) {
    closeEditModal()
    return
  }

  if (showDetailsModal.value) {
    closeDetailsModal()
    return
  }

  if (showAddUserModal.value) {
    closeAddUserModal()
    return
  }

  if (showResetPasswordModal.value) {
    closeResetPasswordModal()
    return
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  fetchUsers()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

const saveUser = async () => {
  if (!selectedUser.value) return
  
  try {
    // Extract numeric ID from USR-XXX format
    const numericId = selectedUser.value.id.replace('USR-', '')
    
    // Map role to API flags
    const roleFlags = {
      is_admin: editForm.value.role === 'admin',
      is_installer: editForm.value.role === 'installer',
      is_service: editForm.value.role === 'technician'
    }
    
    const updateData = {
      name: editForm.value.name,
      email: editForm.value.email,
      ...roleFlags
    }
    
    console.log('Updating user:', numericId, updateData)
    const response = await api.put(`/users/${numericId}`, updateData)
    console.log('User updated:', response.data)
    
    // Refresh users list
    await fetchUsers()
    closeEditModal()
  } catch (error: any) {
    console.error('Error updating user:', error)
    console.error('Error response:', error.response?.data)
    alert('Błąd podczas zapisywania użytkownika: ' + (error.response?.data?.message || error.message))
  }
}

const deleteUser = async (userId: string) => {
  if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
    return
  }
  
  try {
    // Extract numeric ID from USR-XXX format
    const numericId = userId.replace('USR-', '')
    
    console.log('Deleting user:', numericId)
    await api.delete(`/users/${numericId}`)
    console.log('User deleted')
    
    // Refresh users list
    await fetchUsers()
  } catch (error: any) {
    console.error('Error deleting user:', error)
    console.error('Error response:', error.response?.data)
    alert('Błąd podczas usuwania użytkownika: ' + (error.response?.data?.message || error.message))
  }
}

const addUser = async () => {
  if (!addUserForm.value.name || !addUserForm.value.email || !addUserForm.value.password) {
    alert('Wypełnij wszystkie wymagane pola')
    return
  }

  if (addUserForm.value.password.length < 6) {
    alert('Hasło musi mieć co najmniej 6 znaków')
    return
  }

  try {
    // Map role to API flags
    const roleFlags = {
      is_admin: addUserForm.value.role === 'admin',
      is_installer: addUserForm.value.role === 'installer',
      is_service: addUserForm.value.role === 'technician'
    }
    
    const userData = {
      name: addUserForm.value.name,
      email: addUserForm.value.email,
      password: addUserForm.value.password,
      ...roleFlags
    }
    
    console.log('Creating user:', userData)
    const response = await api.post('/users', userData)
    console.log('User created:', response.data)
    
    // Refresh users list
    await fetchUsers()
    closeAddUserModal()
    alert('Użytkownik został utworzony pomyślnie')
  } catch (error: any) {
    console.error('Error creating user:', error)
    console.error('Error response:', error.response?.data)
    alert('Błąd podczas tworzenia użytkownika: ' + (error.response?.data?.message || error.message))
  }
}

const resetPassword = async () => {
  if (!selectedUser.value) return
  
  if (!resetPasswordForm.value.newPassword || !resetPasswordForm.value.confirmPassword) {
    alert('Wypełnij oba pola hasła')
    return
  }

  if (resetPasswordForm.value.newPassword !== resetPasswordForm.value.confirmPassword) {
    alert('Hasła nie są zgodne')
    return
  }

  if (resetPasswordForm.value.newPassword.length < 6) {
    alert('Hasło musi mieć co najmniej 6 znaków')
    return
  }

  try {
    const numericId = selectedUser.value.id.replace('USR-', '')
    
    const passwordData = {
      password: resetPasswordForm.value.newPassword
    }
    
    console.log('Resetting password for user:', numericId)
    const response = await api.patch(`/users/${numericId}/password`, passwordData)
    console.log('Password reset:', response.data)
    
    closeResetPasswordModal()
    alert('Hasło zostało zresetowane pomyślnie')
  } catch (error: any) {
    console.error('Error resetting password:', error)
    console.error('Error response:', error.response?.data)
    alert('Błąd podczas resetowania hasła: ' + (error.response?.data?.message || error.message))
  }
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
        
        <button 
          @click="showAddUser"
          class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
        >
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
              @click="showResetPassword(user)"
              class="flex-1 bg-amber-500 hover:bg-amber-600 px-3 py-2 rounded-lg text-white text-sm transition-colors"
              title="Reset hasła"
            >
              🔑 Reset
            </button>
            <button 
              @click="deleteUser(user.id)"
              class="hover:bg-red-50 px-3 py-2 border border-red-300 rounded-lg text-red-600 text-sm transition-colors"
              title="Usuń użytkownika"
            >
              🗑️
            </button>
            <button 
              @click="showUserReports(user)"
              class="flex-1 bg-amber-500 hover:bg-amber-600 px-3 py-2 rounded-lg text-white text-sm transition-colors"
            >
              📋 Zgłoszenia
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
                  <option value="installer">Instalator</option>
                  <option value="technician">Technik Serwisowy</option>
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
                  <option value="Instalacje">Instalacje</option>
                  <option value="Techniczny">Techniczny</option>
                  <option value="Inni">Inni</option>
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

    <!-- User Reports Modal -->
    <div v-if="showReportsModal && selectedUser" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div class="flex justify-between items-center p-6 border-gray-200 border-b">
          <div>
            <h2 class="font-semibold text-slate-800 text-xl">📋 Przypisane zgłoszenia</h2>
            <p class="mt-1 text-gray-500 text-sm">{{ selectedUser.name }} — zgłoszenia z przypisanych urządzeń</p>
          </div>
          <button @click="closeReportsModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div v-if="userReportsLoading" class="py-8 text-center">
            <div class="mb-3 text-5xl">⏳</div>
            <p class="text-gray-500">Ładowanie zgłoszeń...</p>
          </div>

          <div v-else-if="userReportsError" class="py-8 text-center">
            <div class="mb-3 text-5xl">⚠️</div>
            <h3 class="mb-2 font-semibold text-slate-800 text-lg">Błąd pobierania</h3>
            <p class="text-red-600 text-sm">{{ userReportsError }}</p>
          </div>

          <div v-else-if="userReports.length === 0" class="py-8 text-center">
            <div class="mb-3 text-5xl">📋</div>
            <h3 class="mb-2 font-semibold text-slate-800 text-lg">Brak zgłoszeń</h3>
            <p class="text-gray-500">Użytkownik nie ma przypisanych urządzeń lub brak zgłoszeń na tych urządzeniach</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="report in userReports" 
              :key="report.id"
              class="hover:shadow-md p-4 border border-gray-200 rounded-lg transition-shadow"
            >
              <div class="flex justify-between items-start gap-3 mb-2">
                <h3 class="font-semibold text-slate-800">{{ report.title }}</h3>
                <span 
                  :class="getReportStatusColor(report.status)"
                  class="px-2 py-1 rounded-full font-medium text-white text-xs shrink-0"
                >
                  {{ getFaultStatusLabel(report.status) }}
                </span>
              </div>
              <p class="mb-2 text-gray-600 text-sm">{{ report.description }}</p>
              <div class="space-y-1 text-gray-500 text-sm">
                <div>🔧 {{ report.deviceName }} — {{ report.deviceLocation }}</div>
                <div>👤 Zgłosił: {{ report.reportedBy }}</div>
              </div>
              <div class="flex justify-between items-center mt-3 text-gray-500 text-xs">
                <span>ID: F-{{ report.id.toString().padStart(3, '0') }}</span>
                <span>Zaktualizowano: {{ report.updatedAt }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 p-6 border-gray-200 border-t">
          <button 
            @click="closeReportsModal"
            class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-gray-200 border-b">
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-slate-800 text-xl">Dodaj użytkownika</h2>
            <button @click="closeAddUserModal" class="text-gray-400 hover:text-gray-600">
              <span class="text-2xl">✕</span>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="addUser" class="space-y-4">
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Imię i nazwisko</label>
              <input 
                v-model="addUserForm.name" 
                type="text" 
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Email</label>
              <input 
                v-model="addUserForm.email" 
                type="email" 
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Hasło</label>
              <input 
                v-model="addUserForm.password" 
                type="password" 
                required
                minlength="6"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
              <p class="mt-1 text-gray-500 text-xs">Minimum 6 znaków</p>
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Rola</label>
              <select
                v-model="addUserForm.role"
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="user">Użytkownik</option>
                <option value="technician">Technik Serwisowy</option>
                <option value="installer">Instalator</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button 
                type="submit" 
                class="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Utwórz użytkownika
              </button>
              <button 
                type="button" 
                @click="closeAddUserModal"
                class="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="showResetPasswordModal && selectedUser" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-md">
        <div class="p-6 border-gray-200 border-b">
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-slate-800 text-xl">Reset hasła</h2>
            <button @click="closeResetPasswordModal" class="text-gray-400 hover:text-gray-600">
              <span class="text-2xl">✕</span>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <p class="mb-4 text-gray-600">Resetuj hasło dla użytkownika: <strong>{{ selectedUser.name }}</strong></p>
          
          <form @submit.prevent="resetPassword" class="space-y-4">
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Nowe hasło</label>
              <input 
                v-model="resetPasswordForm.newPassword" 
                type="password" 
                required
                minlength="6"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Potwierdź hasło</label>
              <input 
                v-model="resetPasswordForm.confirmPassword" 
                type="password" 
                required
                minlength="6"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
            </div>
            
            <div class="flex gap-3 pt-4">
              <button 
                type="submit" 
                class="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Zresetuj hasło
              </button>
              <button 
                type="button" 
                @click="closeResetPasswordModal"
                class="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
