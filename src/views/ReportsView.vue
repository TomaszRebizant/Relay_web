<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useTechnicians, technicians } from '@/composables/useTechnicians'

// Use shared technicians composable
const { incrementActiveReports } = useTechnicians()

interface Report {
  id: string
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
  estimatedTime: string
  createdAt: string
  updatedAt: string
}

const reports = ref<Report[]>([
  {
    id: 'R-001',
    title: 'Klimatyzacja nie chłodzi',
    device: 'Klimatyzacja A-101',
    deviceType: 'Klimatyzacja',
    location: 'Budynek A, piętro 1',
    status: 'new',
    priority: 'high',
    category: 'Awaria',
    description: 'Urządzenie przestało chłodzić, temperatura w pomieszczeniu wzrosła do 28°C',
    reportedBy: 'Jan Kowalski',
    reportedAt: '2024-03-02 14:30',
    assignedTo: '',
    estimatedTime: '2 godziny',
    createdAt: '2024-03-02 14:30',
    updatedAt: '2024-03-02 14:30'
  },
  {
    id: 'R-002',
    title: 'Hałas z wentylacji',
    device: 'Wentylacja C-301',
    deviceType: 'Wentylacja',
    location: 'Budynek C, piętro 3',
    status: 'in_progress',
    priority: 'medium',
    category: 'Konserwacja',
    description: 'Nienaturalny hałas podczas pracy wentylacji, prawdopodobnie zużyty łożysko',
    reportedBy: 'Anna Nowak',
    reportedAt: '2024-03-02 13:15',
    assignedTo: 'Piotr Wiśniewski',
    estimatedTime: '4 godziny',
    createdAt: '2024-03-02 13:15',
    updatedAt: '2024-03-02 15:45'
  },
  {
    id: 'R-003',
    title: 'Przegląd okresowy ogrzewania',
    device: 'Ogrzewanie B-205',
    deviceType: 'Ogrzewanie',
    location: 'Budynek B, piętro 2',
    status: 'resolved',
    priority: 'low',
    category: 'Przegląd',
    description: 'Planowy przegląd okresowy systemu ogrzewania przed sezonem letnim',
    reportedBy: 'System',
    reportedAt: '2024-03-02 11:45',
    assignedTo: 'Marek Kowalczyk',
    estimatedTime: '1 godzina',
    createdAt: '2024-03-02 11:45',
    updatedAt: '2024-03-02 16:20'
  },
  {
    id: 'R-004',
    title: 'Wyciek wody z klimatyzacji',
    device: 'Klimatyzacja D-102',
    deviceType: 'Klimatyzacja',
    location: 'Budynek D, piętro 1',
    status: 'new',
    priority: 'high',
    category: 'Awaria',
    description: 'Aktywne wyciekanie wody z jednostki wewnętrznej, zagrożenie dla sprzętu elektronicznego',
    reportedBy: 'Ewa Dąbrowska',
    reportedAt: '2024-03-02 16:00',
    assignedTo: '',
    estimatedTime: '3 godziny',
    createdAt: '2024-03-02 16:00',
    updatedAt: '2024-03-02 16:00'
  },
  {
    id: 'R-005',
    title: 'Niska wydajność ogrzewania',
    device: 'Ogrzewanie E-201',
    deviceType: 'Ogrzewanie',
    location: 'Budynek E, piętro 2',
    status: 'in_progress',
    priority: 'medium',
    category: 'Wydajność',
    description: 'System grzeje słabiej niż zwykle, temperatura docelowa nie jest osiągana',
    reportedBy: 'Tomasz Zieliński',
    reportedAt: '2024-03-02 10:30',
    assignedTo: 'Krzysztof Jankowski',
    estimatedTime: '2 godziny',
    createdAt: '2024-03-02 10:30',
    updatedAt: '2024-03-02 14:15'
  }
])

