<script setup lang="ts">
interface Props {
  title?: string
  icon?: string
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'cyan' | 'gray'
  clickable?: boolean
  active?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'gray',
  clickable: false,
  active: false
})

const emit = defineEmits<{
  click: []
}>()

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  cyan: 'bg-cyan-500',
  gray: 'bg-gray-500'
}
</script>

<template>
  <div
    :class="[
      'bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all',
      clickable && 'cursor-pointer',
      active && 'ring-2 ring-blue-500',
      $props.class
    ]"
    @click="clickable && emit('click')"
  >
    <div class="flex items-center gap-3">
      <div
        v-if="icon"
        :class="[
          'flex justify-center items-center rounded-lg w-10 h-10 text-white',
          colorClasses[color]
        ]"
      >
        {{ icon }}
      </div>
      <div class="flex-1">
        <slot name="title">
          <h3 v-if="title" class="font-semibold text-slate-800 text-lg">{{ title }}</h3>
        </slot>
        <slot />
      </div>
    </div>
  </div>
</template>
