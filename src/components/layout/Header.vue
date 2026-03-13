<script setup lang="ts">
import { ref } from 'vue'

const notifications = ref([
  {
    id: 1,
    title: 'Nowe zgłoszenie',
    message: 'Klimatyzacja - awaria w budynku A',
    time: '5 min temu',
    unread: true
  },
  {
    id: 2,
    title: 'Zakończono naprawę',
    message: 'Ogrzewanie - budowlany B',
    time: '1 godz temu',
    unread: false
  }
])

const showNotifications = ref(false)
const showUserMenu = ref(false)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const unreadCount = notifications.value.filter(n => n.unread).length
</script>

<template>
  <header class="flex justify-between items-center bg-white shadow-sm px-8 py-4 border-gray-200 border-b">
    <div class="flex-1">
      <h1 class="font-semibold text-slate-800 text-2xl">Dashboard</h1>
    </div>
    
    <div class="flex items-center">
      <div class="flex items-center gap-4">
        <div class="relative">
          <input 
            type="text" 
            placeholder="Szukaj..." 
            class="py-2 pr-4 pl-10 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm transition-all"
          />
          <span class="top-1/2 right-3 absolute text-gray-500 text-sm -translate-y-1/2 transform">🔍</span>
        </div>
        
        <div class="relative">
          <button 
            @click="toggleNotifications"
            class="flex items-center gap-2 bg-transparent hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-all"
            :class="{ 'bg-blue-50 border-blue-500': showNotifications }"
          >
            <span class="text-lg">🔔</span>
            <span 
              v-if="unreadCount > 0" 
              class="bg-red-500 px-2 py-0.5 rounded-full font-semibold text-white text-xs"
            >
              {{ unreadCount }}
            </span>
          </button>
          
          <div 
            v-if="showNotifications" 
            class="right-0 z-50 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-lg w-80"
          >
            <div class="flex justify-between items-center p-4 border-gray-200 border-b">
              <h3 class="font-semibold text-gray-800">Powiadomienia</h3>
              <button class="text-blue-500 text-sm hover:underline">Oznacz wszystkie jako przeczytane</button>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="hover:bg-gray-50 p-4 border-gray-100 border-b transition-colors cursor-pointer"
                :class="{ 'bg-blue-50': notification.unread }"
              >
                <div class="mb-1 font-semibold text-gray-800">{{ notification.title }}</div>
                <div class="mb-1 text-gray-600 text-sm">{{ notification.message }}</div>
                <div class="text-gray-400 text-xs">{{ notification.time }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="relative">
          <button 
            @click="toggleUserMenu"
            class="flex items-center gap-2 bg-transparent hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-all"
            :class="{ 'bg-blue-50 border-blue-500': showUserMenu }"
          >
            <span class="flex justify-center items-center bg-gray-100 rounded-full w-8 h-8 text-lg">👤</span>
            <span class="font-medium text-gray-700">Admin User</span>
            <span class="text-gray-500 text-xs transition-transform" :class="{ 'rotate-180': showUserMenu }">▼</span>
          </button>
          
          <div 
            v-if="showUserMenu" 
            class="right-0 z-50 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-lg w-48"
          >
            <a href="#" class="block hover:bg-gray-50 px-4 py-3 text-gray-700 transition-colors">Profil</a>
            <a href="#" class="block hover:bg-gray-50 px-4 py-3 text-gray-700 transition-colors">Ustawienia</a>
            <div class="border-gray-200 border-t"></div>
            <a href="#" class="block hover:bg-red-50 px-4 py-3 text-red-600 transition-colors">Wyloguj się</a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
