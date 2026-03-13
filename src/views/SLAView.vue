<script setup lang="ts">
import { ref, computed } from 'vue'

// SLA Target times (in hours)
const SLA_TARGETS = {
  high: 4,    // 4 hours for high priority
  medium: 24, // 24 hours for medium priority
  low: 72     // 72 hours (3 days) for low priority
}

interface SLAReport {
  id: string
  title: string
  device: string
  location: string
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'new' | 'in_progress' | 'resolved' | 'escalated'
  reportedAt: string
  resolvedAt: string | null
  assignedTo: string
  estimatedTime: string
  actualTime: number | null // in hours
  slaTarget: number // in hours
  slaStatus: 'met' | 'breached' | 'at_risk' | 'pending'
  timeRemaining: number | null // in hours, negative if breached
}

// Sample reports with SLA data
const reports = ref<SLAReport[]>([
  {
    id: 'R-001',
    title: 'Klimatyzacja nie chłodzi',
    device: 'Klimatyzacja A-101',
    location: 'Budynek A, piętro 1',
    priority: 'high',
    category: 'Awaria',
    status: 'resolved',
    reportedAt: '2024-03-02 10:00',
    resolvedAt: '2024-03-02 13:30',
    assignedTo: 'Piotr Wiśniewski',
    estimatedTime: '2 godziny',
    actualTime: 3.5,
    slaTarget: SLA_TARGETS.high,
    slaStatus: 'met',
    timeRemaining: 0.5
  },
  {
    id: 'R-002',
    title: 'Hałas z wentylacji',
    device: 'Wentylacja C-301',
    location: 'Budynek C, piętro 3',
    priority: 'medium',
    category: 'Konserwacja',
    status: 'resolved',
    reportedAt: '2024-03-01 09:00',
    resolvedAt: '2024-03-02 11:00',
    assignedTo: 'Tomasz Lewandowski',
    estimatedTime: '4 godziny',
    actualTime: 26,
    slaTarget: SLA_TARGETS.medium,
    slaStatus: 'breached',
    timeRemaining: -2
  },
  {
    id: 'R-003',
    title: 'Wyciek wody z klimatyzacji',
    device: 'Klimatyzacja D-102',
    location: 'Budynek D, piętro 1',
    priority: 'high',
    category: 'Awaria',
    status: 'in_progress',
    reportedAt: '2024-03-02 16:00',
    resolvedAt: null,
    assignedTo: 'Jan Kowalski',
    estimatedTime: '3 godziny',
    actualTime: 2,
    slaTarget: SLA_TARGETS.high,
    slaStatus: 'at_risk',
    timeRemaining: 2
  },
  {
    id: 'R-004',
    title: 'Przegląd okresowy ogrzewania',
    device: 'Ogrzewanie B-205',
    location: 'Budynek B, piętro 2',
    priority: 'low',
    category: 'Przegląd',
    status: 'new',
    reportedAt: '2024-03-02 08:00',
    resolvedAt: null,
    assignedTo: '',
    estimatedTime: '1 godzina',
    actualTime: null,
    slaTarget: SLA_TARGETS.low,
    slaStatus: 'pending',
    timeRemaining: 64
  },
  {
    id: 'R-005',
    title: 'Niska wydajność ogrzewania',
    device: 'Ogrzewanie E-201',
    location: 'Budynek E, piętro 2',
    priority: 'medium',
    category: 'Wydajność',
    status: 'escalated',
    reportedAt: '2024-03-01 14:00',
    resolvedAt: null,
    assignedTo: 'Krzysztof Jankowski',
    estimatedTime: '2 godziny',
    actualTime: 28,
    slaTarget: SLA_TARGETS.medium,
    slaStatus: 'breached',
    timeRemaining: -4
  },
  {
    id: 'R-006',
    title: 'Awaria wentylacji',
    device: 'Wentylacja F-303',
    location: 'Budynek F, piętro 3',
    priority: 'high',
    category: 'Awaria',
    status: 'resolved',
    reportedAt: '2024-03-02 11:00',
    resolvedAt: '2024-03-02 14:15',
    assignedTo: 'Magdalena Zielińska',
    estimatedTime: '3 godziny',
    actualTime: 3.25,
    slaTarget: SLA_TARGETS.high,
    slaStatus: 'met',
    timeRemaining: 0.75
  }
])

