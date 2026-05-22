<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import api from '@/utils/api'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const loading = ref(true)

const stats = ref([
  {
    title: 'Urządzenia',
    value: '0',
    change: '+0%',
    changeType: 'positive' as 'positive' | 'negative',
    icon: '🔧',
    color: 'bg-blue-500'
  },
  {
    title: 'Nowe zgłoszenia',
    value: '0',
    change: '+0%',
    changeType: 'positive' as 'positive' | 'negative',
    icon: '📝',
    color: 'bg-red-500'
  },
  {
    title: 'W realizacji',
    value: '0',
    change: '+0%',
    changeType: 'positive' as 'positive' | 'negative',
    icon: '⚡',
    color: 'bg-amber-500'
  },
  {
    title: 'Rozwiązane',
    value: '0',
    change: '+0%',
    changeType: 'positive' as 'positive' | 'negative',
    icon: '✅',
    color: 'bg-green-500'
  }
])

const recentReports = ref<any[]>([])

const deviceCategories = ref<any[]>([])

const unwrapList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data) {
    const inner = (data as { data: unknown }).data
    return Array.isArray(inner) ? inner : []
  }
  return []
}

const mapApiStatusToUi = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'new',
    in_progress: 'in_progress',
    resolved: 'resolved',
    closed: 'resolved'
  }
  return statusMap[status] || status
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    new: 'Nowe',
    pending: 'Nowe',
    in_progress: 'W realizacji',
    resolved: 'Rozwiązane'
  }
  return labels[status] || status
}

const getStatusColor = (status: string) => {
  const colors = {
    new: 'bg-red-500',
    'w realizacji': 'bg-amber-500',
    rozwiązane: 'bg-green-500',
    Nowe: 'bg-red-500',
    'W realizacji': 'bg-amber-500',
    Rozwiązane: 'bg-green-500'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-500'
}

const getPriorityColor = (priority: string) => {
  const colors = {
    wysoki: 'bg-red-500',
    high: 'bg-red-500',
    średni: 'bg-amber-500',
    medium: 'bg-amber-500',
    niski: 'bg-green-500',
    low: 'bg-green-500'
  }
  return colors[priority as keyof typeof colors] || 'bg-gray-500'
}

const fetchDashboardData = async () => {
  try {
    loading.value = true

    // Fetch devices
    const devicesRes = await api.get('/devices')
    const devices = unwrapList<any>(devicesRes.data)
    
    // Fetch faults
    const faultsRes = await api.get('/faults')
    const faults = unwrapList<any>(faultsRes.data)

    // Update stats
    const newFaults = faults.filter((f: any) => mapApiStatusToUi(f.status) === 'new').length
    const inProgressFaults = faults.filter((f: any) => mapApiStatusToUi(f.status) === 'in_progress').length
    const resolvedFaults = faults.filter((f: any) => mapApiStatusToUi(f.status) === 'resolved').length

    if (stats.value[0]) stats.value[0].value = devices.length.toString()
    if (stats.value[1]) stats.value[1].value = newFaults.toString()
    if (stats.value[2]) stats.value[2].value = inProgressFaults.toString()
    if (stats.value[3]) stats.value[3].value = resolvedFaults.toString()

    // Update recent reports (last 5)
    recentReports.value = faults.slice(0, 5).map((f: any) => ({
      id: `F-${f.id.toString().padStart(3, '0')}`,
      device: f.device?.name || f.device_uuid,
      location: f.device?.location || 'Nieznana',
      status: getStatusLabel(mapApiStatusToUi(f.status)),
      priority: f.resolved_at ? 'niski' : 'wysoki',
      reportedBy: f.reported_by,
      reportedAt: f.created_at ? f.created_at.replace('T', ' ').substring(0, 16) : '-'
    }))

    // Update device categories by type (only count, no status breakdown)
    const typeMap = new Map<string, number>()
    
    devices.forEach((d: any) => {
      const type = d.type || 'Inne'
      typeMap.set(type, (typeMap.get(type) || 0) + 1)
    })

    const iconMap: Record<string, string> = {
      'Klimatyzacja': '❄️',
      'Ogrzewanie': '🔥',
      'Wentylacja': '💨',
      'Inne': '🔧'
    }

    const colorMap: Record<string, string> = {
      'Klimatyzacja': 'bg-blue-500',
      'Ogrzewanie': 'bg-red-500',
      'Wentylacja': 'bg-green-500',
      'Inne': 'bg-gray-500'
    }

    deviceCategories.value = Array.from(typeMap.entries()).map(([name, count]) => ({
      name,
      count,
      icon: iconMap[name] || '🔧',
      color: colorMap[name] || 'bg-gray-500'
    }))

    // Update failure trends chart - group faults by month
    const monthMap = new Map<string, { faults: number; maintenance: number }>()
    const now = new Date()
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })
      monthMap.set(key, { faults: 0, maintenance: 0 })
    }

    // Group faults by month
    faults.forEach((f: any) => {
      if (f.created_at) {
        const date = new Date(f.created_at)
        const key = date.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })
        if (monthMap.has(key)) {
          const data = monthMap.get(key)!
          if (f.status === 'pending' || f.status === 'new') {
            data.faults++
          } else {
            data.maintenance++
          }
        }
      }
    })

    // Update chart data
    failureTrendsData.value.labels = Array.from(monthMap.keys())
    if (failureTrendsData.value.datasets[0]) {
      failureTrendsData.value.datasets[0].data = Array.from(monthMap.values()).map(v => v.faults)
    }
    if (failureTrendsData.value.datasets[1]) {
      failureTrendsData.value.datasets[1].data = Array.from(monthMap.values()).map(v => v.maintenance)
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})

