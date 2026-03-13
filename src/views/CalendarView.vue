<script setup lang="ts">
import { ref, computed } from 'vue'

// Current date state
const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)
const showEventModal = ref(false)
const showAddEventModal = ref(false)

// Event types
interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  duration: string
  type: 'maintenance' | 'inspection' | 'repair' | 'installation'
  device: string
  location: string
  assignedTo: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  description: string
}

// Sample events
const events = ref<CalendarEvent[]>([
  {
    id: 'EVT-001',
    title: 'Przegląd okresowy klimatyzacji',
    date: '2024-03-05',
    time: '09:00',
    duration: '2 godziny',
    type: 'inspection',
    device: 'Klimatyzacja A-101',
    location: 'Budynek A, piętro 1',
    assignedTo: 'Piotr Wiśniewski',
    status: 'scheduled',
    description: 'Planowy przegląd filtrów i czynnika chłodniczego'
  },
  {
    id: 'EVT-002',
    title: 'Konserwacja ogrzewania',
    date: '2024-03-07',
    time: '14:00',
    duration: '3 godziny',
    type: 'maintenance',
    device: 'Ogrzewanie B-205',
    location: 'Budynek B, piętro 2',
    assignedTo: 'Tomasz Lewandowski',
    status: 'scheduled',
    description: 'Wymiana filtrów, sprawdzenie ciśnienia'
  },
  {
    id: 'EVT-003',
    title: 'Naprawa wentylacji',
    date: '2024-03-10',
    time: '10:30',
    duration: '4 godziny',
    type: 'repair',
    device: 'Wentylacja C-301',
    location: 'Budynek C, piętro 3',
    assignedTo: 'Piotr Wiśniewski',
    status: 'in_progress',
    description: 'Wymiana uszkodzonego łożyska'
  },
  {
    id: 'EVT-004',
    title: 'Instalacja nowej klimatyzacji',
    date: '2024-03-12',
    time: '08:00',
    duration: '6 godzin',
    type: 'installation',
    device: 'Klimatyzacja D-102',
    location: 'Budynek D, piętro 1',
    assignedTo: 'Jan Kowalski',
    status: 'scheduled',
    description: 'Montaż nowego systemu klimatyzacji'
  },
  {
    id: 'EVT-005',
    title: 'Przegląd wentylacji',
    date: '2024-03-15',
    time: '11:00',
    duration: '1.5 godziny',
    type: 'inspection',
    device: 'Wentylacja F-303',
    location: 'Budynek F, piętro 3',
    assignedTo: 'Magdalena Zielińska',
    status: 'completed',
    description: 'Sprawdzenie filtrów i wymiennika ciepła'
  },
  {
    id: 'EVT-006',
    title: 'Serwis ogrzewania',
    date: '2024-03-18',
    time: '13:00',
    duration: '2.5 godziny',
    type: 'maintenance',
    device: 'Ogrzewanie E-201',
    location: 'Budynek E, piętro 2',
    assignedTo: 'Tomasz Lewandowski',
    status: 'scheduled',
    description: 'Czyszczenie palnika, sprawdzenie termostatu'
  }
])

// New event form
const newEvent = ref<Partial<CalendarEvent>>({
  title: '',
  date: '',
  time: '',
  duration: '',
  type: 'maintenance',
  device: '',
  location: '',
  assignedTo: '',
  description: ''
})

// Calendar navigation
const monthNames = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
]

const weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz']

const currentMonthName = computed(() => monthNames[currentDate.value.getMonth()])
const currentYear = computed(() => currentDate.value.getFullYear())

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() || 7 // Convert Sunday (0) to 7
  
  const days: Array<{ date: number | null; fullDate: string | null; events: CalendarEvent[] }> = []
  
  // Add empty cells for days before the first day of month
  for (let i = 1; i < startingDayOfWeek; i++) {
    days.push({ date: null, fullDate: null, events: [] })
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayEvents = events.value.filter(e => e.date === fullDate)
    days.push({ date: day, fullDate, events: dayEvents })
  }
  
  return days
})

const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return []
  const dateStr = selectedDate.value.toISOString().split('T')[0]
  return events.value.filter(e => e.date === dateStr)
})

// Navigation functions
const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
  selectedDate.value = new Date()
}

const selectDate = (day: { date: number | null; fullDate: string | null; events: CalendarEvent[] }) => {
  if (day.date && day.fullDate) {
    selectedDate.value = new Date(day.fullDate)
    if (day.events.length > 0) {
      showEventModal.value = true
    }
  }
}

const isToday = (fullDate: string | null) => {
  if (!fullDate) return false
  const today = new Date().toISOString().split('T')[0]
  return fullDate === today
}

const isSelected = (fullDate: string | null) => {
  if (!fullDate || !selectedDate.value) return false
  return fullDate === selectedDate.value.toISOString().split('T')[0]
}

