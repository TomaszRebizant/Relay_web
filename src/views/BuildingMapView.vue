<script setup lang="ts">
import { ref, computed } from 'vue'

// Building structure
interface Room {
  id: string
  name: string
  floor: string
  building: string
  x: number
  y: number
  width: number
  height: number
  devices: Device[]
  status: 'normal' | 'warning' | 'critical'
}

interface Device {
  id: string
  name: string
  type: string
  status: 'working' | 'maintenance' | 'broken'
  temperature?: string
  lastMaintenance: string
  nextMaintenance: string
}

const selectedBuilding = ref('A')
const selectedFloor = ref('1')
const selectedRoom = ref<Room | null>(null)
const showRoomDetails = ref(false)

const buildings = ['A', 'B', 'C', 'D', 'E', 'F']
const floors = ['1', '2', '3', 'Piwnica', 'Dach']

// Generate rooms for building A, floor 1
const rooms = computed<Room[]>(() => {
  if (selectedBuilding.value === 'A' && selectedFloor.value === '1') {
    return [
      {
        id: 'A-101',
        name: 'Pokój 101',
        floor: '1',
        building: 'A',
        x: 10,
        y: 10,
        width: 120,
        height: 80,
        status: 'normal',
        devices: [
          {
            id: 'DEV-001',
            name: 'Klimatyzacja A-101',
            type: 'Klimatyzacja',
            status: 'working',
            temperature: '22°C',
            lastMaintenance: '2024-02-15',
            nextMaintenance: '2024-05-15'
          }
        ]
      },
      {
        id: 'A-102',
        name: 'Pokój 102',
        floor: '1',
        building: 'A',
        x: 140,
        y: 10,
        width: 120,
        height: 80,
        status: 'normal',
        devices: [
          {
            id: 'DEV-007',
            name: 'Klimatyzacja A-102',
            type: 'Klimatyzacja',
            status: 'working',
            temperature: '21°C',
            lastMaintenance: '2024-01-20',
            nextMaintenance: '2024-04-20'
          }
        ]
      },
      {
        id: 'A-103',
        name: 'Pokój 103 (Serwerownia)',
        floor: '1',
        building: 'A',
        x: 10,
        y: 100,
        width: 120,
        height: 80,
        status: 'warning',
        devices: [
          {
            id: 'DEV-008',
            name: 'Klimatyzacja precyzyjna',
            type: 'Klimatyzacja',
            status: 'maintenance',
            temperature: '24°C',
            lastMaintenance: '2024-02-01',
            nextMaintenance: '2024-03-01'
          },
          {
            id: 'DEV-009',
            name: 'System wentylacji',
            type: 'Wentylacja',
            status: 'working',
            lastMaintenance: '2024-01-15',
            nextMaintenance: '2024-04-15'
          }
        ]
      },
      {
        id: 'A-104',
        name: 'Pokój 104',
        floor: '1',
        building: 'A',
        x: 140,
        y: 100,
        width: 120,
        height: 80,
        status: 'critical',
        devices: [
          {
            id: 'DEV-010',
            name: 'Klimatyzacja A-104',
            type: 'Klimatyzacja',
            status: 'broken',
            temperature: '--',
            lastMaintenance: '2023-12-10',
            nextMaintenance: '2024-03-10'
          }
        ]
      },
      {
        id: 'A-KORYTARZ',
        name: 'Korytarz',
        floor: '1',
        building: 'A',
        x: 10,
        y: 190,
        width: 250,
        height: 40,
        status: 'normal',
        devices: [
          {
            id: 'DEV-011',
            name: 'Wentylacja korytarza',
            type: 'Wentylacja',
            status: 'working',
            lastMaintenance: '2024-02-10',
            nextMaintenance: '2024-05-10'
          }
        ]
      },
      {
        id: 'A-TOALETA',
        name: 'Toaleta',
        floor: '1',
        building: 'A',
        x: 10,
        y: 240,
        width: 60,
        height: 50,
        status: 'normal',
        devices: [
          {
            id: 'DEV-012',
            name: 'Wentylacja WC',
            type: 'Wentylacja',
            status: 'working',
            lastMaintenance: '2024-01-25',
            nextMaintenance: '2024-04-25'
          }
        ]
      },
      {
        id: 'A-KUCHNIA',
        name: 'Kuchnia',
        floor: '1',
        building: 'A',
        x: 80,
        y: 240,
        width: 80,
        height: 50,
        status: 'normal',
        devices: [
          {
            id: 'DEV-013',
            name: 'Klimatyzacja kuchni',
            type: 'Klimatyzacja',
            status: 'working',
            temperature: '20°C',
            lastMaintenance: '2024-02-05',
            nextMaintenance: '2024-05-05'
          }
        ]
      },
      {
        id: 'A-SEKRETARIAT',
        name: 'Sekretariat',
        floor: '1',
        building: 'A',
        x: 170,
        y: 240,
        width: 90,
        height: 50,
        status: 'normal',
        devices: [
          {
            id: 'DEV-014',
            name: 'Klimatyzacja sekretariatu',
            type: 'Klimatyzacja',
            status: 'working',
            temperature: '22°C',
            lastMaintenance: '2024-02-20',
            nextMaintenance: '2024-05-20'
          }
        ]
      }
    ]
  }
  
  // Building B, floor 2
  if (selectedBuilding.value === 'B' && selectedFloor.value === '2') {
    return [
      {
        id: 'B-201',
        name: 'Pokój 201',
        floor: '2',
        building: 'B',
        x: 10,
        y: 10,
        width: 100,
        height: 70,
        status: 'normal',
        devices: [
          {
            id: 'DEV-002',
            name: 'Ogrzewanie B-205',
            type: 'Ogrzewanie',
            status: 'working',
            temperature: '23°C',
            lastMaintenance: '2024-01-20',
            nextMaintenance: '2024-03-20'
          }
        ]
      },
      {
        id: 'B-202',
        name: 'Sala konferencyjna',
        floor: '2',
        building: 'B',
        x: 120,
        y: 10,
        width: 140,
        height: 100,
        status: 'warning',
        devices: [
          {
            id: 'DEV-015',
            name: 'Klimatyzacja sali',
            type: 'Klimatyzacja',
            status: 'maintenance',
            temperature: '21°C',
            lastMaintenance: '2024-02-01',
            nextMaintenance: '2024-03-01'
          },
          {
            id: 'DEV-016',
            name: 'Wentylacja sali',
            type: 'Wentylacja',
            status: 'working',
            lastMaintenance: '2024-01-10',
            nextMaintenance: '2024-04-10'
          }
        ]
      },
      {
        id: 'B-KORYTARZ',
        name: 'Korytarz',
        floor: '2',
        building: 'B',
        x: 10,
        y: 90,
        width: 250,
        height: 40,
        status: 'normal',
        devices: []
      },
      {
        id: 'B-203',
        name: 'Pokój 203',
        floor: '2',
        building: 'B',
        x: 10,
        y: 140,
        width: 100,
        height: 70,
        status: 'normal',
        devices: [
          {
            id: 'DEV-017',
            name: 'Ogrzewanie B-203',
            type: 'Ogrzewanie',
            status: 'working',
            temperature: '22°C',
            lastMaintenance: '2024-02-15',
            nextMaintenance: '2024-05-15'
          }
        ]
      }
    ]
  }
  
  // Default empty floor plan
  return []
})