// Chart data for Failure Trends (last 6 months)
const failureTrendsData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Awarię',
      data: [] as number[],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#ef4444',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    },
    {
      label: 'Konserwacje',
      data: [] as number[],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#f59e0b',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }
  ]
})

const failureTrendsOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      align: 'end' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 15,
        font: { size: 12 }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
      displayColors: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
      ticks: { font: { size: 11 } }
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } }
    }
  }
}

// Chart data for Average Repair Time
const repairTimeData = computed(() => ({
  labels: ['Klimatyzacja', 'Ogrzewanie', 'Wentylacja', 'Elektryka', 'Hydraulika'],
  datasets: [{
    label: 'Średni czas naprawy (godziny)',
    data: [4.2, 6.8, 3.5, 5.2, 7.1],
    backgroundColor: [
      'rgba(59, 130, 246, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(168, 85, 247, 0.8)'
    ],
    borderColor: [
      '#3b82f6',
      '#ef4444',
      '#22c55e',
      '#f59e0b',
      '#a855f7'
    ],
    borderWidth: 1,
    borderRadius: 6,
    borderSkipped: false
  }]
}))

const repairTimeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => `${context.raw} godz.`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
      ticks: {
        font: { size: 11 },
        callback: (value: any) => `${value}h`
      }
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } }
    }
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Stats Cards -->
    <section class="mb-4">
      <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div 
          v-for="stat in stats" 
          :key="stat.title"
          class="bg-white shadow-sm hover:shadow-md p-6 rounded-xl transition-all hover:-translate-y-1 duration-300"
        >
          <div class="flex items-center gap-4 mb-4">
            <div 
              :class="stat.color"
              class="flex justify-center items-center rounded-xl w-12 h-12 text-white text-xl"
            >
              {{ stat.icon }}
            </div>
            <div class="flex-1">
              <h3 class="mb-1 font-medium text-gray-600 text-sm">{{ stat.title }}</h3>
              <div class="font-bold text-slate-800 text-3xl">{{ stat.value }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span 
              class="font-semibold text-sm"
              :class="{
                'text-green-600': stat.changeType === 'positive',
                'text-red-600': stat.changeType === 'negative'
              }"
            >
              {{ stat.change }}
            </span>
            <span class="text-gray-400 text-xs">vs ostatni miesiąc</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Charts Section -->
    <section>
      <h2 class="mb-4 font-bold text-slate-800 text-xl">Analiza i statystyki</h2>
      <div class="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <!-- Failure Trends Chart -->
        <div class="lg:col-span-2 bg-white shadow-sm p-6 rounded-xl">
          <div class="mb-4">
            <h3 class="font-semibold text-slate-800 text-lg">Trendy awarii i konserwacji</h3>
            <p class="text-gray-500 text-sm">Liczba zgłoszeń w ostatnich 6 miesiącach</p>
          </div>
          <div class="h-72">
            <Line :data="failureTrendsData" :options="failureTrendsOptions" />
          </div>
        </div>

        <!-- Repair Time Chart -->
        <div class="lg:col-span-3 bg-white shadow-sm p-6 rounded-xl">
          <div class="mb-4">
            <h3 class="font-semibold text-slate-800 text-lg">Średni czas naprawy</h3>
            <p class="text-gray-500 text-sm">Według kategorii urządzeń (w godzinach)</p>
          </div>
          <div class="h-64">
            <Bar :data="repairTimeData" :options="repairTimeOptions" />
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Reports Table -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <div class="flex justify-between items-center mb-6">
        <h2 class="font-semibold text-slate-800 text-xl">Ostatnie zgłoszenia</h2>
        <button class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white text-sm transition-colors">
          Zobacz wszystkie
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-gray-200 border-b">
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">ID</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Urządzenie</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Lokalizacja</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Status</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Priorytet</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Zgłosił</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Data</th>
              <th class="px-4 py-3 font-semibold text-gray-600 text-sm text-left">Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="report in recentReports" 
              :key="report.id"
              class="hover:bg-gray-50 border-gray-100 border-b transition-colors"
            >
              <td class="px-4 py-3 font-semibold text-slate-800 text-sm">{{ report.id }}</td>
              <td class="px-4 py-3 font-medium text-sm">{{ report.device }}</td>
              <td class="px-4 py-3 text-sm">{{ report.location }}</td>
              <td class="px-4 py-3">
                <span 
                  :class="getStatusColor(report.status)"
                  class="px-2 py-1 rounded-full font-medium text-white text-xs"
                >
                  {{ report.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span 
                  :class="getPriorityColor(report.priority)"
                  class="px-2 py-1 rounded-full font-medium text-white text-xs"
                >
                  {{ report.priority }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">{{ report.reportedBy }}</td>
              <td class="px-4 py-3 text-sm">{{ report.reportedAt }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button class="hover:bg-gray-100 p-1 rounded transition-colors">✏️</button>
                  <button class="hover:bg-gray-100 p-1 rounded transition-colors">👁️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Device Categories -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <div class="mb-6">
        <h2 class="font-semibold text-slate-800 text-xl">Urządzenia wg kategorii</h2>
      </div>
      
      <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="category in deviceCategories" 
          :key="category.name"
          class="p-6 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="text-2xl">{{ category.icon }}</div>
            <h3 class="flex-1 font-semibold text-slate-800 text-lg">{{ category.name }}</h3>
            <div class="font-bold text-blue-500 text-2xl">{{ category.count }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
