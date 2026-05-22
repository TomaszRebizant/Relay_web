<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'

const authStore = useAuthStore()

// 2FA Setup
const twoFASecret = ref<string>('')
const twoFAQRCode = ref<string>('')
const twoFARecoveryCodes = ref<string[]>([])
const show2FASetup = ref(false)

async function setupTwoFactor() {
  const result = await authStore.setup2FA()
  if (result) {
    twoFAQRCode.value = result.qr_code || result.svg || ''
    twoFARecoveryCodes.value = result.recovery_codes || []
    show2FASetup.value = true
  }
}

function close2FASetup() {
  show2FASetup.value = false
  twoFASecret.value = ''
  twoFAQRCode.value = ''
  twoFARecoveryCodes.value = []
}

// General settings
const generalSettings = ref({
  siteName: 'ServiceHub',
  siteDescription: 'Panel zarządzania urządzeniami',
  adminEmail: 'admin@servicehub.com',
  timezone: 'Europe/Warsaw',
  language: 'pl',
  dateFormat: 'DD.MM.YYYY',
  timeFormat: '24h'
})

// Notification settings
const notificationSettings = ref({
  emailNotifications: true,
  pushNotifications: false,
  maintenanceAlerts: true,
  deviceAlerts: true,
  userActivityAlerts: false,
  weeklyReports: true
})

// Security settings
const securitySettings = ref({
  sessionTimeout: '30',
  passwordMinLength: '8',
  requireTwoFactor: false,
  loginAttempts: '5',
  autoLogout: true
})

// System settings
const systemSettings = ref({
  maintenanceMode: false,
  debugMode: false,
  logLevel: 'info',
  backupFrequency: 'daily',
  maxFileSize: '10'
})

const timezones = [
  'Europe/Warsaw',
  'Europe/Berlin',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo'
]

