<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'purple' | 'cyan'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  class?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  info: 'bg-sky-500 hover:bg-sky-600 text-white',
  purple: 'bg-purple-500 hover:bg-purple-600 text-white',
  cyan: 'bg-cyan-500 hover:bg-cyan-600 text-white'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      variantClasses[variant],
      sizeClasses[size],
      (disabled || loading) && 'opacity-60 cursor-not-allowed',
      $props.class
    ]"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="animate-spin">⏳</span>
    <slot />
  </button>
</template>