const selectedTimeRange = ref('7days')
const selectedPriority = ref('all')
const selectedStatus = ref('all')

const timeRanges = [
  { value: '24h', label: 'Ostatnie 24h' },
  { value: '7days', label: 'Ostatnie 7 dni' },
  { value: '30days', label: 'Ostatnie 30 dni' },
  { value: '90days', label: 'Ostatnie 90 dni' }
]

// Statistics
const stats = computed(() => {
  const filtered = filteredReports.value
  const total = filtered.length
  const met = filtered.filter(r => r.slaStatus === 'met').length
  const breached = filtered.filter(r => r.slaStatus === 'breached').length
  const atRisk = filtered.filter(r => r.slaStatus === 'at_risk').length
  const pending = filtered.filter(r => r.slaStatus === 'pending').length
  
  const complianceRate = total > 0 ? Math.round((met / total) * 100) : 0
  
  const avgResolutionTime = filtered
    .filter(r => r.actualTime !== null)
    .reduce((sum, r) => sum + (r.actualTime || 0), 0) / 
    filtered.filter(r => r.actualTime !== null).length || 0
  
  return { total, met, breached, atRisk, pending, complianceRate, avgResolutionTime }
})

// SLA Trend (mock data for chart)
const slaTrend = ref([
  { date: '01.03', met: 12, breached: 2 },
  { date: '02.03', met: 8, breached: 1 },
  { date: '03.03', met: 15, breached: 3 },
  { date: '04.03', met: 10, breached: 0 },
  { date: '05.03', met: 11, breached: 2 },
  { date: '06.03', met: 9, breached: 1 },
  { date: '07.03', met: 7, breached: 2 }
])

// Filter reports
const filteredReports = computed(() => {
  let filtered = reports.value
  
  if (selectedPriority.value !== 'all') {
    filtered = filtered.filter(r => r.priority === selectedPriority.value)
  }
  
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(r => r.status === selectedStatus.value)
  }
  
  // Filter by time range (simplified for demo)
  const now = new Date()
  let cutoffDate = new Date()
  
  switch (selectedTimeRange.value) {
    case '24h':
      cutoffDate.setDate(now.getDate() - 1)
      break
    case '7days':
      cutoffDate.setDate(now.getDate() - 7)
      break
    case '30days':
      cutoffDate.setDate(now.getDate() - 30)
      break
    case '90days':
      cutoffDate.setDate(now.getDate() - 90)
      break
  }
  
  return filtered.filter(r => new Date(r.reportedAt) >= cutoffDate)
})

const getPriorityLabel = (priority: string) => {
  const labels = { high: 'Wysoki', medium: 'Średni', low: 'Niski' }
  return labels[priority as keyof typeof labels] || priority
}

const getPriorityColor = (priority: string) => {
  const colors = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-green-500' }
  return colors[priority as keyof typeof colors] || 'bg-gray-500'
}

