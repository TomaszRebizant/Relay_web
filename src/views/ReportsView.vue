<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useTechnicians, technicians } from '@/composables/useTechnicians'
import api from '@/utils/api'
import {
  type ApiFault,
  type ApiUserBrief,
  assignTechnicianToDevice,
  fetchDeviceTechnicianMap,
  getAssignedTechnicianFromMap,
  mapApiStatusToUi,
  unassignTechnicianFromDevice,
  unwrapList,
  updateFaultStatus
} from '@/utils/faults'

const {
  fetchTechnicians,
  techniciansLoading,
  syncActiveReportsFromAssignments
} = useTechnicians()

interface Report {
  id: string
  faultId: number
  deviceUuid: string
  title: string
  device: string
  deviceType: string
  location: string
  status: string
  priority: string
  category: string
  description: string
  reportedBy: string
  reportedAt: string
  assignedTo: string
  assignedUserId: number | null
  estimatedTime: string
  createdAt: string
  updatedAt: string
}

const reports = ref<Report[]>([])
const reportsLoading = ref(false)
const apiError = ref('')

const extractApiError = (error: unknown): string => {
  const err = error as {
    response?: { status?: number; data?: { message?: string } }
    message?: string
  }
  const status = err.response?.status
  const message = err.response?.data?.message

  if (status === 401) {
    return 'Sesja wygasła — zaloguj się ponownie.'
  }
  if (status === 502 || status === 503) {
    return 'Serwer API jest niedostępny (Render może się budzić). Odśwież za chwilę.'
  }
  return message || err.message || 'Nie udało się połączyć z API.'
}

const mapApiFaultToReport = (
  fault: ApiFault,
  deviceTechnicianMap: Map<string, ApiUserBrief>
): Report => {
  const assigned = getAssignedTechnicianFromMap(fault.device_uuid, deviceTechnicianMap)
  const uiStatus = mapApiStatusToUi(fault.status)
  const priority = fault.resolved_at ? 'low' : 'high'

  return {
    id: `F-${fault.id.toString().padStart(3, '0')}`,
    faultId: fault.id,
    deviceUuid: fault.device_uuid,
    title: fault.title || `Zgłoszenie #${fault.id}`,
    device: fault.device?.name || fault.device_uuid,
    deviceType: fault.device?.type || 'Nieznane',
    location: fault.device?.location || 'Nieznana',
    status: uiStatus,
    priority,
    category: fault.status === 'pending' ? 'Awaria' : 'Serwis',
    description: fault.description || '-',
    reportedBy: fault.reported_by,
    reportedAt: fault.created_at ? fault.created_at.replace('T', ' ').substring(0, 16) : '-',
    assignedTo: assigned?.name ?? '',
    assignedUserId: assigned?.id ?? null,
    estimatedTime: fault.resolved_at ? 'Rozwiązane' : '24h',
    createdAt: fault.created_at || '-',
    updatedAt: fault.updated_at ? fault.updated_at.replace('T', ' ').substring(0, 16) : '-'
  }
}

const syncTechnicianWorkload = (reportList: Report[]) => {
  const counts = new Map<number, number>()
  reportList.forEach((report) => {
    if (report.assignedUserId && report.status !== 'resolved') {
      counts.set(report.assignedUserId, (counts.get(report.assignedUserId) ?? 0) + 1)
    }
  })
  syncActiveReportsFromAssignments(counts)
}

const fetchReports = async () => {
  reportsLoading.value = true
  apiError.value = ''

  try {
    const response = await api.get('/faults')
    const faults = unwrapList<ApiFault>(response.data)

    let deviceTechnicianMap = new Map<string, ApiUserBrief>()
    try {
      deviceTechnicianMap = await fetchDeviceTechnicianMap()
    } catch (mapError: unknown) {
      console.warn('Nie udało się pobrać przypisań techników:', mapError)
    }

    const mappedReports = faults.map((fault) => mapApiFaultToReport(fault, deviceTechnicianMap))

    reports.value = mappedReports
    filteredReports.value = mappedReports
    syncTechnicianWorkload(mappedReports)
    applyFilters()
  } catch (error: unknown) {
    apiError.value = extractApiError(error)
    console.error('Error fetching faults:', error)
  } finally {
    reportsLoading.value = false
  }
}

