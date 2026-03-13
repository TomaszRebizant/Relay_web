import { ref, computed, type Ref } from 'vue'

export interface UseFilterOptions<T> {
  items: Ref<T[]>
  searchFields: (keyof T)[]
}

export function useFilter<T extends Record<string, any>>(options: UseFilterOptions<T>) {
  const { items, searchFields } = options
  
  const searchQuery = ref('')
  const activeFilters = ref<Record<string, string>>({})
  
  const filteredItems = computed(() => {
    let result = items.value
    
    // Apply search
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(item => 
        searchFields.some(field => {
          const value = item[field]
          return value && String(value).toLowerCase().includes(query)
        })
      )
    }
    
    // Apply filters
    Object.entries(activeFilters.value).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(item => item[key] === value)
      }
    })
    
    return result
  })
  
  const setFilter = (key: string, value: string) => {
    activeFilters.value[key] = value
  }
  
  const clearFilter = (key: string) => {
    delete activeFilters.value[key]
  }
  
  const clearAllFilters = () => {
    searchQuery.value = ''
    activeFilters.value = {}
  }
  
  return {
    searchQuery,
    activeFilters,
    filteredItems,
    setFilter,
    clearFilter,
    clearAllFilters
  }
}
