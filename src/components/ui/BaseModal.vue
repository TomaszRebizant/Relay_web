<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const emit = defineEmits<{
  close: []
}>()

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl'
}

const closeOnBackdrop = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
      @click="closeOnBackdrop"
    >
      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition-all duration-200"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0"
      >
        <div
          v-if="show"
          :class="[
            'bg-white shadow-xl rounded-xl w-full overflow-hidden',
            sizeClasses[size]
          ]"
          :style="maxHeight ? { maxHeight } : {}"
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="flex justify-between items-center p-6 border-gray-200 border-b">
            <slot name="header">
              <h2 class="font-semibold text-slate-800 text-xl">{{ title }}</h2>
            </slot>
            <button
              @click="emit('close')"
              class="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              aria-label="Zamknij"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div
            :class="[
              'p-6',
              maxHeight && 'overflow-y-auto'
            ]"
          >
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="flex justify-end gap-3 p-6 border-gray-200 border-t">
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