const languages = [
  { code: 'pl', name: 'Polski' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' }
]

const dateFormats = [
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
]

const logLevels = [
  { value: 'debug', label: 'Debug' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' }
]

const backupFrequencies = [
  { value: 'daily', label: 'Codziennie' },
  { value: 'weekly', label: 'Co tydzień' },
  { value: 'monthly', label: 'Co miesiąc' }
]

const saveSettings = () => {
  // In a real app, this would save to backend
  console.log('Settings saved:', {
    general: generalSettings.value,
    notifications: notificationSettings.value,
    security: securitySettings.value,
    system: systemSettings.value
  })
  // Show success message
  alert('Ustawienia zostały zapisane!')
}

const resetSettings = () => {
  if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia do domyślnych?')) {
    // Reset to default values
    generalSettings.value = {
      siteName: 'ServiceHub',
      siteDescription: 'Panel zarządzania urządzeniami',
      adminEmail: 'admin@servicehub.com',
      timezone: 'Europe/Warsaw',
      language: 'pl',
      dateFormat: 'DD.MM.YYYY',
      timeFormat: '24h'
    }
    notificationSettings.value = {
      emailNotifications: true,
      pushNotifications: false,
      maintenanceAlerts: true,
      deviceAlerts: true,
      userActivityAlerts: false,
      weeklyReports: true
    }
    securitySettings.value = {
      sessionTimeout: '30',
      passwordMinLength: '8',
      requireTwoFactor: false,
      loginAttempts: '5',
      autoLogout: true
    }
    systemSettings.value = {
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
      backupFrequency: 'daily',
      maxFileSize: '10'
    }
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <section>
      <h1 class="mb-2 font-bold text-slate-800 text-3xl">Ustawienia</h1>
      <p class="text-gray-600">Zarządzaj konfiguracją systemu i preferencjami</p>
    </section>

    <!-- General Settings -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <h2 class="flex items-center gap-2 mb-4 font-semibold text-slate-800 text-lg">
        <span class="text-xl">⚙️</span>
        Ustawienia ogólne
      </h2>
      
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Nazwa serwisu</label>
          <input 
            v-model="generalSettings.siteName" 
            type="text" 
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
        </div>
        
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Email administratora</label>
          <input 
            v-model="generalSettings.adminEmail" 
            type="email" 
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
        </div>
        
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Strefa czasowa</label>
          <select 
            v-model="generalSettings.timezone" 
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
          </select>
        </div>
        
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Język</label>
          <select 
            v-model="generalSettings.language" 
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
          </select>
        </div>
        
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Format daty</label>
          <select 
            v-model="generalSettings.dateFormat" 
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option v-for="format in dateFormats" :key="format.value" :value="format.value">{{ format.label }}</option>
          </select>
        </div>
        
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Format czasu</label>
          <select 
            v-model="generalSettings.timeFormat" 
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value="24h">24-godzinny</option>
            <option value="12h">12-godzinny (AM/PM)</option>
          </select>
        </div>
      </div>
      
      <div class="mt-4">
        <label class="block mb-1 font-medium text-gray-700 text-sm">Opis serwisu</label>
        <textarea 
          v-model="generalSettings.siteDescription" 
          rows="2"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        ></textarea>
      </div>
    </section>

    <!-- Notification Settings -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <h2 class="flex items-center gap-2 mb-4 font-semibold text-slate-800 text-lg">
        <span class="text-xl">🔔</span>
        Powiadomienia
      </h2>
      
      <div class="space-y-3">
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.emailNotifications" 
            type="checkbox" 
            class="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
          >
          <span class="text-sm">Powiadomienia email</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.pushNotifications" 
            type="checkbox" 
            class="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
          >
          <span class="text-sm">Powiadomienia push</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.maintenanceAlerts" 
            type="checkbox" 
            class="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
          >
          <span class="text-sm">Alerty o konserwacji</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.deviceAlerts" 
            type="checkbox" 
            class="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
          >
          <span class="text-sm">Alerty o urządzeniach</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.userActivityAlerts" 
            type="checkbox" 
            class="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
          >
          <span class="text-sm">Alerty o aktywności użytkowników</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.weeklyReports" 
            type="checkbox" 
            class="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
          >
          <span class="text-sm">Tygodniowe raporty</span>
        </label>
      </div>
    </section>

    <!-- Security Settings -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <h2 class="flex items-center gap-2 mb-4 font-semibold text-slate-800 text-lg">
        <span class="text-xl">🔒</span>
        Bezpieczeństwo
      </h2>
      
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Timeout sesji (minuty)</label>
          <input 
            v-model="securitySettings.sessionTimeout" 
            type="number" 
            min="5"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
        </div>
        
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Minimalna długość hasła</label>
          <input 
            v-model="securitySettings.passwordMinLength" 
            type="number" 
            min="4"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
        </div>
        
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Maksymalna liczba prób logowania</label>
          <input 
            v-model="securitySettings.loginAttempts" 
            type="number" 
            min="3"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
        </div>
      </div>
      
      <div class="space-y-3 mt-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="securitySettings.requireTwoFactor" 
            type="checkbox" 
            class="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
          >
          <span class="text-sm">Wymagaj uwierzytelniania dwuskładnikowego</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="securitySettings.autoLogout" 
            type="checkbox" 
            class="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
          >
          <span class="text-sm">Automatyczne wylogowywanie</span>
        </label>
      </div>

      <!-- 2FA Setup Section -->
      <div class="mt-6 pt-6 border-gray-200 border-t">
        <h3 class="mb-3 font-medium text-gray-800">Uwierzytelnianie dwuskładnikowe (2FA)</h3>
        <p class="mb-4 text-gray-600 text-sm">
          Skonfiguruj aplikację uwierzytelniającą (np. Google Authenticator) dla zwiększenia bezpieczeństwa konta.
        </p>
        <BaseButton 
          @click="setupTwoFactor"
          :loading="authStore.loading"
          variant="primary"
        >
          📱 Skonfiguruj 2FA
        </BaseButton>
      </div>
    </section>

    <!-- 2FA Setup Modal -->
    <div v-if="show2FASetup" class="z-50 fixed inset-0 flex justify-center items-center bg-black/50">
      <BaseCard class="mx-4 p-6 w-full max-w-lg">
        <h3 class="mb-4 font-bold text-xl">Konfiguracja 2FA</h3>
        
        <div v-if="twoFAQRCode" class="mb-4">
          <p class="mb-2 text-gray-600 text-sm">Zeskanuj kod QR w aplikacji uwierzytelniającej:</p>
          <div class="flex justify-center bg-white p-4 rounded-lg" v-html="twoFAQRCode"></div>
        </div>
        
        <div v-if="twoFARecoveryCodes.length > 0" class="mb-4">
          <p class="mb-2 text-gray-600 text-sm">Kody odzyskiwania (zapisz je w bezpiecznym miejscu):</p>
          <div class="bg-gray-100 p-3 rounded">
            <code v-for="(code, index) in twoFARecoveryCodes" :key="index" class="block mb-1 text-sm">{{ code }}</code>
          </div>
        </div>
        
        <div class="flex gap-3">
          <BaseButton @click="close2FASetup" variant="secondary" class="flex-1">
            Zamknij
          </BaseButton>
        </div>
      </BaseCard>
    </div>

    <!-- System Settings -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <h2 class="flex items-center gap-2 mb-4 font-semibold text-slate-800 text-lg">
        <span class="text-xl">🖥️</span>
        System
      </h2>
      
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Poziom logowania</label>
          <select 
            v-model="systemSettings.logLevel" 
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option v-for="level in logLevels" :key="level.value" :value="level.value">{{ level.label }}</option>
          </select>
        </div>
        
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Częstotliwość backupu</label>
          <select 
            v-model="systemSettings.backupFrequency" 
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option v-for="freq in backupFrequencies" :key="freq.value" :value="freq.value">{{ freq.label }}</option>
          </select>
        </div>
        
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Maksymalny rozmiar pliku (MB)</label>
          <input 
            v-model="systemSettings.maxFileSize" 
            type="number" 
            min="1"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
        </div>
      </div>
      
      <div class="space-y-3 mt-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="systemSettings.maintenanceMode" 
            type="checkbox" 
            class="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
          >
          <span class="text-sm">Tryb konserwacji</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="systemSettings.debugMode" 
            type="checkbox" 
            class="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
          >
          <span class="text-sm">Tryb debugowania</span>
        </label>
      </div>
    </section>

    <!-- Action Buttons -->
    <section class="flex gap-4">
      <button 
        @click="saveSettings"
        class="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg text-white transition-colors"
      >
        💾 Zapisz ustawienia
      </button>
      <button 
        @click="resetSettings"
        class="hover:bg-gray-50 px-6 py-2 border border-gray-300 rounded-lg transition-colors"
      >
        🔄 Resetuj do domyślnych
      </button>
    </section>
  </div>
</template>