const getStatusText = (status: string) => {
  const statusMap = {
    new: 'Nowe',
    pending: 'Nowe',
    in_progress: 'W realizacji',
    resolved: 'Rozwiązane'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getPriorityText = (priority: string) => {
  const priorityMap = {
    high: 'Wysoki',
    medium: 'Średni',
    low: 'Niski'
  }
  return priorityMap[priority as keyof typeof priorityMap] || priority
}

const getStatusColor = (status: string) => {
  const colors = {
    new: 'bg-red-500',
    in_progress: 'bg-amber-500',
    resolved: 'bg-green-500'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-500'
}

const getPriorityColor = (priority: string) => {
  const colors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500'
  }
  return colors[priority as keyof typeof colors] || 'bg-gray-500'
}

const getCategoryIcon = (category: string) => {
  const icons = {
    'Awaria': '⚠️',
    'Konserwacja': '🔧',
    'Przegląd': '🔍',
    'Wydajność': '📊'
  }
  return icons[category as keyof typeof icons] || '📝'
}

const filteredReports = ref(reports.value)
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedPriority = ref('all')
const selectedCategory = ref('all')

// Sorting
const sortField = ref('reportedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

const statusOptions = ['all', 'new', 'in_progress', 'resolved']
const priorityOptions = ['all', 'high', 'medium', 'low']
const categoryOptions = ['all', 'Awaria', 'Konserwacja', 'Przegląd', 'Wydajność']

const sortReports = (field: string) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
  applyFilters()
}

const applyFilters = () => {
  let filtered = reports.value.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         report.device.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = selectedStatus.value === 'all' || report.status === selectedStatus.value
    const matchesPriority = selectedPriority.value === 'all' || report.priority === selectedPriority.value
    const matchesCategory = selectedCategory.value === 'all' || report.category === selectedCategory.value
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const normalizeSortValue = (val: unknown): string | number => {
    if (val == null) return ''
    if (typeof val === 'number') return val
    return String(val).toLowerCase()
  }

  filtered.sort((a, b) => {
    const aVal = normalizeSortValue(a[sortField.value as keyof Report])
    const bVal = normalizeSortValue(b[sortField.value as keyof Report])

    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    }
    return aVal < bVal ? 1 : -1
  })

  filteredReports.value = filtered
}

// Filter functions
const filterByStatus = (status: string) => {
  selectedStatus.value = status
  selectedPriority.value = 'all'
  selectedCategory.value = 'all'
  applyFilters()
}

const filterByPriority = (priority: string) => {
  selectedPriority.value = priority
  selectedStatus.value = 'all'
  selectedCategory.value = 'all'
  applyFilters()
}

const clearAllFilters = () => {
  selectedStatus.value = 'all'
  selectedPriority.value = 'all'
  selectedCategory.value = 'all'
  searchQuery.value = ''
  applyFilters()
}

const stats = ref({
  total: reports.value.length,
  new: reports.value.filter(r => r.status === 'new').length,
  inProgress: reports.value.filter(r => r.status === 'in_progress').length,
  resolved: reports.value.filter(r => r.status === 'resolved').length,
  highPriority: reports.value.filter(r => r.priority === 'high').length
})

const selectedReport = ref<Report | null>(null)
const showDetails = ref(false)
const showNewReport = ref(false)
const showEditReport = ref(false)

// Form for new report
const newReportForm = ref({
  title: '',
  device: '',
  deviceType: '',
  location: '',
  priority: 'medium',
  category: 'Awaria',
  description: '',
  reportedBy: 'Aktualny użytkownik',
  contact: '',
  isAnonymous: false,
  images: [] as string[],
  estimatedTime: '1 godzina'
})

const showAssignModal = ref(false)
const assignSaving = ref(false)
const assignTechnicianId = ref<number | null>(null)

const editReportForm = ref({
  status: 'pending',
  technicianId: null as number | null
})

const devices = [
  'Klimatyzacja A-101',
  'Klimatyzacja D-102',
  'Ogrzewanie B-205',
  'Ogrzewanie E-201',
  'Wentylacja C-301',
  'Wentylacja F-303'
]

const deviceTypes = ['Klimatyzacja', 'Ogrzewanie', 'Wentylacja']
const locations = [
  'Budynek A, piętro 1',
  'Budynek B, piętro 2',
  'Budynek C, piętro 3',
  'Budynek D, piętro 1',
  'Budynek E, piętro 2',
  'Budynek F, piętro 3'
]
const priorities = ['high', 'medium', 'low']
const categories = ['Awaria', 'Konserwacja', 'Przegląd', 'Wydajność']

// Technicians - now using shared composable
// technicians are imported from useTechnicians composable

// Drag & Drop state
const draggedReport = ref<Report | null>(null)
const dragOverTechnician = ref<string | null>(null)
const showAssignmentView = ref(false)

const startDrag = (report: Report) => {
  draggedReport.value = report
}

const onDragOver = (technicianId: string) => {
  dragOverTechnician.value = technicianId
}

const onDragLeave = () => {
  dragOverTechnician.value = null
}

const uiStatusToApi: Record<string, 'pending' | 'in_progress' | 'resolved'> = {
  new: 'pending',
  in_progress: 'in_progress',
  resolved: 'resolved'
}

const removeTechnicianAssignment = async (report: Report) => {
  if (!report.assignedUserId) return
  await unassignTechnicianFromDevice(report.deviceUuid, report.assignedUserId)
  if (report.status === 'in_progress') {
    await updateFaultStatus(report.faultId, 'pending')
  }
}

const assignReportToTechnician = async (
  report: Report,
  technicianId: number,
  options: { refresh?: boolean } = { refresh: true }
) => {
  if (report.assignedUserId && report.assignedUserId !== technicianId) {
    await unassignTechnicianFromDevice(report.deviceUuid, report.assignedUserId)
  }

  await assignTechnicianToDevice(report.deviceUuid, technicianId)

  if (report.status === 'new') {
    await updateFaultStatus(report.faultId, 'in_progress')
  }

  if (options.refresh) {
    await fetchReports()
  }
}

const onDrop = async (technicianApiId: number) => {
  if (!draggedReport.value) return

  assignSaving.value = true
  try {
    await assignReportToTechnician(draggedReport.value, technicianApiId)
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    alert(
      'Błąd przypisania technika: ' + (err.response?.data?.message || err.message || 'Nieznany błąd')
    )
  } finally {
    assignSaving.value = false
    draggedReport.value = null
    dragOverTechnician.value = null
  }
}

const openAssignModal = (report: Report) => {
  selectedReport.value = report
  assignTechnicianId.value = report.assignedUserId ?? null
  showAssignModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  assignTechnicianId.value = null
  if (!showDetails.value && !showEditReport.value) {
    selectedReport.value = null
  }
}

const saveAssignment = async () => {
  if (!selectedReport.value || assignTechnicianId.value === null) {
    alert('Wybierz technika')
    return
  }

  assignSaving.value = true
  try {
    await assignReportToTechnician(selectedReport.value, Number(assignTechnicianId.value))
    closeAssignModal()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    alert(
      'Błąd przypisania technika: ' + (err.response?.data?.message || err.message || 'Nieznany błąd')
    )
  } finally {
    assignSaving.value = false
  }
}

const unassignReport = async (report: Report) => {
  if (!report.assignedUserId) return
  if (!confirm(`Odpiąć zgłoszenie ${report.id} od technika ${report.assignedTo}?`)) return

  assignSaving.value = true
  try {
    await removeTechnicianAssignment(report)
    await fetchReports()
    closeAssignModal()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    alert('Błąd: ' + (err.response?.data?.message || err.message || 'Nieznany błąd'))
  } finally {
    assignSaving.value = false
  }
}

const toggleAssignmentView = () => {
  showAssignmentView.value = !showAssignmentView.value
}

const viewReportDetails = (report: Report) => {
  selectedReport.value = report
  showDetails.value = true
}

const closeDetails = () => {
  showDetails.value = false
  selectedReport.value = null
}

const showNewReportModal = () => {
  newReportForm.value = {
    title: '',
    device: '',
    deviceType: '',
    location: '',
    priority: 'medium',
    category: 'Awaria',
    description: '',
    reportedBy: 'Aktualny użytkownik',
    contact: '',
    isAnonymous: false,
    images: [],
    estimatedTime: '1 godzina'
  }
  showNewReport.value = true
}

const closeNewReportModal = () => {
  showNewReport.value = false
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return

  if (showAssignModal.value) {
    closeAssignModal()
    return
  }

  if (showEditReport.value) {
    closeEditReportModal()
    return
  }

  if (showNewReport.value) {
    closeNewReportModal()
    return
  }

  if (showDetails.value) {
    closeDetails()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  fetchTechnicians()
  fetchReports()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

const createNewReport = async () => {
  try {
    // Find device UUID from device name
    const deviceName = newReportForm.value.device
    const deviceResponse = await api.get('/devices')
    const devices = Array.isArray(deviceResponse.data) ? deviceResponse.data : deviceResponse.data.data || []
    const selectedDevice = devices.find((d: any) => d.name === deviceName || d.uuid === deviceName)
    
    if (!selectedDevice) {
      alert('Nie znaleziono urządzenia: ' + deviceName)
      return
    }
    
    const faultData = {
      title: newReportForm.value.title,
      description: newReportForm.value.description,
      reported_by: newReportForm.value.isAnonymous ? 'Anonimowy' : (newReportForm.value.reportedBy || 'Administrator'),
      contact: newReportForm.value.isAnonymous ? null : (newReportForm.value.contact || newReportForm.value.reportedBy || 'admin@example.com')
    }
    
    console.log('Creating fault for device:', selectedDevice.uuid, faultData)
    const response = await api.post(`/devices/${selectedDevice.uuid}/faults`, faultData)
    console.log('Fault created:', response.data)
    
    // Refresh reports list
    await fetchReports()
    
    closeNewReportModal()
  } catch (error: any) {
    console.error('Error creating report:', error)
    console.error('Error response:', error.response?.data)
    alert('Błąd podczas tworzenia zgłoszenia: ' + (error.response?.data?.message || error.message))
  }
}

const updateReportStatus = async (reportId: string, newStatus: string) => {
  try {
    const numericId = Number(reportId.replace('F-', ''))
    const apiStatus = uiStatusToApi[newStatus] ?? 'pending'
    await updateFaultStatus(numericId, apiStatus)
    await fetchReports()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    alert('Błąd podczas aktualizacji statusu: ' + (err.response?.data?.message || err.message))
  }
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        newReportForm.value.images.push(result)
      }
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index: number) => {
  newReportForm.value.images.splice(index, 1)
}

const showEditReportModal = (report: Report) => {
  selectedReport.value = report
  editReportForm.value = {
    status: uiStatusToApi[report.status] ?? 'pending',
    technicianId: report.assignedUserId ?? null
  }
  showEditReport.value = true
}

const closeEditReportModal = () => {
  showEditReport.value = false
  selectedReport.value = null
}

const saveEditReport = async () => {
  if (!selectedReport.value) return

  assignSaving.value = true
  try {
    const report = selectedReport.value
    const newTechnicianId = editReportForm.value.technicianId

    if (newTechnicianId && newTechnicianId !== report.assignedUserId) {
      await assignReportToTechnician(report, newTechnicianId, { refresh: false })
    } else if (!newTechnicianId && report.assignedUserId) {
      await removeTechnicianAssignment(report)
    }

    await updateFaultStatus(
      report.faultId,
      editReportForm.value.status as 'pending' | 'in_progress' | 'resolved'
    )
    await fetchReports()
    closeEditReportModal()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    alert('Błąd podczas edycji zgłoszenia: ' + (err.response?.data?.message || err.message))
  } finally {
    assignSaving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- API error banner -->
    <div
      v-if="apiError"
      class="bg-red-50 px-4 py-3 border border-red-200 rounded-lg text-red-800 text-sm"
    >
      {{ apiError }}
    </div>

    <!-- Header with stats -->
    <section>
      <h1 class="mb-6 font-bold text-slate-800 text-3xl">Panel zgłoszeń</h1>
      
      <!-- Stats Cards -->
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        <div 
          @click="clearAllFilters"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'all' && selectedPriority === 'all' && selectedCategory === 'all' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-blue-500 rounded-lg w-10 h-10 text-white">
              📝
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.total }}</div>
              <div class="text-gray-500 text-sm">Wszystkie zgłoszenia</div>
            </div>
          </div>
        </div>
        
        <div 
          @click="filterByStatus('new')"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'new' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-red-500 rounded-lg w-10 h-10 text-white">
              🆕
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.new }}</div>
              <div class="text-gray-500 text-sm">Nowe</div>
            </div>
          </div>
        </div>
        
        <div 
          @click="filterByStatus('in_progress')"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'in_progress' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-amber-500 rounded-lg w-10 h-10 text-white">
              ⚡
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.inProgress }}</div>
              <div class="text-gray-500 text-sm">W realizacji</div>
            </div>
          </div>
        </div>
        
        <div 
          @click="filterByStatus('resolved')"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'resolved' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-green-500 rounded-lg w-10 h-10 text-white">
              ✅
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.resolved }}</div>
              <div class="text-gray-500 text-sm">Rozwiązane</div>
            </div>
          </div>
        </div>
        
        <div 
          @click="filterByPriority('high')"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedPriority === 'high' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-red-600 rounded-lg w-10 h-10 text-white">
              🚨
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.highPriority }}</div>
              <div class="text-gray-500 text-sm">Wysoki priorytet</div>
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
              @input="applyFilters"
              type="text" 
              placeholder="Szukaj zgłoszenia..."
              class="py-2 pr-4 pl-10 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <span class="top-2.5 left-3 absolute text-gray-400">🔍</span>
          </div>
          
          <select 
            v-model="selectedStatus"
            @change="applyFilters"
            class="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="new">Nowe</option>
            <option value="in_progress">W realizacji</option>
            <option value="resolved">Rozwiązane</option>
          </select>
          
          <select 
            v-model="selectedPriority"
            @change="applyFilters"
            class="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie priorytety</option>
            <option value="high">Wysoki</option>
            <option value="medium">Średni</option>
            <option value="low">Niski</option>
          </select>
          
          <select 
            v-model="selectedCategory"
            @change="applyFilters"
            class="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie kategorie</option>
            <option v-for="category in categoryOptions.slice(1)" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div class="flex gap-2">
          <button 
            @click="toggleAssignmentView"
            class="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-white transition-colors"
            :class="{ 'ring-2 ring-purple-300': showAssignmentView }"
          >
            🎯 Przydział zadań
          </button>
          <button 
            @click="showNewReportModal"
            class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            + Nowe zgłoszenie
          </button>
        </div>
      </div>
    </section>

    <!-- Reports Table -->
    <section class="bg-white shadow-sm rounded-xl">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-gray-200 border-b">
              <th 
                @click="sortReports('id')" 
                class="hover:bg-gray-100 px-6 py-4 font-semibold text-gray-600 text-sm text-left transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-1">
                  ID
                  <span v-if="sortField === 'id'" class="text-blue-500">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th 
                @click="sortReports('title')" 
                class="hover:bg-gray-100 px-6 py-4 font-semibold text-gray-600 text-sm text-left transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-1">
                  Tytuł
                  <span v-if="sortField === 'title'" class="text-blue-500">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th 
                @click="sortReports('device')" 
                class="hover:bg-gray-100 px-6 py-4 font-semibold text-gray-600 text-sm text-left transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-1">
                  Urządzenie
                  <span v-if="sortField === 'device'" class="text-blue-500">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th 
                @click="sortReports('location')" 
                class="hover:bg-gray-100 px-6 py-4 font-semibold text-gray-600 text-sm text-left transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-1">
                  Lokalizacja
                  <span v-if="sortField === 'location'" class="text-blue-500">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th 
                @click="sortReports('category')" 
                class="hover:bg-gray-100 px-6 py-4 font-semibold text-gray-600 text-sm text-left transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-1">
                  Kategoria
                  <span v-if="sortField === 'category'" class="text-blue-500">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th 
                @click="sortReports('status')" 
                class="hover:bg-gray-100 px-6 py-4 font-semibold text-gray-600 text-sm text-left transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-1">
                  Status
                  <span v-if="sortField === 'status'" class="text-blue-500">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th 
                @click="sortReports('priority')" 
                class="hover:bg-gray-100 px-6 py-4 font-semibold text-gray-600 text-sm text-left transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-1">
                  Priorytet
                  <span v-if="sortField === 'priority'" class="text-blue-500">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th 
                @click="sortReports('assignedTo')" 
                class="hover:bg-gray-100 px-6 py-4 font-semibold text-gray-600 text-sm text-left transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-1">
                  Technik
                  <span v-if="sortField === 'assignedTo'" class="text-blue-500">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th 
                @click="sortReports('reportedBy')" 
                class="hover:bg-gray-100 px-6 py-4 font-semibold text-gray-600 text-sm text-left transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-1">
                  Zgłosił
                  <span v-if="sortField === 'reportedBy'" class="text-blue-500">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th 
                @click="sortReports('reportedAt')" 
                class="hover:bg-gray-100 px-6 py-4 font-semibold text-gray-600 text-sm text-left transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-1">
                  Data
                  <span v-if="sortField === 'reportedAt'" class="text-blue-500">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 font-semibold text-gray-600 text-sm text-left">Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="report in filteredReports" 
              :key="report.id"
              :draggable="showAssignmentView && report.status === 'new'"
              @dragstart="startDrag(report)"
              class="hover:bg-gray-50 border-gray-100 border-b transition-colors"
              :class="{ 
                'cursor-grab': showAssignmentView && report.status === 'new',
                'cursor-grabbing': showAssignmentView && draggedReport?.id === report.id,
                'opacity-50': draggedReport?.id === report.id
              }"
            >
              <td class="px-6 py-4 font-semibold text-slate-800 text-sm">{{ report.id }}</td>
              <td class="px-6 py-4">
                <div>
                  <div class="font-medium text-slate-800">{{ report.title }}</div>
                  <div class="text-gray-500 text-xs">{{ report.description.substring(0, 50) }}...</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="text-gray-400">{{ getCategoryIcon(report.deviceType) }}</span>
                  <div>
                    <div class="font-medium text-sm">{{ report.device }}</div>
                    <div class="text-gray-500 text-xs">{{ report.deviceType }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm">{{ report.location }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span>{{ getCategoryIcon(report.category) }}</span>
                  <span class="text-sm">{{ report.category }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  :class="getStatusColor(report.status)"
                  class="px-2 py-1 rounded-full font-medium text-white text-xs"
                >
                  {{ getStatusText(report.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span 
                  :class="getPriorityColor(report.priority)"
                  class="px-2 py-1 rounded-full font-medium text-white text-xs"
                >
                  {{ getPriorityText(report.priority) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <span v-if="report.assignedTo" class="font-medium text-slate-800">{{ report.assignedTo }}</span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-6 py-4 text-sm">{{ report.reportedBy }}</td>
              <td class="px-6 py-4 text-sm">{{ report.reportedAt }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button 
                    @click="viewReportDetails(report)"
                    class="hover:bg-gray-100 p-2 rounded transition-colors"
                    title="Szczegóły"
                  >
                    👁️
                  </button>
                  <button 
                    v-if="report.status !== 'resolved'"
                    @click="openAssignModal(report)"
                    class="hover:bg-purple-100 p-2 rounded text-purple-600 transition-colors"
                    title="Przypisz technika"
                  >
                    👨‍🔧
                  </button>
                  <button 
                    v-if="report.status === 'in_progress'"
                    @click="updateReportStatus(report.id, 'resolved')"
                    class="hover:bg-gray-100 p-2 rounded transition-colors"
                    title="Rozwiąż"
                  >
                    ✅
                  </button>
                  <button 
                    @click="showEditReportModal(report)"
                    class="hover:bg-blue-100 p-2 rounded text-blue-600 transition-colors"
                    title="Edytuj"
                  >
                    ✏️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredReports.length === 0" class="py-12 text-center">
        <div class="mb-4 text-6xl">📝</div>
        <h3 class="mb-2 font-semibold text-slate-800 text-lg">Nie znaleziono zgłoszeń</h3>
        <p class="text-gray-500">Spróbuj zmienić kryteria wyszukiwania</p>
      </div>
    </section>

    <!-- Report Details Modal -->
    <div v-if="showDetails" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50" @click="closeDetails">
      <div class="bg-white mx-4 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex justify-between items-start mb-6">
          <h2 class="font-bold text-slate-800 text-xl">Szczegóły zgłoszenia</h2>
          <button @click="closeDetails" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <div v-if="selectedReport" class="space-y-6">
          <!-- Header Info -->
          <div class="flex gap-4">
            <div class="flex-1">
              <div class="mb-1 text-gray-500 text-sm">ID zgłoszenia</div>
              <div class="font-semibold text-slate-800">{{ selectedReport.id }}</div>
            </div>
            <div class="flex-1">
              <div class="mb-1 text-gray-500 text-sm">Status</div>
              <span 
                :class="getStatusColor(selectedReport.status)"
                class="px-3 py-1 rounded-full font-medium text-white text-sm"
              >
                {{ getStatusText(selectedReport.status) }}
              </span>
            </div>
            <div class="flex-1">
              <div class="mb-1 text-gray-500 text-sm">Priorytet</div>
              <span 
                :class="getPriorityColor(selectedReport.priority)"
                class="px-3 py-1 rounded-full font-medium text-white text-sm"
              >
                {{ getPriorityText(selectedReport.priority) }}
              </span>
            </div>
          </div>
          
          <!-- Title and Description -->
          <div>
            <div class="mb-2 text-gray-500 text-sm">Tytuł</div>
            <h3 class="mb-4 font-semibold text-slate-800 text-lg">{{ selectedReport.title }}</h3>
            
            <div class="mb-2 text-gray-500 text-sm">Opis</div>
            <p class="text-gray-700">{{ selectedReport.description }}</p>
          </div>
          
          <!-- Device Info -->
          <div class="gap-4 grid grid-cols-2">
            <div>
              <div class="mb-1 text-gray-500 text-sm">Urządzenie</div>
              <div class="font-medium">{{ selectedReport.device }}</div>
            </div>
            <div>
              <div class="mb-1 text-gray-500 text-sm">Typ urządzenia</div>
              <div class="font-medium">{{ selectedReport.deviceType }}</div>
            </div>
            <div>
              <div class="mb-1 text-gray-500 text-sm">Lokalizacja</div>
              <div class="font-medium">{{ selectedReport.location }}</div>
            </div>
            <div>
              <div class="mb-1 text-gray-500 text-sm">Kategoria</div>
              <div class="flex items-center gap-2">
                <span>{{ getCategoryIcon(selectedReport.category) }}</span>
                <span class="font-medium">{{ selectedReport.category }}</span>
              </div>
            </div>
          </div>
          
          <!-- People Info -->
          <div class="gap-4 grid grid-cols-2">
            <div>
              <div class="mb-1 text-gray-500 text-sm">Zgłosił</div>
              <div class="font-medium">{{ selectedReport.reportedBy }}</div>
            </div>
            <div>
              <div class="mb-1 text-gray-500 text-sm">Przypisany do</div>
              <div class="font-medium">{{ selectedReport.assignedTo || 'Nieprzypisany' }}</div>
            </div>
          </div>
          
          <!-- Time Info -->
          <div class="gap-4 grid grid-cols-3">
            <div>
              <div class="mb-1 text-gray-500 text-sm">Data zgłoszenia</div>
              <div class="font-medium">{{ selectedReport.reportedAt }}</div>
            </div>
            <div>
              <div class="mb-1 text-gray-500 text-sm">Szacowany czas</div>
              <div class="font-medium">{{ selectedReport.estimatedTime }}</div>
            </div>
            <div>
              <div class="mb-1 text-gray-500 text-sm">Ostatnia aktualizacja</div>
              <div class="font-medium">{{ selectedReport.updatedAt }}</div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex flex-wrap gap-3 pt-4 border-t">
            <button 
              v-if="selectedReport.status !== 'resolved'"
              @click="openAssignModal(selectedReport)"
              class="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-white transition-colors"
            >
              Przypisz technika
            </button>
            <button 
              v-if="selectedReport.assignedUserId"
              @click="unassignReport(selectedReport)"
              class="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
            >
              Odepnij technika
            </button>
            <button 
              v-if="selectedReport.status === 'in_progress'"
              @click="updateReportStatus(selectedReport.id, 'resolved')"
              class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white transition-colors"
            >
              Oznacz jako rozwiązane
            </button>
            <button 
              @click="showEditReportModal(selectedReport)"
              class="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
            >
              Edytuj zgłoszenie
            </button>
            <button class="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors">
              Drukuj
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Report Modal -->
    <div v-if="showNewReport" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50" @click="closeNewReportModal">
      <div class="bg-white mx-4 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex justify-between items-start mb-6">
          <h2 class="font-bold text-slate-800 text-xl">Nowe zgłoszenie</h2>
          <button @click="closeNewReportModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <form @submit.prevent="createNewReport" class="space-y-4">
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Tytuł *</label>
              <input 
                v-model="newReportForm.title" 
                type="text" 
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="np. Klimatyzacja nie chłodzi"
              >
            </div>
            
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Urządzenie *</label>
              <select 
                v-model="newReportForm.device" 
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="">Wybierz urządzenie</option>
                <option v-for="device in devices" :key="device" :value="device">{{ device }}</option>
              </select>
            </div>
            
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Typ urządzenia *</label>
              <select 
                v-model="newReportForm.deviceType" 
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="">Wybierz typ</option>
                <option v-for="type in deviceTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Lokalizacja *</label>
              <select 
                v-model="newReportForm.location" 
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="">Wybierz lokalizację</option>
                <option v-for="location in locations" :key="location" :value="location">{{ location }}</option>
              </select>
            </div>
            
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Priorytet *</label>
              <select 
                v-model="newReportForm.priority" 
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="high">Wysoki</option>
                <option value="medium">Średni</option>
                <option value="low">Niski</option>
              </select>
            </div>
            
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Kategoria *</label>
              <select 
                v-model="newReportForm.category" 
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Opis *</label>
            <textarea 
              v-model="newReportForm.description" 
              rows="4" 
              required
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              placeholder="Szczegółowy opis problemu..."
            ></textarea>
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Zdjęcia (opcjonalne)</label>
            <div class="p-4 border-2 border-gray-300 border-dashed rounded-lg">
              <input 
                type="file" 
                accept="image/*" 
                multiple
                @change="handleImageUpload"
                class="w-full"
              >
              <p class="mt-2 text-gray-500 text-sm">Możesz dodać kilka zdjęć dokumentujących problem</p>
              <div v-if="newReportForm.images.length > 0" class="flex flex-wrap gap-2 mt-3">
                <div v-for="(img, idx) in newReportForm.images" :key="idx" class="relative">
                  <img :src="img" class="rounded w-20 h-20 object-cover">
                  <button 
                    @click="removeImage(idx)"
                    class="-top-2 -right-2 absolute bg-red-500 rounded-full w-5 h-5 text-white text-xs"
                  >✕</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isAnonymous"
              v-model="newReportForm.isAnonymous"
              class="rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
            >
            <label for="isAnonymous" class="font-medium text-gray-700 text-sm">Zgłoś anonimowo</label>
          </div>
          
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2" v-if="!newReportForm.isAnonymous">
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Zgłaszający</label>
              <input 
                v-model="newReportForm.reportedBy" 
                type="text" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
            </div>
            
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Kontakt (email/telefon)</label>
              <input 
                v-model="newReportForm.contact" 
                type="text" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="email@example.com lub +48 123 456 789"
              >
            </div>
          </div>
          
          <div v-if="!newReportForm.isAnonymous">
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Szacowany czas</label>
              <input 
                v-model="newReportForm.estimatedTime" 
                type="text" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="np. 2 godziny"
              >
            </div>
          </div>
          
          <div class="flex gap-3 pt-4 border-t">
            <button 
              type="submit" 
              class="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg text-white transition-colors"
            >
              📝 Utwórz zgłoszenie
            </button>
            <button 
              type="button" 
              @click="closeNewReportModal"
              class="hover:bg-gray-50 px-6 py-2 border border-gray-300 rounded-lg transition-colors"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Report Modal -->
    <div v-if="showEditReport" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50" @click="closeEditReportModal">
      <div class="bg-white mx-4 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex justify-between items-start mb-6">
          <h2 class="font-bold text-slate-800 text-xl">Edytuj zgłoszenie</h2>
          <button @click="closeEditReportModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <form @submit.prevent="saveEditReport" class="space-y-4">
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Technik</label>
            <select 
              v-model="editReportForm.technicianId"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              :disabled="techniciansLoading || technicians.length === 0"
            >
              <option :value="null">— Nieprzypisany —</option>
              <option v-for="tech in technicians" :key="tech.id" :value="tech.apiId">
                {{ tech.name }}
              </option>
            </select>
            <p v-if="technicians.length === 0" class="mt-1 text-amber-600 text-xs">
              Brak techników serwisowych w systemie (użytkownicy z rolą is_service)
            </p>
          </div>
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Status *</label>
            <select 
              v-model="editReportForm.status" 
              required
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
              <option value="pending">Nowe</option>
              <option value="in_progress">W realizacji</option>
              <option value="resolved">Rozwiązane</option>
            </select>
          </div>
          
          <div class="bg-gray-50 p-3 rounded-lg text-gray-600 text-sm">
            <p><strong>Tytuł:</strong> {{ selectedReport?.title }}</p>
            <p class="mt-1"><strong>Opis:</strong> {{ selectedReport?.description }}</p>
          </div>
          
          <div class="flex gap-3 pt-4 border-t">
            <button 
              type="submit" 
              :disabled="assignSaving"
              class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 px-6 py-2 rounded-lg text-white transition-colors"
            >
              {{ assignSaving ? 'Zapisywanie...' : 'Zapisz zmiany' }}
            </button>
            <button 
              type="button" 
              @click="closeEditReportModal"
              class="hover:bg-gray-50 px-6 py-2 border border-gray-300 rounded-lg transition-colors"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Assign Technician Modal -->
    <div v-if="showAssignModal && selectedReport" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50" @click="closeAssignModal">
      <div class="bg-white mx-4 p-6 rounded-xl w-full max-w-md" @click.stop>
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="font-bold text-slate-800 text-xl">Przypisz technika</h2>
            <p class="mt-1 text-gray-500 text-sm">{{ selectedReport.id }} — {{ selectedReport.title }}</p>
          </div>
          <button @click="closeAssignModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Technik serwisowy *</label>
            <select
              v-model="assignTechnicianId"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
              :disabled="techniciansLoading || technicians.length === 0"
            >
              <option :value="null">Wybierz technika</option>
              <option v-for="tech in technicians" :key="tech.id" :value="tech.apiId">
                {{ tech.name }}
              </option>
            </select>
          </div>

          <p class="text-gray-500 text-xs">
            Technik zostanie powiązany z urządzeniem tego zgłoszenia. Status zmieni się na „W realizacji”.
          </p>

          <div class="flex flex-wrap gap-3 pt-2">
            <button
              @click="saveAssignment"
              :disabled="assignSaving || assignTechnicianId === null"
              class="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 px-4 py-2 rounded-lg text-white transition-colors"
            >
              {{ assignSaving ? 'Przypisywanie...' : 'Przypisz' }}
            </button>
            <button
              v-if="selectedReport.assignedUserId"
              type="button"
              @click="unassignReport(selectedReport)"
              :disabled="assignSaving"
              class="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
            >
              Odepnij
            </button>
            <button
              type="button"
              @click="closeAssignModal"
              class="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assignment View with Drag & Drop -->
    <div v-if="showAssignmentView" class="right-0 z-40 fixed inset-y-0 bg-white shadow-2xl w-full max-w-md overflow-hidden">
      <div class="flex flex-col h-full">
        <div class="flex justify-between items-center p-6 border-gray-200 border-b">
          <div>
            <h2 class="font-semibold text-slate-800 text-xl">🎯 Przydział zadań</h2>
            <p class="text-gray-500 text-sm">Przeciągnij zgłoszenie na technika</p>
          </div>
          <button @click="toggleAssignmentView" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <div class="flex-1 p-6 overflow-y-auto">
          <!-- Technicians List -->
          <div v-if="techniciansLoading" class="py-8 text-gray-500 text-center">
            Ładowanie techników...
          </div>
          <div v-else-if="technicians.length === 0" class="py-8 text-gray-500 text-center">
            Brak techników serwisowych w systemie
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="tech in technicians"
              :key="tech.id"
              @dragover.prevent="onDragOver(tech.id)"
              @dragleave="onDragLeave"
              @drop.prevent="onDrop(tech.apiId)"
              class="p-4 border-2 rounded-xl transition-all"
              :class="{
                'border-purple-500 bg-purple-50 ring-2 ring-purple-200': dragOverTechnician === tech.id,
                'border-gray-200 hover:border-gray-300': dragOverTechnician !== tech.id
              }"
            >
              <div class="flex items-center gap-3">
                <div class="text-3xl">{{ tech.avatar }}</div>
                <div class="flex-1">
                  <h3 class="font-semibold text-slate-800">{{ tech.name }}</h3>
                  <p class="text-gray-500 text-sm">{{ tech.role }}</p>
                </div>
                <div 
                  class="px-3 py-1 rounded-full font-medium text-sm"
                  :class="tech.activeReports > 2 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'"
                >
                  {{ tech.activeReports }} zadań
                </div>
              </div>
            </div>
          </div>
          
          <!-- Instructions -->
          <div class="bg-blue-50 mt-6 p-4 border border-blue-200 rounded-lg">
            <h4 class="mb-2 font-medium text-blue-800">Jak przypisać zgłoszenie:</h4>
            <ol class="space-y-1 text-blue-600 text-sm">
              <li>1. Przeciągnij zgłoszenie z tabeli</li>
              <li>2. Upuść na wybranego technika</li>
              <li>3. Zgłoszenie zostanie automatycznie przypisane</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
