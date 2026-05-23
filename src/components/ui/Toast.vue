<script setup lang="ts">
import type { Notification } from '@/composables/useNotifications'

interface Props {
  notification: Notification
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const typeColors = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500'
}

const typeIcons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌'
}
</script>

<template>
  <div 
    :class="[
      'flex items-start gap-3 shadow-lg p-4 rounded-lg text-white min-w-[300px] max-w-md animate-slide-in',
      typeColors[notification.type]
    ]"
  >
    <span class="text-xl">{{ typeIcons[notification.type] }}</span>
    <div class="flex-1">
      <h4 class="font-semibold text-sm">{{ notification.title }}</h4>
      <p class="text-sm opacity-90">{{ notification.message }}</p>
    </div>
    <button 
      @click="emit('close')"
      class="text-white/80 hover:text-white text-lg leading-none"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
