<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  rows?: number
  required?: boolean
  disabled?: boolean
  error?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  rows: 3
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  focus: []
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="$props.class">
    <label v-if="label" class="block mb-1 font-medium text-gray-700 text-sm">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <textarea
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="[
        'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-vertical',
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-transparent',
        disabled && 'bg-gray-100 cursor-not-allowed'
      ]"
      @input="updateValue"
      @blur="emit('blur')"
      @focus="emit('focus')"
    />
    <p v-if="error" class="mt-1 text-red-500 text-sm">{{ error }}</p>
  </div>
</template>
