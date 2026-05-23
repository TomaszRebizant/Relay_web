<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/api'

const route = useRoute()
const device = ref<any>(null)
const loading = ref(true)
const error = ref('')

const printPage = () => {
  window.print()
}

const fetchDevice = async () => {
  const deviceUuid = route.params.uuid as string
  if (!deviceUuid) {
    error.value = 'Brak ID urządzenia'
    loading.value = false
    return
  }

  try {
    loading.value = true
    const response = await api.get(`/devices/${deviceUuid}`)
    device.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Nie udało się pobrać danych urządzenia'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pl-PL')
}

onMounted(fetchDevice)
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow-sm border-gray-200 border-b">
      <div class="flex justify-between items-center mx-auto px-4 py-4 max-w-3xl">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔧</span>
          <h1 class="font-bold text-slate-800 text-xl">ServiceHub</h1>
        </div>
        <a 
          href="/report" 
          class="font-medium text-blue-600 hover:text-blue-800 text-sm"
        >
          Zgłoś awarię →
        </a>
      </div>
    </header>

    <main class="mx-auto px-4 py-8 max-w-3xl">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col justify-center items-center py-12">
        <div class="border-blue-600 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
        <p class="mt-4 text-gray-500">Wczytywanie danych...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 p-6 border border-red-200 rounded-lg text-center">
        <p class="text-red-700">{{ error }}</p>
        <button 
          @click="fetchDevice" 
          class="bg-red-100 hover:bg-red-200 mt-4 px-4 py-2 rounded-lg text-red-700 text-sm transition-colors"
        >
          Spróbuj ponownie
        </button>
      </div>

      <!-- Device Details -->
      <div v-else-if="device" class="bg-white shadow-lg rounded-xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-3xl">🔧</span>
            <h2 class="font-bold text-2xl">{{ device.name }}</h2>
          </div>
          <p class="text-blue-100">{{ device.type }} | {{ device.location }}</p>
        </div>

        <!-- Details Grid -->
        <div class="p-6">
          <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
            <div class="space-y-4">
              <div>
                <p class="text-gray-500 text-sm">Numer seryjny</p>
                <p class="font-medium text-slate-800">{{ device.serial_number || '-' }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Producent / Model</p>
                <p class="font-medium text-slate-800">
                  {{ device.manufacturer || device.brand || '-' }} / {{ device.model || '-' }}
                </p>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Data instalacji</p>
                <p class="font-medium text-slate-800">{{ formatDate(device.installation_date) }}</p>
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <p class="text-gray-500 text-sm">Lokalizacja</p>
                <p class="font-medium text-slate-800">{{ device.location }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Typ urządzenia</p>
                <p class="font-medium text-slate-800">{{ device.type }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-sm">ID urządzenia</p>
                <p class="font-mono text-slate-600 text-sm">{{ device.uuid }}</p>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="device.notes" class="mt-6 pt-6 border-gray-100 border-t">
            <p class="mb-2 text-gray-500 text-sm">Notatki</p>
            <p class="text-slate-700">{{ device.notes }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex sm:flex-row flex-col gap-3 mt-8 pt-6 border-gray-100 border-t">
            <a 
              :href="`/report?device=${device.uuid}`"
              class="flex-1 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-medium text-white text-center transition-colors"
            >
              🚨 Zgłoś awarię
            </a>
            <button 
              @click="printPage"
              class="flex-1 bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg font-medium text-gray-700 transition-colors"
            >
              🖨️ Drukuj
            </button>
          </div>
        </div>
      </div>

      <!-- No device -->
      <div v-else class="py-12 text-center">
        <p class="text-gray-500">Nie znaleziono urządzenia</p>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-12 py-6 border-gray-200 border-t">
      <div class="mx-auto px-4 max-w-3xl text-gray-400 text-sm text-center">
        ServiceHub © 2026
      </div>
    </footer>
  </div>
</template>
