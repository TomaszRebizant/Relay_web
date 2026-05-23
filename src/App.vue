<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import Toast from './components/ui/Toast.vue'
import { useNotifications } from './composables/useNotifications'

const { notifications, removeNotification } = useNotifications()
</script>

<template>
  <div class="flex bg-gray-50 min-h-screen">
    <Sidebar />
    <main class="flex-1 p-4 md:p-8 w-full overflow-y-auto">
      <RouterView />
    </main>
    
    <!-- Toast container -->
    <div class="top-4 right-4 z-50 fixed space-y-3">
      <Toast 
        v-for="notification in notifications" 
        :key="notification.id"
        :notification="notification"
        @close="removeNotification(notification.id)"
      />
    </div>
  </div>
</template>
