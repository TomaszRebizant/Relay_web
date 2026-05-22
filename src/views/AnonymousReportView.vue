<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()

const deviceId = ref<string>('')
const deviceName = ref<string>('')
const deviceLocation = ref<string>('')
const loading = ref(false)
const error = ref('')
const submitted = ref(false)

const reportForm = ref({
  title: '',
  description: '',
  contact: '',
  images: [] as string[]
})

onMounted(async () => {
  deviceId.value = route.query.device as string || ''
  
  if (!deviceId.value) {
    error.value = 'Brak ID urządzenia. Zeskanuj ponownie kod QR.'
    return
  }

  // Fetch device info
  try {
    loading.value = true
    const response = await api.get(`/devices/${deviceId.value}`)
    const device = response.data
    deviceName.value = device.name || 'Nieznane urządzenie'
    deviceLocation.value = device.location || 'Nieznana lokalizacja'
  } catch (err: any) {
    console.error('Error fetching device:', err)
    error.value = 'Nie znaleziono urządzenia. Sprawdź kod QR.'
  } finally {
    loading.value = false
  }
})

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        reportForm.value.images.push(result)
      }
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index: number) => {
  reportForm.value.images.splice(index, 1)
}

const submitReport = async () => {
  if (!reportForm.value.title) {
    alert('Wypełnij tytuł zgłoszenia')
    return
  }

  try {
    loading.value = true
    const faultData = {
      title: reportForm.value.title,
      description: reportForm.value.description,
      reported_by: 'Anonimowy',
      contact: reportForm.value.contact || null
    }

    console.log('Creating anonymous fault for device:', deviceId.value, faultData)
    const response = await api.post(`/devices/${deviceId.value}/faults`, faultData)
    console.log('Fault created:', response.data)

    submitted.value = true
  } catch (err: any) {
    console.error('Error creating report:', err)
    console.error('Error response:', err.response?.data)
    alert('Błąd podczas tworzenia zgłoszenia: ' + (err.response?.data?.message || err.message))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white shadow-xl rounded-2xl w-full max-w-lg overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <h1 class="text-2xl font-bold">Zgłoś awarię</h1>
        <p class="text-blue-100 text-sm mt-1">Formularz anonimowy</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Ładowanie informacji o urządzeniu...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-8 text-center">
        <div class="text-4xl mb-4">❌</div>
        <p class="text-red-600 font-medium">{{ error }}</p>
        <button 
          @click="router.push('/')"
          class="mt-4 bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg text-white transition-colors"
        >
          Wróć do strony głównej
        </button>
      </div>

      <!-- Success State -->
      <div v-else-if="submitted" class="p-8 text-center">
        <div class="text-6xl mb-4">✅</div>
        <h2 class="text-2xl font-bold text-green-600 mb-2">Zgłoszenie wysłane!</h2>
        <p class="text-gray-600 mb-6">Dziękujemy za zgłoszenie. Sprawdzimy problem i zajmiemy się nim jak najszybciej.</p>
        <button 
          @click="router.push('/')"
          class="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg text-white transition-colors"
        >
          Wróć do strony głównej
        </button>
      </div>

      <!-- Form -->
      <div v-else class="p-6 space-y-4">
        <!-- Device Info -->
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Urządzenie:</p>
          <p class="font-semibold text-slate-800">{{ deviceName }}</p>
          <p class="text-sm text-gray-500">{{ deviceLocation }}</p>
        </div>

        <!-- Anonymous Notice -->
        <div class="bg-green-50 px-3 py-2 rounded-lg">
          <p class="text-green-700 text-sm">🔒 To zgłoszenie jest <strong>anonimowe</strong>. Twoje dane nie będą udostępnione.</p>
        </div>

        <!-- Title -->
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Tytuł zgłoszenia *</label>
          <input 
            v-model="reportForm.title" 
            type="text" 
            required
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            placeholder="np. Klimatyzacja nie chłodzi"
          >
        </div>

        <!-- Description -->
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Opis problemu</label>
          <textarea 
            v-model="reportForm.description" 
            rows="4"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            placeholder="Opisz szczegółowo problem..."
          ></textarea>
        </div>

        <!-- Images -->
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Zdjęcia (opcjonalne)</label>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input 
              type="file" 
              accept="image/*" 
              multiple
              @change="handleImageUpload"
              class="w-full"
            >
            <p class="mt-2 text-gray-500 text-sm">Możesz dodać kilka zdjęć dokumentujących problem</p>
            <div v-if="reportForm.images.length > 0" class="mt-3 flex gap-2 flex-wrap">
              <div v-for="(img, idx) in reportForm.images" :key="idx" class="relative">
                <img :src="img" class="w-20 h-20 object-cover rounded">
                <button 
                  @click="removeImage(idx)"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                >✕</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Kontakt opcjonalny (email/telefon)</label>
          <input 
            v-model="reportForm.contact" 
            type="text" 
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            placeholder="email@example.com lub +48 123 456 789"
          >
          <p class="mt-1 text-gray-500 text-xs">Podaj kontakt tylko jeśli chcesz otrzymać informację o rozwiązaniu problemu</p>
        </div>

        <!-- Submit Button -->
        <button 
          @click="submitReport"
          :disabled="loading"
          class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 px-6 py-3 rounded-lg text-white font-medium transition-colors"
        >
          {{ loading ? 'Wysyłanie...' : 'Wyślij zgłoszenie' }}
        </button>

        <!-- Cancel Button -->
        <button 
          @click="router.push('/')"
          class="w-full hover:bg-gray-50 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
        >
          Anuluj
        </button>
      </div>
    </div>
  </div>
</template>