// Statistics
const stats = computed(() => {
  let totalDevices = 0
  let working = 0
  let maintenance = 0
  let broken = 0
  
  rooms.value.forEach(room => {
    totalDevices += room.devices.length
    room.devices.forEach(device => {
      if (device.status === 'working') working++
      else if (device.status === 'maintenance') maintenance++
      else if (device.status === 'broken') broken++
    })
  })
  
  return { totalDevices, working, maintenance, broken }
})

const selectRoom = (room: Room) => {
  selectedRoom.value = room
  showRoomDetails.value = true
}

const closeRoomDetails = () => {
  showRoomDetails.value = false
  selectedRoom.value = null
}

const getRoomColor = (status: string) => {
  const colors = {
    normal: 'fill-green-100 stroke-green-300',
    warning: 'fill-amber-100 stroke-amber-300',
    critical: 'fill-red-100 stroke-red-300'
  }
  return colors[status as keyof typeof colors] || 'fill-gray-100 stroke-gray-300'
}

const getRoomBorderColor = (status: string) => {
  const colors = {
    normal: '#22c55e',
    warning: '#f59e0b',
    critical: '#ef4444'
  }
  return colors[status as keyof typeof colors] || '#9ca3af'
}

const getDeviceStatusColor = (status: string) => {
  const colors = {
    working: 'bg-green-500',
    maintenance: 'bg-amber-500',
    broken: 'bg-red-500'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-500'
}

const getDeviceStatusLabel = (status: string) => {
  const labels = {
    working: 'Działa',
    maintenance: 'Konserwacja',
    broken: 'Uszkodzone'
  }
  return labels[status as keyof typeof labels] || status
}

const getDeviceIcon = (type: string) => {
  const icons: Record<string, string> = {
    'Klimatyzacja': '❄️',
    'Ogrzewanie': '🔥',
    'Wentylacja': '💨'
  }
  return icons[type] || '🔧'
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <section>
      <h1 class="mb-2 font-bold text-slate-800 text-3xl">Mapa budynku</h1>
      <p class="text-gray-600">Wizualne rozmieszczenie urządzeń na piętrach i planach budynków</p>
    </section>

    <!-- Controls -->
    <section class="flex flex-wrap gap-4 bg-white shadow-sm p-4 rounded-xl">
      <div class="flex items-center gap-2">
        <label class="font-medium text-gray-700 text-sm">Budynek:</label>
        <select 
          v-model="selectedBuilding"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="building in buildings" :key="building" :value="building">
            Budynek {{ building }}
          </option>
        </select>
      </div>
      
      <div class="flex items-center gap-2">
        <label class="font-medium text-gray-700 text-sm">Piętro:</label>
        <select 
          v-model="selectedFloor"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="floor in floors" :key="floor" :value="floor">
            Piętro {{ floor }}
          </option>
        </select>
      </div>
      
      <div class="flex items-center gap-4 ml-auto">
        <div class="flex items-center gap-2">
          <div class="bg-green-500 rounded-full w-3 h-3"></div>
          <span class="text-gray-600 text-sm">Wszystko OK</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="bg-amber-500 rounded-full w-3 h-3"></div>
          <span class="text-gray-600 text-sm">Ostrzeżenie</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="bg-red-500 rounded-full w-3 h-3"></div>
          <span class="text-gray-600 text-sm">Krytyczne</span>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="gap-4 grid grid-cols-1 md:grid-cols-4">
      <div class="bg-white shadow-sm p-4 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="flex justify-center items-center bg-blue-500 rounded-lg w-10 h-10 text-white text-lg">🔧</div>
          <div>
            <div class="font-bold text-slate-800 text-2xl">{{ stats.totalDevices }}</div>
            <div class="text-gray-500 text-sm">Urządzeń na piętrze</div>
          </div>
        </div>
      </div>
      <div class="bg-white shadow-sm p-4 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="flex justify-center items-center bg-green-500 rounded-lg w-10 h-10 text-white text-lg">✅</div>
          <div>
            <div class="font-bold text-slate-800 text-2xl">{{ stats.working }}</div>
            <div class="text-gray-500 text-sm">Działających</div>
          </div>
        </div>
      </div>
      <div class="bg-white shadow-sm p-4 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="flex justify-center items-center bg-amber-500 rounded-lg w-10 h-10 text-white text-lg">🔧</div>
          <div>
            <div class="font-bold text-slate-800 text-2xl">{{ stats.maintenance }}</div>
            <div class="text-gray-500 text-sm">W konserwacji</div>
          </div>
        </div>
      </div>
      <div class="bg-white shadow-sm p-4 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="flex justify-center items-center bg-red-500 rounded-lg w-10 h-10 text-white text-lg">⚠️</div>
          <div>
            <div class="font-bold text-slate-800 text-2xl">{{ stats.broken }}</div>
            <div class="text-gray-500 text-sm">Uszkodzonych</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Floor Plan -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <div class="mb-4">
        <h2 class="font-semibold text-slate-800 text-lg">Plan piętra - Budynek {{ selectedBuilding }}, Piętro {{ selectedFloor }}</h2>
        <p class="text-gray-500 text-sm">Kliknij na pokój, aby zobaczyć szczegóły urządzeń</p>
      </div>
      
      <div v-if="rooms.length === 0" class="py-12 text-center">
        <div class="mb-4 text-6xl">🏗️</div>
        <h3 class="mb-2 font-semibold text-slate-800 text-lg">Plan w budowie</h3>
        <p class="text-gray-500">Plan dla tego budynku i piętra nie jest jeszcze dostępny</p>
      </div>
      
      <div v-else class="overflow-auto">
        <svg 
          viewBox="0 0 300 320" 
          class="bg-gray-50 mx-auto border border-gray-200 rounded-lg"
          style="max-width: 800px; min-width: 400px;"
        >
          <!-- Grid lines -->
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="300" height="320" fill="url(#grid)" />
          
          <!-- Rooms -->
          <g v-for="room in rooms" :key="room.id">
            <rect
              :x="room.x"
              :y="room.y"
              :width="room.width"
              :height="room.height"
              :class="getRoomColor(room.status)"
              stroke-width="2"
              rx="4"
              class="hover:opacity-80 transition-opacity cursor-pointer"
              @click="selectRoom(room)"
            />
            
            <!-- Room label -->
            <text
              :x="room.x + room.width / 2"
              :y="room.y + 20"
              text-anchor="middle"
              class="font-medium text-xs pointer-events-none"
              :fill="getRoomBorderColor(room.status)"
            >
              {{ room.name }}
            </text>
            
            <!-- Device count badge -->
            <g v-if="room.devices.length > 0">
              <circle
                :cx="room.x + room.width - 12"
                :cy="room.y + 12"
                r="10"
                :fill="getRoomBorderColor(room.status)"
              />
              <text
                :x="room.x + room.width - 12"
                :y="room.y + 16"
                text-anchor="middle"
                class="font-bold text-xs pointer-events-none"
                fill="white"
              >
                {{ room.devices.length }}
              </text>
            </g>
            
            <!-- Status indicator -->
            <circle
              v-if="room.status === 'critical'"
              :cx="room.x + room.width / 2"
              :cy="room.y + room.height - 15"
              r="6"
              fill="#ef4444"
              class="animate-pulse"
            />
          </g>
          
          <!-- Building outline -->
          <rect x="5" y="5" width="290" height="310" fill="none" stroke="#374151" stroke-width="3" rx="8" />
        </svg>
      </div>
    </section>

    <!-- Room Details Modal -->
    <div v-if="showRoomDetails && selectedRoom" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div class="flex justify-between items-center p-6 border-gray-200 border-b">
          <div>
            <h2 class="font-semibold text-slate-800 text-xl">{{ selectedRoom.name }}</h2>
            <p class="text-gray-500 text-sm">Budynek {{ selectedRoom.building }}, Piętro {{ selectedRoom.floor }}</p>
          </div>
          <button @click="closeRoomDetails" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <div class="p-6 max-h-96 overflow-y-auto">
          <div v-if="selectedRoom.devices.length === 0" class="py-8 text-gray-500 text-center">
            Brak urządzeń w tym pomieszczeniu
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="device in selectedRoom.devices"
              :key="device.id"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <div class="text-2xl">{{ getDeviceIcon(device.type) }}</div>
                  <div>
                    <h3 class="font-semibold text-slate-800">{{ device.name }}</h3>
                    <p class="text-gray-500 text-sm">{{ device.id }}</p>
                  </div>
                </div>
                <span 
                  class="px-3 py-1 rounded-full font-medium text-white text-xs"
                  :class="getDeviceStatusColor(device.status)"
                >
                  {{ getDeviceStatusLabel(device.status) }}
                </span>
              </div>
              
              <div class="gap-4 grid grid-cols-2 bg-gray-50 p-3 rounded-lg text-sm">
                <div v-if="device.temperature">
                  <div class="text-gray-500 text-xs">Temperatura</div>
                  <div class="font-medium">{{ device.temperature }}</div>
                </div>
                <div>
                  <div class="text-gray-500 text-xs">Typ</div>
                  <div class="font-medium">{{ device.type }}</div>
                </div>
                <div>
                  <div class="text-gray-500 text-xs">Ostatnia konserwacja</div>
                  <div class="font-medium">{{ device.lastMaintenance }}</div>
                </div>
                <div>
                  <div class="text-gray-500 text-xs">Następna konserwacja</div>
                  <div class="font-medium" :class="{
                    'text-red-600': new Date(device.nextMaintenance) < new Date(),
                    'text-amber-600': new Date(device.nextMaintenance) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  }">
                    {{ device.nextMaintenance }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 p-6 border-gray-200 border-t">
          <button 
            @click="closeRoomDetails"
            class="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
          >
            Zamknij
          </button>
          <button 
            class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Dodaj urządzenie
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