const getStatusText = (status: string) => {
  const statusMap = {
    new: 'Nowe',
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

  // Apply sorting
  filtered.sort((a, b) => {
    let aVal = a[sortField.value as keyof typeof a]
    let bVal = b[sortField.value as keyof typeof b]
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = (bVal as string).toLowerCase()
    }
    
    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
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
  estimatedTime: '1 godzina'
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

const onDrop = (technicianId: string, technicianName: string) => {
  if (draggedReport.value) {
    const dragged = draggedReport.value
    // Update the report assignment
    const reportIndex = reports.value.findIndex(r => r.id === dragged.id)
    if (reportIndex !== -1) {
      const report = reports.value[reportIndex]
      if (report) {
        report.assignedTo = technicianName
        report.status = 'in_progress'
        report.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
      }
      
      // Update technician active reports count using shared composable
      incrementActiveReports(technicianId)
      
      applyFilters()
    }
    draggedReport.value = null
    dragOverTechnician.value = null
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
    estimatedTime: '1 godzina'
  }
  showNewReport.value = true
}

const closeNewReportModal = () => {
  showNewReport.value = false
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return

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
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

const createNewReport = () => {
  const newId = `R-${String(reports.value.length + 1).padStart(3, '0')}`
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  
  const newReport = {
    id: newId,
    title: newReportForm.value.title,
    device: newReportForm.value.device,
    deviceType: newReportForm.value.deviceType,
    location: newReportForm.value.location,
    status: 'new',
    priority: newReportForm.value.priority,
    category: newReportForm.value.category,
    description: newReportForm.value.description,
    reportedBy: newReportForm.value.reportedBy,
    reportedAt: now,
    assignedTo: '',
    estimatedTime: newReportForm.value.estimatedTime,
    createdAt: now,
    updatedAt: now
  }
  
  reports.value.unshift(newReport)
  applyFilters()
  
  // Update stats
  stats.value = {
    total: reports.value.length,
    new: reports.value.filter(r => r.status === 'new').length,
    inProgress: reports.value.filter(r => r.status === 'in_progress').length,
    resolved: reports.value.filter(r => r.status === 'resolved').length,
    highPriority: reports.value.filter(r => r.priority === 'high').length
  }
  
  closeNewReportModal()
}

const updateReportStatus = (reportId: string, newStatus: string) => {
  const report = reports.value.find(r => r.id === reportId)
  if (report) {
    report.status = newStatus
    report.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
    applyFilters()
    
    // Update stats
    stats.value = {
      total: reports.value.length,
      new: reports.value.filter(r => r.status === 'new').length,
      inProgress: reports.value.filter(r => r.status === 'in_progress').length,
      resolved: reports.value.filter(r => r.status === 'resolved').length,
      highPriority: reports.value.filter(r => r.priority === 'high').length
    }
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
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
                    v-if="report.status === 'new'"
                    @click="updateReportStatus(report.id, 'in_progress')"
                    class="hover:bg-gray-100 p-2 rounded transition-colors"
                    title="Przypisz"
                  >
                    📝
                  </button>
                  <button 
                    v-if="report.status === 'in_progress'"
                    @click="updateReportStatus(report.id, 'resolved')"
                    class="hover:bg-gray-100 p-2 rounded transition-colors"
                    title="Rozwiąż"
                  >
                    ✅
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
          <div class="flex gap-3 pt-4 border-t">
            <button 
              v-if="selectedReport.status === 'new'"
              @click="updateReportStatus(selectedReport.id, 'in_progress')"
              class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
            >
              Przypisz i rozpocznij
            </button>
            <button 
              v-if="selectedReport.status === 'in_progress'"
              @click="updateReportStatus(selectedReport.id, 'resolved')"
              class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white transition-colors"
            >
              Oznacz jako rozwiązane
            </button>
            <button class="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors">
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
          
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Zgłaszający</label>
              <input 
                v-model="newReportForm.reportedBy" 
                type="text" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
            </div>
            
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
          <div class="space-y-4">
            <div
              v-for="tech in technicians"
              :key="tech.id"
              @dragover.prevent="onDragOver(tech.id)"
              @dragleave="onDragLeave"
              @drop.prevent="onDrop(tech.id, tech.name)"
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
