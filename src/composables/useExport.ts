import { ref } from 'vue'

interface ExportOptions {
  filename?: string
  headers?: string[]
}

export function useExport() {
  const isExporting = ref(false)
  
  const exportToCSV = <T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = {}
  ) => {
    const { 
      filename = `export_${new Date().toISOString().split('T')[0]}`,
      headers 
    } = options
    
    isExporting.value = true
    
    try {
      const csvHeaders = headers || Object.keys(data[0] || {})
      const rows = data.map(item => 
        csvHeaders.map(header => {
          const value = item[header]
          // Escape values with commas or quotes
          const stringValue = value === null || value === undefined ? '' : String(value)
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
      )
      
      const csvContent = [csvHeaders.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    } finally {
      isExporting.value = false
    }
  }
  
  return {
    isExporting,
    exportToCSV
  }
}
