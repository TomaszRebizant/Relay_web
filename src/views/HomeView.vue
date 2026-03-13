<script setup lang="ts">
import { ref, computed } from 'vue'
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

const stats = ref([
  {
    title: 'Urządzenia',
    value: '1,234',
    change: '+12%',
    changeType: 'positive',
    icon: '🔧',
    color: 'bg-blue-500'
  },
  {
    title: 'Nowe zgłoszenia',
    value: '89',
    change: '+5%',
    changeType: 'positive',
    icon: '📝',
    color: 'bg-red-500'
  },
  {
    title: 'W realizacji',
    value: '45',
    change: '-3%',
    changeType: 'negative',
    icon: '⚡',
    color: 'bg-amber-500'
  },
  {
    title: 'Rozwiązane',
    value: '567',
    change: '+18%',
    changeType: 'positive',
    icon: '✅',
    color: 'bg-green-500'
  }
])

const recentReports = ref([
  {
    id: 'R-001',
    device: 'Klimatyzacja A-101',
    location: 'Budynek A, piętro 1',
    status: 'nowe',
    priority: 'wysoki',
    reportedBy: 'Jan Kowalski',
    reportedAt: '2024-03-02 14:30'
  },
  {
    id: 'R-002',
    device: 'Ogrzewanie B-205',
    location: 'Budynek B, piętro 2',
    status: 'w realizacji',
    priority: 'średni',
    reportedBy: 'Anna Nowak',
    reportedAt: '2024-03-02 13:15'
  },
  {
    id: 'R-003',
    device: 'Wentylacja C-301',
    location: 'Budynek C, piętro 3',
    status: 'rozwiązane',
    priority: 'niski',
    reportedBy: 'Piotr Wiśniewski',
    reportedAt: '2024-03-02 11:45'
  }
])

const deviceCategories = ref([
  {
    name: 'Klimatyzacja',
    count: 456,
    working: 412,
    maintenance: 38,
    broken: 6,
    icon: '❄️',
    color: 'bg-blue-500'
  },
  {
    name: 'Ogrzewanie',
    count: 378,
    working: 351,
    maintenance: 22,
    broken: 5,
    icon: '🔥',
    color: 'bg-red-500'
  },
  {
    name: 'Wentylacja',
    count: 289,
    working: 267,
    maintenance: 18,
    broken: 4,
    icon: '💨',
    color: 'bg-green-500'
  }
])

const getStatusColor = (status: string) => {
  const colors = {
    nowe: 'bg-red-500',
    'w realizacji': 'bg-amber-500',
    rozwiązane: 'bg-green-500'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-500'
}

const getPriorityColor = (priority: string) => {
  const colors = {
    wysoki: 'bg-red-500',
    średni: 'bg-amber-500',
    niski: 'bg-green-500'
  }
  return colors[priority as keyof typeof colors] || 'bg-gray-500'
}

// Chart data for Failure Trends (last 6 months)
const failureTrendsData = computed(() => ({
  labels: ['Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień', 'Styczeń'],
  datasets: [
    {
      label: 'Awarię',
      data: [12, 19, 15, 25, 22, 30],
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
      data: [8, 15, 12, 18, 20, 24],
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
}))

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

// Chart data for Maintenance Costs
const maintenanceCostsData = computed(() => ({
  labels: ['Części', 'Praca serwisowa', 'Transport', 'Diagnostyka', 'Inne'],
  datasets: [{
    data: [35, 40, 10, 10, 5],
    backgroundColor: [
      '#3b82f6',
      '#22c55e',
      '#f59e0b',
      '#8b5cf6',
      '#6b7280'
    ],
    borderWidth: 0,
    hoverOffset: 4
  }]
}))

const maintenanceCostsOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
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
      callbacks: {
        label: (context: any) => `${context.label}: ${context.raw}%`
      }
    }
  },
  cutout: '60%'
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

        <!-- Maintenance Costs Chart -->
        <div class="bg-white shadow-sm p-6 rounded-xl">
          <div class="mb-4">
            <h3 class="font-semibold text-slate-800 text-lg">Struktura kosztów</h3>
            <p class="text-gray-500 text-sm">Rozkład kosztów konserwacji</p>
          </div>
          <div class="h-56">
            <Doughnut :data="maintenanceCostsData" :options="maintenanceCostsOptions" />
          </div>
          <div class="mt-4 pt-4 border-t text-center">
            <div class="text-gray-500 text-sm">Całkowite koszty (miesiąc)</div>
            <div class="font-bold text-slate-800 text-2xl">45 230 PLN</div>
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
          <div class="flex items-center gap-4 mb-6">
            <div class="text-2xl">{{ category.icon }}</div>
            <h3 class="flex-1 font-semibold text-slate-800 text-lg">{{ category.name }}</h3>
            <div class="font-bold text-blue-500 text-2xl">{{ category.count }}</div>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <div class="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    class="bg-green-500 rounded-full h-full transition-all duration-300"
                    :style="{ width: (category.working / category.count * 100) + '%' }"
                  ></div>
                </div>
              </div>
              <div class="min-w-20">
                <div class="font-semibold text-slate-800 text-sm">{{ category.working }}</div>
                <div class="text-gray-500 text-xs">Działające</div>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <div class="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    class="bg-amber-500 rounded-full h-full transition-all duration-300"
                    :style="{ width: (category.maintenance / category.count * 100) + '%' }"
                  ></div>
                </div>
              </div>
              <div class="min-w-20">
                <div class="font-semibold text-slate-800 text-sm">{{ category.maintenance }}</div>
                <div class="text-gray-500 text-xs">Konserwacja</div>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <div class="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    class="bg-red-500 rounded-full h-full transition-all duration-300"
                    :style="{ width: (category.broken / category.count * 100) + '%' }"
                  ></div>
                </div>
              </div>
              <div class="min-w-20">
                <div class="font-semibold text-slate-800 text-sm">{{ category.broken }}</div>
                <div class="text-gray-500 text-xs">Uszkodzone</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
