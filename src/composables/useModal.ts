import { ref, onMounted, onUnmounted } from 'vue'

export function useEscapeKey(callback: () => void) {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      callback()
    }
  }
  
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}

export function useModal() {
  const isOpen = ref(false)
  
  const open = () => isOpen.value = true
  const close = () => isOpen.value = false
  const toggle = () => isOpen.value = !isOpen.value
  
  useEscapeKey(close)
  
  return {
    isOpen,
    open,
    close,
    toggle
  }
}