// Event functions
const getEventTypeColor = (type: string) => {
  const colors = {
    maintenance: 'bg-blue-500',
    inspection: 'bg-green-500',
    repair: 'bg-red-500',
    installation: 'bg-purple-500'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-500'
}

const getEventTypeLabel = (type: string) => {
  const labels = {
    maintenance: 'Konserwacja',
    inspection: 'Przegląd',
    repair: 'Naprawa',
    installation: 'Instalacja'
  }
  return labels[type as keyof typeof labels] || type
}

const getStatusColor = (status: string) => {
  const colors = {
    scheduled: 'bg-gray-500',
    in_progress: 'bg-amber-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-500'
}

const getStatusLabel = (status: string) => {
  const labels = {
    scheduled: 'Zaplanowane',
    in_progress: 'W trakcie',
    completed: 'Zakończone',
    cancelled: 'Anulowane'
  }
  return labels[status as keyof typeof labels] || status
}

const openAddEventModal = () => {
  newEvent.value = {
    title: '',
    date: selectedDate.value?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: '2 godziny',
    type: 'maintenance',
    device: '',
    location: '',
    assignedTo: '',
    description: ''
  }
  showAddEventModal.value = true
}

const closeAddEventModal = () => {
  showAddEventModal.value = false
}

const addEvent = () => {
  if (newEvent.value.title && newEvent.value.date) {
    const event: CalendarEvent = {
      id: `EVT-${String(events.value.length + 1).padStart(3, '0')}`,
      title: newEvent.value.title,
      date: newEvent.value.date,
      time: newEvent.value.time || '09:00',
      duration: newEvent.value.duration || '2 godziny',
      type: newEvent.value.type as any,
      device: newEvent.value.device || '',
      location: newEvent.value.location || '',
      assignedTo: newEvent.value.assignedTo || '',
      status: 'scheduled',
      description: newEvent.value.description || ''
    }
    events.value.push(event)
    closeAddEventModal()
  }
}

const closeEventModal = () => {
  showEventModal.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <section>
      <h1 class="mb-2 font-bold text-slate-800 text-3xl">Kalendarz konserwacji</h1>
      <p class="text-gray-600">Planowanie przeglądów, konserwacji i napraw urządzeń</p>
    </section>

    <!-- Calendar Navigation -->
    <section class="flex justify-between items-center bg-white shadow-sm p-4 rounded-xl">
      <div class="flex items-center gap-4">
        <button 
          @click="previousMonth"
          class="hover:bg-gray-100 p-2 border border-gray-300 rounded-lg transition-colors"
        >
          ◀️
        </button>
        <h2 class="font-bold text-slate-800 text-xl min-w-48 text-center">
          {{ currentMonthName }} {{ currentYear }}
        </h2>
        <button 
          @click="nextMonth"
          class="hover:bg-gray-100 p-2 border border-gray-300 rounded-lg transition-colors"
        >
          ▶️
        </button>
      </div>
      <div class="flex gap-3">
        <button 
          @click="goToToday"
          class="bg-gray-100 hover:bg-gray-200 px-4 py-2 border border-gray-300 rounded-lg text-sm transition-colors"
        >
          Dziś
        </button>
        <button 
          @click="openAddEventModal"
          class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white text-sm transition-colors"
        >
          + Dodaj wydarzenie
        </button>
      </div>
    </section>

    <!-- Calendar Grid -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <!-- Week day headers -->
      <div class="grid grid-cols-7 mb-2">
        <div 
          v-for="day in weekDays" 
          :key="day"
          class="py-2 font-semibold text-gray-600 text-sm text-center"
        >
          {{ day }}
        </div>
      </div>
      
      <!-- Calendar days -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          @click="selectDate(day)"
          class="min-h-24 border-2 p-2 rounded-lg transition-all cursor-pointer relative"
          :class="{
            'bg-gray-50 border-transparent hover:border-gray-300': !day.date,
            'bg-white border-gray-200 hover:border-blue-400': day.date && !isSelected(day.fullDate),
            'bg-blue-50 border-blue-500 ring-2 ring-blue-200': isSelected(day.fullDate),
            'bg-blue-100 border-blue-600': isToday(day.fullDate) && !isSelected(day.fullDate)
          }"
        >
          <div v-if="day.date" class="flex flex-col h-full">
            <div 
              class="font-semibold text-sm mb-1"
              :class="{
                'text-blue-600': isToday(day.fullDate),
                'text-slate-800': !isToday(day.fullDate)
              }"
            >
              {{ day.date }}
            </div>
            <div class="flex-1 space-y-1">
              <div
                v-for="event in day.events.slice(0, 2)"
                :key="event.id"
                class="px-2 py-1 rounded text-white text-xs truncate"
                :class="getEventTypeColor(event.type)"
              >
                {{ event.time }} {{ event.title }}
              </div>
              <div v-if="day.events.length > 2" class="px-2 text-gray-500 text-xs">
                +{{ day.events.length - 2 }} więcej
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Legend -->
    <section class="flex flex-wrap gap-4 bg-white shadow-sm p-4 rounded-xl">
      <div class="flex items-center gap-2">
        <div class="bg-blue-500 rounded-full w-3 h-3"></div>
        <span class="text-gray-600 text-sm">Konserwacja</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="bg-green-500 rounded-full w-3 h-3"></div>
        <span class="text-gray-600 text-sm">Przegląd</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="bg-red-500 rounded-full w-3 h-3"></div>
        <span class="text-gray-600 text-sm">Naprawa</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="bg-purple-500 rounded-full w-3 h-3"></div>
        <span class="text-gray-600 text-sm">Instalacja</span>
      </div>
    </section>

    <!-- Selected Date Events Modal -->
    <div v-if="showEventModal && selectedDate" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div class="flex justify-between items-center p-6 border-gray-200 border-b">
          <div>
            <h2 class="font-semibold text-slate-800 text-xl">
              Wydarzenia - {{ selectedDate.toLocaleDateString('pl-PL') }}
            </h2>
            <p class="text-gray-500 text-sm">{{ selectedDateEvents.length }} wydarzeń zaplanowanych</p>
          </div>
          <button @click="closeEventModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <div class="p-6 max-h-96 overflow-y-auto">
          <div v-if="selectedDateEvents.length === 0" class="py-8 text-center text-gray-500">
            Brak wydarzeń tego dnia
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="event in selectedDateEvents"
              :key="event.id"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <span 
                    class="px-3 py-1 rounded-full text-white text-xs font-medium"
                    :class="getEventTypeColor(event.type)"
                  >
                    {{ getEventTypeLabel(event.type) }}
                  </span>
                  <span 
                    class="px-3 py-1 rounded-full text-white text-xs font-medium"
                    :class="getStatusColor(event.status)"
                  >
                    {{ getStatusLabel(event.status) }}
                  </span>
                </div>
                <span class="font-semibold text-slate-800">{{ event.time }}</span>
              </div>
              
              <h3 class="mb-2 font-semibold text-slate-800 text-lg">{{ event.title }}</h3>
              <p class="mb-3 text-gray-600 text-sm">{{ event.description }}</p>
              
              <div class="gap-4 grid grid-cols-2 bg-gray-50 p-3 rounded-lg text-sm">
                <div>
                  <div class="text-gray-500 text-xs">Urządzenie</div>
                  <div class="font-medium">{{ event.device }}</div>
                </div>
                <div>
                  <div class="text-gray-500 text-xs">Lokalizacja</div>
                  <div class="font-medium">{{ event.location }}</div>
                </div>
                <div>
                  <div class="text-gray-500 text-xs">Czas trwania</div>
                  <div class="font-medium">{{ event.duration }}</div>
                </div>
                <div>
                  <div class="text-gray-500 text-xs">Przypisane do</div>
                  <div class="font-medium">{{ event.assignedTo }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 p-6 border-gray-200 border-t">
          <button 
            @click="closeEventModal"
            class="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
          >
            Zamknij
          </button>
          <button 
            @click="openAddEventModal"
            class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Dodaj wydarzenie
          </button>
        </div>
      </div>
    </div>

    <!-- Add Event Modal -->
    <div v-if="showAddEventModal" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-gray-200 border-b">
          <h2 class="font-semibold text-slate-800 text-xl">Dodaj nowe wydarzenie</h2>
          <button @click="closeAddEventModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Tytuł *</label>
            <input 
              v-model="newEvent.title" 
              type="text" 
              required
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              placeholder="np. Przegląd klimatyzacji"
            >
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Data *</label>
              <input 
                v-model="newEvent.date" 
                type="date" 
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Godzina</label>
              <input 
                v-model="newEvent.time" 
                type="time" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Czas trwania</label>
              <input 
                v-model="newEvent.duration" 
                type="text" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="np. 2 godziny"
              >
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Typ</label>
              <select 
                v-model="newEvent.type"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="maintenance">Konserwacja</option>
                <option value="inspection">Przegląd</option>
                <option value="repair">Naprawa</option>
                <option value="installation">Instalacja</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Urządzenie</label>
            <input 
              v-model="newEvent.device" 
              type="text" 
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              placeholder="np. Klimatyzacja A-101"
            >
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Lokalizacja</label>
            <input 
              v-model="newEvent.location" 
              type="text" 
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              placeholder="np. Budynek A, piętro 1"
            >
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Przypisane do</label>
            <input 
              v-model="newEvent.assignedTo" 
              type="text" 
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              placeholder="np. Jan Kowalski"
            >
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Opis</label>
            <textarea 
              v-model="newEvent.description" 
              rows="3"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              placeholder="Szczegółowy opis zadania..."
            ></textarea>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 p-6 border-gray-200 border-t">
          <button 
            @click="closeAddEventModal"
            class="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
          >
            Anuluj
          </button>
          <button 
            @click="addEvent"
            class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Dodaj wydarzenie
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
