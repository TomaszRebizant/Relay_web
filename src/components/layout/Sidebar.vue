<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

const menuItems = computed(() => {
  const items = [
    {
      icon: '📊',
      label: 'Dashboard',
      route: '/',
      roles: ['admin', 'service', 'installer']
    },
    {
      icon: '🔧',
      label: 'Urządzenia',
      route: '/devices',
      roles: ['admin', 'service', 'installer']
    },
    {
      icon: '📝',
      label: 'Zgłoszenia',
      route: '/reports',
      roles: ['admin', 'service']
    },
    {
      icon: '🔨',
      label: 'Instalacje',
      route: '/installer',
      roles: ['admin', 'installer']
    },
    {
      icon: '👥',
      label: 'Użytkownicy',
      route: '/users',
      roles: ['admin']
    },
    {
      icon: '⚙️',
      label: 'Ustawienia',
      route: '/settings',
      roles: ['admin']
    }
  ]

  // Filter items based on user role
  return items.filter(item => {
    if (authStore.isAdmin) return item.roles.includes('admin')
    if (authStore.isService) return item.roles.includes('service')
    if (authStore.isInstaller) return item.roles.includes('installer')
    // If user has no role, show basic items (dashboard, devices)
    return ['/', '/devices'].includes(item.route)
  })
})

const isActive = (itemRoute: string) => {
  if (itemRoute === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(itemRoute)
}
</script>

<template>
  <aside class="flex flex-col bg-gradient-to-b from-slate-700 to-slate-800 shadow-lg w-64 text-white">
    <div class="p-6 border-white/10 border-b">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🔧</span>
        <span class="font-semibold text-gray-100 text-xl">ServiceHub</span>
      </div>
    </div>
    
    <nav class="flex-1 py-4">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.route">
          <RouterLink 
            :to="item.route" 
            class="flex items-center gap-3 hover:bg-white/10 px-6 py-3.5 border-transparent border-l-4 text-white/80 hover:text-white transition-all duration-300"
            :class="{ 'bg-white/15 text-white border-l-blue-500': isActive(item.route) }"
          >
            <span class="w-5 text-lg text-center">{{ item.icon }}</span>
            <span class="font-medium">{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
    
    <div class="p-4 border-white/10 border-t">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex justify-center items-center bg-white/20 rounded-full w-10 h-10 text-lg">
          👤
        </div>
        <div class="flex-1">
          <div class="font-semibold text-gray-100 text-sm">{{ authStore.user?.name || authStore.user?.email || 'Użytkownik' }}</div>
          <div class="text-white/60 text-xs">
            {{ authStore.isAdmin ? 'Administrator' : authStore.isService ? 'Serwisant' : authStore.isInstaller ? 'Instalator' : 'Użytkownik' }}
          </div>
        </div>
      </div>
      <button 
        @click="handleLogout"
        class="flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg w-full text-white/80 hover:text-white transition-all duration-300"
      >
        <span>🚪</span>
        <span class="font-medium text-sm">Wyloguj się</span>
      </button>
    </div>
  </aside>
</template>
