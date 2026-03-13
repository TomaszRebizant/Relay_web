<script setup lang="ts">
import { ref } from 'vue'

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
      <h1 class="font-bold text-slate-800 text-3xl mb-2">Ustawienia</h1>
      <p class="text-gray-600">Zarządzaj konfiguracją systemu i preferencjami</p>
    </section>

    <!-- General Settings -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <h2 class="font-semibold text-slate-800 text-lg mb-4 flex items-center gap-2">
        <span class="text-xl">⚙️</span>
        Ustawienia ogólne
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nazwa serwisu</label>
          <input 
            v-model="generalSettings.siteName" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email administratora</label>
          <input 
            v-model="generalSettings.adminEmail" 
            type="email" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Strefa czasowa</label>
          <select 
            v-model="generalSettings.timezone" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Język</label>
          <select 
            v-model="generalSettings.language" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Format daty</label>
          <select 
            v-model="generalSettings.dateFormat" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="format in dateFormats" :key="format.value" :value="format.value">{{ format.label }}</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Format czasu</label>
          <select 
            v-model="generalSettings.timeFormat" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">24-godzinny</option>
            <option value="12h">12-godzinny (AM/PM)</option>
          </select>
        </div>
      </div>
      
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Opis serwisu</label>
        <textarea 
          v-model="generalSettings.siteDescription" 
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>
    </section>

    <!-- Notification Settings -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <h2 class="font-semibold text-slate-800 text-lg mb-4 flex items-center gap-2">
        <span class="text-xl">🔔</span>
        Powiadomienia
      </h2>
      
      <div class="space-y-3">
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.emailNotifications" 
            type="checkbox" 
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="text-sm">Powiadomienia email</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.pushNotifications" 
            type="checkbox" 
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="text-sm">Powiadomienia push</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.maintenanceAlerts" 
            type="checkbox" 
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="text-sm">Alerty o konserwacji</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.deviceAlerts" 
            type="checkbox" 
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="text-sm">Alerty o urządzeniach</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.userActivityAlerts" 
            type="checkbox" 
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="text-sm">Alerty o aktywności użytkowników</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="notificationSettings.weeklyReports" 
            type="checkbox" 
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="text-sm">Tygodniowe raporty</span>
        </label>
      </div>
    </section>

    <!-- Security Settings -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <h2 class="font-semibold text-slate-800 text-lg mb-4 flex items-center gap-2">
        <span class="text-xl">🔒</span>
        Bezpieczeństwo
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Timeout sesji (minuty)</label>
          <input 
            v-model="securitySettings.sessionTimeout" 
            type="number" 
            min="5"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Minimalna długość hasła</label>
          <input 
            v-model="securitySettings.passwordMinLength" 
            type="number" 
            min="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Maksymalna liczba prób logowania</label>
          <input 
            v-model="securitySettings.loginAttempts" 
            type="number" 
            min="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>
      
      <div class="space-y-3 mt-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="securitySettings.requireTwoFactor" 
            type="checkbox" 
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="text-sm">Wymagaj uwierzytelniania dwuskładnikowego</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="securitySettings.autoLogout" 
            type="checkbox" 
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="text-sm">Automatyczne wylogowywanie</span>
        </label>
      </div>
    </section>

    <!-- System Settings -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <h2 class="font-semibold text-slate-800 text-lg mb-4 flex items-center gap-2">
        <span class="text-xl">🖥️</span>
        System
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Poziom logowania</label>
          <select 
            v-model="systemSettings.logLevel" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="level in logLevels" :key="level.value" :value="level.value">{{ level.label }}</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Częstotliwość backupu</label>
          <select 
            v-model="systemSettings.backupFrequency" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="freq in backupFrequencies" :key="freq.value" :value="freq.value">{{ freq.label }}</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Maksymalny rozmiar pliku (MB)</label>
          <input 
            v-model="systemSettings.maxFileSize" 
            type="number" 
            min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>
      
      <div class="space-y-3 mt-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="systemSettings.maintenanceMode" 
            type="checkbox" 
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="text-sm">Tryb konserwacji</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer">
          <input 
            v-model="systemSettings.debugMode" 
            type="checkbox" 
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
        class="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors"
      >
        🔄 Resetuj do domyślnych
      </button>
    </section>
  </div>
</template>
