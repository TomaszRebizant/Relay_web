<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const installationTasks = ref<any[]>([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  await fetchInstallationTasks()
})

const fetchInstallationTasks = async () => {
  try {
    loading.value = true
    const response = await api.get('/installations')
    installationTasks.value = response.data || []
  } catch (err: any) {
    console.error('Error fetching installation tasks:', err)
    error.value = 'Błąd podczas pobierania zadań instalacyjnych'
  } finally {
    loading.value = false
  }
}

const completeInstallation = async (taskId: number) => {
  try {
    loading.value = true
    await api.patch(`/installations/${taskId}`, { status: 'completed' })
    await fetchInstallationTasks()
  } catch (err: any) {
    console.error('Error completing installation:', err)
    alert('Błąd podczas oznaczania instalacji jako ukończonej')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Zadania instalacyjne</h1>
      <p class="text-gray-600 mt-1">Zarządzaj zadaniami instalacji urządzeń</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-gray-600">Ładowanie zadań...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="installationTasks.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
      <div class="text-4xl mb-4">📋</div>
      <p class="text-gray-600">Brak zadań instalacyjnych</p>
    </div>

    <!-- Tasks List -->
    <div v-else class="space-y-4">
      <div 
        v-for="task in installationTasks" 
        :key="task.id"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-semibold text-lg text-gray-800">{{ task.device_name || 'Urządzenie' }}</h3>
            <p class="text-gray-600 mt-1">{{ task.location || 'Lokalizacja nieokreślona' }}</p>
            <div class="mt-3 flex gap-4 text-sm">
              <span class="text-gray-500">📅 {{ task.scheduled_date || 'Brak daty' }}</span>
              <span class="text-gray-500">🏷️ {{ task.device_type || 'Typ nieokreślony' }}</span>
            </div>
            <div 
              class="mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium"
              :class="{
                'bg-yellow-100 text-yellow-800': task.status === 'pending',
                'bg-blue-100 text-blue-800': task.status === 'in_progress',
                'bg-green-100 text-green-800': task.status === 'completed'
              }"
            >
              {{ task.status === 'pending' ? 'Oczekujące' : task.status === 'in_progress' ? 'W trakcie' : 'Ukończone' }}
            </div>
          </div>
          <button 
            v-if="task.status !== 'completed'"
            @click="completeInstallation(task.id)"
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Oznacz jako ukończone
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