const getSLAStatusColor = (status: string) => {
  const colors = {
    met: 'bg-green-500',
    breached: 'bg-red-500',
    at_risk: 'bg-amber-500',
    pending: 'bg-gray-500'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-500'
}

const getSLAStatusLabel = (status: string) => {
  const labels = {
    met: 'Spełniony',
    breached: 'Przekroczony',
    at_risk: 'Ryzyko',
    pending: 'Oczekujący'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusLabel = (status: string) => {
  const labels = {
    new: 'Nowe',
    in_progress: 'W trakcie',
    resolved: 'Rozwiązane',
    escalated: 'Eskalowane'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusColor = (status: string) => {
  const colors = {
    new: 'bg-red-500',
    in_progress: 'bg-amber-500',
    resolved: 'bg-green-500',
    escalated: 'bg-purple-500'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-500'
}

const formatTime = (hours: number) => {
  if (hours < 0) return `-${Math.abs(hours).toFixed(1)}h`
  return `${hours.toFixed(1)}h`
}

const formatDuration = (hours: number) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`
  } else if (hours < 24) {
    return `${hours.toFixed(1)} godz.`
  } else {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days} d ${remainingHours.toFixed(0)}h`
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <section>
      <h1 class="mb-2 font-bold text-slate-800 text-3xl">SLA Monitoring</h1>
      <p class="text-gray-600">Monitorowanie poziomu usług - czas rozwiązywania zgłoszeń</p>
    </section>

    <!-- SLA Overview Cards -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="bg-white shadow-sm p-4 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="flex justify-center items-center bg-blue-500 rounded-lg w-10 h-10 text-white text-lg">📊</div>
          <div>
            <div class="font-bold text-slate-800 text-2xl">{{ stats.total }}</div>
            <div class="text-gray-500 text-sm">Wszystkie zgłoszenia</div>
          </div>
        </div>
      </div>
      <div class="bg-white shadow-sm p-4 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="flex justify-center items-center bg-green-500 rounded-lg w-10 h-10 text-white text-lg">✅</div>
          <div>
            <div class="font-bold text-slate-800 text-2xl">{{ stats.met }}</div>
            <div class="text-gray-500 text-sm">SLA spełniony</div>
          </div>
        </div>
      </div>
      <div class="bg-white shadow-sm p-4 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="flex justify-center items-center bg-red-500 rounded-lg w-10 h-10 text-white text-lg">❌</div>
          <div>
            <div class="font-bold text-slate-800 text-2xl">{{ stats.breached }}</div>
            <div class="text-gray-500 text-sm">SLA przekroczony</div>
          </div>
        </div>
      </div>
      <div class="bg-white shadow-sm p-4 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="flex justify-center items-center bg-amber-500 rounded-lg w-10 h-10 text-white text-lg">⚠️</div>
          <div>
            <div class="font-bold text-slate-800 text-2xl">{{ stats.atRisk }}</div>
            <div class="text-gray-500 text-sm">Ryzyko przekroczenia</div>
          </div>
        </div>
      </div>
      <div class="bg-white shadow-sm p-4 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="flex justify-center items-center bg-purple-500 rounded-lg w-10 h-10 text-white text-lg">📈</div>
          <div>
            <div class="font-bold text-slate-800 text-2xl">{{ stats.complianceRate }}%</div>
            <div class="text-gray-500 text-sm">Wskaźnik zgodności</div>
          </div>
        </div>
      </div>
    </section>

    <!-- SLA Targets Info -->
    <section class="bg-white shadow-sm p-4 rounded-xl">
      <h3 class="mb-4 font-semibold text-slate-800 text-lg">Targety SLA</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span class="bg-red-500 px-3 py-1 rounded-full text-white text-xs font-bold">WYSOKI</span>
          <span class="font-semibold text-slate-800">{{ SLA_TARGETS.high }} godziny</span>
          <span class="text-gray-500 text-sm">(Priorytet krytyczny)</span>
        </div>
        <div class="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <span class="bg-amber-500 px-3 py-1 rounded-full text-white text-xs font-bold">ŚREDNI</span>
          <span class="font-semibold text-slate-800">{{ SLA_TARGETS.medium }} godziny</span>
          <span class="text-gray-500 text-sm">(1 dzień roboczy)</span>
        </div>
        <div class="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <span class="bg-green-500 px-3 py-1 rounded-full text-white text-xs font-bold">NISKI</span>
          <span class="font-semibold text-slate-800">{{ SLA_TARGETS.low }} godziny</span>
          <span class="text-gray-500 text-sm">(3 dni robocze)</span>
        </div>
      </div>
    </section>

    <!-- SLA Trend Chart -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <h3 class="mb-4 font-semibold text-slate-800 text-lg">Trend SLA (ostatnie 7 dni)</h3>
      <div class="h-48 flex items-end gap-2">
        <div 
          v-for="(day, index) in slaTrend" 
          :key="index"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <div class="w-full flex gap-0.5 h-32">
            <div 
              class="flex-1 bg-green-500 rounded-t transition-all"
              :style="{ height: (day.met / 20 * 100) + '%' }"
            ></div>
            <div 
              class="flex-1 bg-red-500 rounded-t transition-all"
              :style="{ height: (day.breached / 20 * 100) + '%' }"
            ></div>
          </div>
          <div class="text-gray-500 text-xs">{{ day.date }}</div>
        </div>
      </div>
      <div class="flex justify-center gap-6 mt-4">
        <div class="flex items-center gap-2">
          <div class="bg-green-500 rounded-full w-3 h-3"></div>
          <span class="text-gray-600 text-sm">SLA spełniony</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="bg-red-500 rounded-full w-3 h-3"></div>
          <span class="text-gray-600 text-sm">SLA przekroczony</span>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section class="bg-white shadow-sm p-4 rounded-xl">
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <label class="font-medium text-gray-700 text-sm">Okres:</label>
          <select 
            v-model="selectedTimeRange"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="range in timeRanges" :key="range.value" :value="range.value">
              {{ range.label }}
            </option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="font-medium text-gray-700 text-sm">Priorytet:</label>
          <select 
            v-model="selectedPriority"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie</option>
            <option value="high">Wysoki</option>
            <option value="medium">Średni</option>
            <option value="low">Niski</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="font-medium text-gray-700 text-sm">Status:</label>
          <select 
            v-model="selectedStatus"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie</option>
            <option value="new">Nowe</option>
            <option value="in_progress">W trakcie</option>
            <option value="resolved">Rozwiązane</option>
            <option value="escalated">Eskalowane</option>
          </select>
        </div>
      </div>
    </section>

    <!-- SLA Reports Table -->
    <section class="bg-white shadow-sm rounded-xl overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h2 class="font-semibold text-slate-800 text-xl">Szczegółowy raport SLA</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">ID</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Zgłoszenie</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Priorytet</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Status</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Cel SLA</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Rzeczywisty czas</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Status SLA</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Przypisane do</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="report in filteredReports" 
              :key="report.id"
              class="hover:bg-gray-50 border-b border-gray-100 transition-colors"
              :class="{ 'bg-red-50': report.slaStatus === 'breached' }"
            >
              <td class="px-4 py-3 font-semibold text-slate-800 text-sm">{{ report.id }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-800">{{ report.title }}</div>
                <div class="text-gray-500 text-xs">{{ report.device }} - {{ report.location }}</div>
              </td>
              <td class="px-4 py-3">
                <span 
                  class="px-2 py-1 rounded-full text-white text-xs font-medium"
                  :class="getPriorityColor(report.priority)"
                >
                  {{ getPriorityLabel(report.priority) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span 
                  class="px-2 py-1 rounded-full text-white text-xs font-medium"
                  :class="getStatusColor(report.status)"
                >
                  {{ getStatusLabel(report.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <span class="font-medium">{{ report.slaTarget }}h</span>
              </td>
              <td class="px-4 py-3 text-sm">
                <span v-if="report.actualTime" class="font-medium">
                  {{ formatDuration(report.actualTime) }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span 
                    class="px-2 py-1 rounded-full text-white text-xs font-medium"
                    :class="getSLAStatusColor(report.slaStatus)"
                  >
                    {{ getSLAStatusLabel(report.slaStatus) }}
                  </span>
                  <span 
                    v-if="report.timeRemaining !== null && report.status !== 'resolved'"
                    class="text-xs"
                    :class="{
                      'text-red-600': report.timeRemaining < 0,
                      'text-amber-600': report.timeRemaining > 0 && report.timeRemaining < 2,
                      'text-green-600': report.timeRemaining >= 2
                    }"
                  >
                    {{ report.timeRemaining < 0 ? 'Przekroczono o ' : 'Pozostało: ' }}
                    {{ formatTime(Math.abs(report.timeRemaining)) }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm">
                <span v-if="report.assignedTo">{{ report.assignedTo }}</span>
                <span v-else class="text-gray-400">Nieprzypisane</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredReports.length === 0" class="py-12 text-center">
        <div class="mb-4 text-6xl">📋</div>
        <h3 class="mb-2 font-semibold text-slate-800 text-lg">Brak zgłoszeń</h3>
        <p class="text-gray-500">Nie znaleziono zgłoszeń spełniających wybrane kryteria</p>
      </div>
    </section>
  </div>
</template>
