<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  required?: boolean
  disabled?: boolean
  error?: string
  icon?: string
  class?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  focus: []
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="$props.class">
    <label v-if="label" class="block mb-1 font-medium text-gray-700 text-sm">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <span v-if="icon" class="top-2.5 left-3 absolute text-gray-400">{{ icon }}</span>
      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :class="[
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
          icon && 'pl-10',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-transparent',
          disabled && 'bg-gray-100 cursor-not-allowed'
        ]"
        @input="updateValue"
        @blur="emit('blur')"
        @focus="emit('focus')"
      />
    </div>
    <p v-if="error" class="mt-1 text-red-500 text-sm">{{ error }}</p>
  </div>
</template>
