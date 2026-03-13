<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Blockchain, Block, createServiceRecord } from '@/utils/blockchain'

// Type definitions
interface Device {
  id: string
  name: string
  type: string
  location: string
  status: string
  lastMaintenance: string
  nextMaintenance: string
  temperature: string
  humidity: string
  energyUsage: string
  icon: string
  statusColor: string
  serialNumber: string
  manufacturer: string
  model: string
  installationDate: string
  warrantyExpiry: string
  description: string
  notes: string
  responsiblePerson: string
  department: string
  qrCode?: string
  latitude?: number
  longitude?: number
  blockchain?: Blockchain
}

interface EditForm {
  name: string
  type: string
  location: string
  status: string
  lastMaintenance: string
  nextMaintenance: string
  temperature: string
  humidity: string
  energyUsage: string
  serialNumber: string
  manufacturer: string
  model: string
  installationDate: string
  warrantyExpiry: string
  description: string
  notes: string
  responsiblePerson: string
  department: string
}

const devices = ref<Device[]>([
  {
    id: 'DEV-001',
    name: 'Klimatyzacja A-101',
    type: 'Klimatyzacja',
    location: 'Budynek A, piętro 1',
    status: 'working',
    lastMaintenance: '2024-02-15',
    nextMaintenance: '2024-05-15',
    temperature: '22°C',
    humidity: '45%',
    energyUsage: '2.5 kW',
    icon: '❄️',
    statusColor: 'bg-green-500',
    serialNumber: 'AC-2023-001',
    manufacturer: 'Samsung',
    model: 'AR12TXEAAWKNEU',
    installationDate: '2023-01-15',
    warrantyExpiry: '2026-01-15',
    description: 'System klimatyzacji split typu ściennego o mocy chłodniczej 3.5 kW',
    notes: 'Regularnie czyszczony filtr, sprawdzony czynnik chłodniczy',
    responsiblePerson: 'Jan Kowalski',
    department: 'IT',
    latitude: 52.2297,
    longitude: 21.0122,
    blockchain: (() => {
      const bc = new Blockchain()
      bc.addBlock({
        timestamp: '2023-01-15T10:00:00.000Z',
        action: 'installation',
        description: 'Instalacja systemu klimatyzacji split, montaż jednostki wewnętrznej i zewnętrznej, podłączenie rur miedzianych i okablowania',
        technician: 'Marek Kowalczyk',
        deviceId: 'DEV-001',
        cost: 2500
      })
      bc.addBlock({
        timestamp: '2023-07-15T14:30:00.000Z',
        action: 'maintenance',
        description: 'Przegląd okresowy - czyszczenie filtrów, sprawdzenie ciśnienia czynnika chłodniczego, dezynfekcja parownika',
        technician: 'Piotr Wiśniewski',
        deviceId: 'DEV-001',
        cost: 350,
        parts: ['filtr powietrza', 'środek dezynfekujący']
      })
      bc.addBlock({
        timestamp: '2024-02-15T09:00:00.000Z',
        action: 'maintenance',
        description: 'Coroczny przegląd - wymiana filtra, kontrola szczelności układu, pomiar wydajności chłodniczej',
        technician: 'Krzysztof Jankowski',
        deviceId: 'DEV-001',
        cost: 420,
        parts: ['filtr kieszeniowy', 'czynnik R410A']
      })
      return bc
    })()
  },
  {
    id: 'DEV-002',
    name: 'Ogrzewanie B-205',
    type: 'Ogrzewanie',
    location: 'Budynek B, piętro 2',
    status: 'maintenance',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-03-20',
    temperature: '21°C',
    humidity: '42%',
    energyUsage: '3.2 kW',
    icon: '🔥',
    statusColor: 'bg-amber-500',
    serialNumber: 'HT-2022-002',
    manufacturer: 'Viessmann',
    model: 'Vitodens 100W',
    installationDate: '2022-06-10',
    warrantyExpiry: '2027-06-10',
    description: 'Kocioł gazowy kondensacyjny o mocy 18 kW',
    notes: 'Planowana wymiana pompy obiegowej',
    responsiblePerson: 'Anna Nowak',
    department: 'Administracja',
    latitude: 52.2305,
    longitude: 21.0135,
    blockchain: (() => {
      const bc = new Blockchain()
      bc.addBlock({
        timestamp: '2022-06-10T08:00:00.000Z',
        action: 'installation',
        description: 'Instalacja kotła gazowego kondensacyjnego, montaż na ścianie, podłączenie do systemu CO i CWU, konfiguracja sterownika',
        technician: 'Tomasz Lewandowski',
        deviceId: 'DEV-002',
        cost: 8500,
        parts: ['kocioł Vitodens 100W', 'zestaw kominowy', 'armatura']
      })
      bc.addBlock({
        timestamp: '2024-01-20T11:00:00.000Z',
        action: 'repair',
        description: 'Wymiana pompy obiegowej - stara pompa wykazywała znaczne zużycie, nowa pompa z modulacją obrotów',
        technician: 'Marek Kowalczyk',
        deviceId: 'DEV-002',
        cost: 1200,
        parts: ['pompa obiegowa Grundfos', 'uszczelki', 'ciecz chłodnicza']
      })
      return bc
    })()
  },
  {
    id: 'DEV-003',
    name: 'Wentylacja C-301',
    type: 'Wentylacja',
    location: 'Budynek C, piętro 3',
    status: 'working',
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-05-01',
    temperature: '20°C',
    humidity: '40%',
    energyUsage: '1.8 kW',
    icon: '💨',
    statusColor: 'bg-green-500',
    serialNumber: 'VT-2023-003',
    manufacturer: 'Systemair',
    model: 'Topaz PX',
    installationDate: '2023-03-20',
    warrantyExpiry: '2028-03-20',
    description: 'Centralna wentylacja mechaniczna z odzyskiem ciepła',
    notes: 'Sprawdzony wymiennik ciepła, wymieniony filtr kieszeniowy',
    responsiblePerson: 'Piotr Wiśniewski',
    department: 'Techniczny',
    latitude: 52.2285,
    longitude: 21.0115
  },
  {
    id: 'DEV-004',
    name: 'Klimatyzacja D-102',
    type: 'Klimatyzacja',
    location: 'Budynek D, piętro 1',
    status: 'broken',
    lastMaintenance: '2023-12-10',
    nextMaintenance: '2024-03-10',
    temperature: '--',
    humidity: '--',
    energyUsage: '0 kW',
    icon: '❄️',
    statusColor: 'bg-red-500',
    serialNumber: 'AC-2022-004',
    manufacturer: 'LG',
    model: 'LAU12HV',
    installationDate: '2022-08-15',
    warrantyExpiry: '2025-08-15',
    description: 'Klimatyzacja przenośna o mocy chłodniczej 3.5 kW',
    notes: 'Awaria sprężarki, czeka na naprawę gwarancyjną',
    responsiblePerson: 'Katarzyna Dąbrowska',
    department: 'Marketing',
    latitude: 52.2310,
    longitude: 21.0140,
    blockchain: (() => {
      const bc = new Blockchain()
      bc.addBlock({
        timestamp: '2022-08-15T09:30:00.000Z',
        action: 'installation',
        description: 'Instalacja klimatyzacji przenośnej, podłączenie do gniazda 230V, montaż rury wylotowej, konfiguracja pilotem',
        technician: 'Piotr Wiśniewski',
        deviceId: 'DEV-004',
        cost: 1800
      })
      bc.addBlock({
        timestamp: '2023-06-20T13:00:00.000Z',
        action: 'maintenance',
        description: 'Przegląd okresowy - czyszczenie filtrów, wymiana baterii w pilocie, kontrola poziomu czynnika',
        technician: 'Krzysztof Jankowski',
        deviceId: 'DEV-004',
        cost: 280,
        parts: ['baterie AAA', 'filtr powietrza']
      })
      bc.addBlock({
        timestamp: '2024-01-10T10:15:00.000Z',
        action: 'warranty_claim',
        description: 'Awaria sprężarki - urządzenie nie chłodzi, głośna praca, błąd na wyświetlaczu E1. Zgłoszenie reklamacji gwarancyjnej.',
        technician: 'Marek Kowalczyk',
        deviceId: 'DEV-004',
        cost: 0,
        parts: ['sprężarka (gwarancja)']
      })
      return bc
    })()
  },
  {
    id: 'DEV-005',
    name: 'Ogrzewanie E-201',
    type: 'Ogrzewanie',
    location: 'Budynek E, piętro 2',
    status: 'working',
    lastMaintenance: '2024-02-10',
    nextMaintenance: '2024-05-10',
    temperature: '23°C',
    humidity: '38%',
    energyUsage: '2.9 kW',
    icon: '🔥',
    statusColor: 'bg-green-500',
    serialNumber: 'HT-2023-005',
    manufacturer: 'Buderus',
    model: 'Logamax Plus',
    installationDate: '2023-09-05',
    warrantyExpiry: '2028-09-05',
    description: 'Kocioł gazowy kondensacyjny o mocy 24 kW',
    notes: 'Nowa instalacja, sprawdzony ciśnienie robocze',
    responsiblePerson: 'Tomasz Lewandowski',
    department: 'Techniczny',
    latitude: 52.2275,
    longitude: 21.0105
  },
  {
    id: 'DEV-006',
    name: 'Wentylacja F-303',
    type: 'Wentylacja',
    location: 'Budynek F, piętro 3',
    status: 'working',
    lastMaintenance: '2024-01-25',
    nextMaintenance: '2024-04-25',
    temperature: '19°C',
    humidity: '41%',
    energyUsage: '1.5 kW',
    icon: '💨',
    statusColor: 'bg-green-500',
    serialNumber: 'VT-2022-006',
    manufacturer: 'Vent-Axia',
    model: 'Sentinel Kinetic',
    installationDate: '2022-11-12',
    warrantyExpiry: '2027-11-12',
    description: 'Wentylacja z rekuperacją, sterowanie WiFi',
    notes: 'Zaktualizowane oprogramowanie, sprawdzony czujnik CO2',
    responsiblePerson: 'Magdalena Zielińska',
    department: 'HR',
    latitude: 52.2320,
    longitude: 21.0150
  }
])

// Modal states
const showDetailsModal = ref(false)
const showEditModal = ref(false)
const showAddModal = ref(false)
const showQRModal = ref(false)
const showScanModal = ref(false)
const showQuickReportModal = ref(false)
const showGeoModal = ref(false)
const showBlockchainModal = ref(false)
const showAddServiceRecordModal = ref(false)
const geoLoading = ref(false)
const geoError = ref('')
const userLocation = ref<{lat: number, lng: number} | null>(null)
const nearestDevice = ref<Device | null>(null)
const deviceDistance = ref<number>(0)
const qrCodeDataUrl = ref('')
const scannedDevice = ref<Device | null>(null)
const selectedDevice = ref<Device | null>(null)
const blockchainVerificationResult = ref<{ valid: boolean; tamperedBlocks: number[] } | null>(null)

// Service record form
const serviceRecordForm = ref({
  action: 'maintenance' as 'maintenance' | 'repair' | 'inspection' | 'installation' | 'warranty_claim',
  description: '',
  technician: '',
  cost: 0,
  parts: ''
})

// Form data for editing
const editForm = ref<EditForm>({
  name: '',
  type: '',
  location: '',
  status: '',
  lastMaintenance: '',
  nextMaintenance: '',
  temperature: '',
  humidity: '',
  energyUsage: '',
  serialNumber: '',
  manufacturer: '',
  model: '',
  installationDate: '',
  warrantyExpiry: '',
  description: '',
  notes: '',
  responsiblePerson: '',
  department: ''
})

// Form data for adding new device
const addForm = ref<EditForm>({
  name: '',
  type: '',
  location: '',
  status: 'working',
  lastMaintenance: '',
  nextMaintenance: '',
  temperature: '',
  humidity: '',
  energyUsage: '',
  serialNumber: '',
  manufacturer: '',
  model: '',
  installationDate: '',
  warrantyExpiry: '',
  description: '',
  notes: '',
  responsiblePerson: '',
  department: ''
})

// Device icons mapping
const getDeviceIcon = (type: string) => {
  const icons = {
    'Klimatyzacja': '❄️',
    'Ogrzewanie': '🔥',
    'Wentylacja': '💨'
  }
  return icons[type as keyof typeof icons] || '🔧'
}

const getStatusText = (status: string) => {
  const statusMap = {
    working: 'Działające',
    maintenance: 'Konserwacja',
    broken: 'Uszkodzone'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const filteredDevices = ref(devices.value)
const searchQuery = ref('')
const selectedType = ref('all')
const selectedStatus = ref('all')

const deviceTypes = ['all', 'Klimatyzacja', 'Ogrzewanie', 'Wentylacja']
const statusOptions = ['all', 'working', 'maintenance', 'broken']

// Filter functions
const filterByStatus = (status: string) => {
  selectedStatus.value = status
  selectedType.value = 'all'
  applyFilters()
}

const filterByType = (type: string) => {
  selectedType.value = type
  selectedStatus.value = 'all'
  applyFilters()
}

const clearAllFilters = () => {
  selectedStatus.value = 'all'
  selectedType.value = 'all'
  searchQuery.value = ''
  applyFilters()
}

const applyFilters = () => {
  let filtered = devices.value.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         device.location.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         device.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = selectedType.value === 'all' || device.type === selectedType.value
    const matchesStatus = selectedStatus.value === 'all' || device.status === selectedStatus.value
    
    return matchesSearch && matchesType && matchesStatus
  })

  filteredDevices.value = filtered
}

// Modal functions
const showDeviceDetails = (device: Device) => {
  selectedDevice.value = device
  showDetailsModal.value = true
}

const showDeviceEdit = (device: Device) => {
  selectedDevice.value = device
  editForm.value = {
    name: device.name,
    type: device.type,
    location: device.location,
    status: device.status,
    lastMaintenance: device.lastMaintenance,
    nextMaintenance: device.nextMaintenance,
    temperature: device.temperature,
    humidity: device.humidity,
    energyUsage: device.energyUsage,
    serialNumber: device.serialNumber,
    manufacturer: device.manufacturer,
    model: device.model,
    installationDate: device.installationDate,
    warrantyExpiry: device.warrantyExpiry,
    description: device.description,
    notes: device.notes,
    responsiblePerson: device.responsiblePerson,
    department: device.department
  }
  showEditModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedDevice.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedDevice.value = null
}

const showAddDeviceModal = () => {
  addForm.value = {
    name: '',
    type: '',
    location: '',
    status: 'working',
    lastMaintenance: '',
    nextMaintenance: '',
    temperature: '',
    humidity: '',
    energyUsage: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    installationDate: '',
    warrantyExpiry: '',
    description: '',
    notes: '',
    responsiblePerson: '',
    department: ''
  }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return

  if (showAddModal.value) {
    closeAddModal()
    return
  }

  if (showEditModal.value) {
    closeEditModal()
    return
  }

  if (showDetailsModal.value) {
    closeDetailsModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

const addDevice = () => {
  const newId = `DEV-${String(devices.value.length + 1).padStart(3, '0')}`
  const newDevice: Device = {
    id: newId,
    name: addForm.value.name,
    type: addForm.value.type,
    location: addForm.value.location,
    status: addForm.value.status,
    lastMaintenance: addForm.value.lastMaintenance,
    nextMaintenance: addForm.value.nextMaintenance,
    temperature: addForm.value.temperature || '--',
    humidity: addForm.value.humidity || '--',
    energyUsage: addForm.value.energyUsage || '--',
    icon: getDeviceIcon(addForm.value.type),
    statusColor: addForm.value.status === 'working' ? 'bg-green-500' : 
                addForm.value.status === 'maintenance' ? 'bg-amber-500' : 'bg-red-500',
    serialNumber: addForm.value.serialNumber,
    manufacturer: addForm.value.manufacturer,
    model: addForm.value.model,
    installationDate: addForm.value.installationDate,
    warrantyExpiry: addForm.value.warrantyExpiry,
    description: addForm.value.description,
    notes: addForm.value.notes,
    responsiblePerson: addForm.value.responsiblePerson,
    department: addForm.value.department
  }
  
  devices.value.unshift(newDevice)
  applyFilters()
  
  // Update stats
  stats.value = {
    total: devices.value.length,
    working: devices.value.filter(d => d.status === 'working').length,
    maintenance: devices.value.filter(d => d.status === 'maintenance').length,
    broken: devices.value.filter(d => d.status === 'broken').length
  }
  
  closeAddModal()
}

const saveDevice = () => {
  if (selectedDevice.value) {
    const deviceIndex = devices.value.findIndex(d => d.id === selectedDevice.value!.id)
    if (deviceIndex !== -1) {
      const updatedDevice: Device = {
        id: selectedDevice.value!.id,
        name: editForm.value.name,
        type: editForm.value.type,
        location: editForm.value.location,
        status: editForm.value.status,
        lastMaintenance: editForm.value.lastMaintenance,
        nextMaintenance: editForm.value.nextMaintenance,
        temperature: editForm.value.temperature,
        humidity: editForm.value.humidity,
        energyUsage: editForm.value.energyUsage,
        serialNumber: editForm.value.serialNumber,
        manufacturer: editForm.value.manufacturer,
        model: editForm.value.model,
        installationDate: editForm.value.installationDate,
        warrantyExpiry: editForm.value.warrantyExpiry,
        description: editForm.value.description,
        notes: editForm.value.notes,
        responsiblePerson: editForm.value.responsiblePerson,
        department: editForm.value.department,
        icon: selectedDevice.value!.icon,
        statusColor: editForm.value.status === 'working' ? 'bg-green-500' : 
                    editForm.value.status === 'maintenance' ? 'bg-amber-500' : 'bg-red-500'
      }
      devices.value[deviceIndex] = updatedDevice
      applyFilters()
    }
  }
  closeEditModal()
}

// QR Code functions
const generateQRCode = async (device: Device) => {
  try {
    const qrData = JSON.stringify({
      id: device.id,
      name: device.name,
      type: device.type,
      location: device.location
    })
    qrCodeDataUrl.value = await QRCode.toDataURL(qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    })
    selectedDevice.value = device
    showQRModal.value = true
  } catch (err) {
    console.error('QR Code generation failed:', err)
  }
}

const closeQRModal = () => {
  showQRModal.value = false
  qrCodeDataUrl.value = ''
}

// Scan functions (simulated for demo)
const openScanModal = () => {
  showScanModal.value = true
  // Simulate scanning after 2 seconds
  setTimeout(() => {
    const firstDevice = devices.value[0]
    if (firstDevice) {
      scannedDevice.value = firstDevice
      showScanModal.value = false
      showQuickReportModal.value = true
    }
  }, 2000)
}

const closeScanModal = () => {
  showScanModal.value = false
}

// Quick Report functions
const quickReportForm = ref({
  title: '',
  description: '',
  priority: 'medium',
  category: 'Awaria'
})

const closeQuickReportModal = () => {
  showQuickReportModal.value = false
  scannedDevice.value = null
  quickReportForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    category: 'Awaria'
  }
}

const submitQuickReport = () => {
  if (scannedDevice.value && quickReportForm.value.title) {
    // In a real app, this would send data to backend
    alert(`Zgłoszenie "${quickReportForm.value.title}" dla urządzenia ${scannedDevice.value.name} zostało utworzone!`)
    closeQuickReportModal()
  }
}

// Export functions
const exportToCSV = () => {
  const headers = ['ID', 'Nazwa', 'Typ', 'Lokalizacja', 'Status', 'Numer seryjny', 'Producent', 'Model', 'Osoba odpowiedzialna', 'Dział']
  const rows = filteredDevices.value.map(d => [
    d.id, d.name, d.type, d.location, d.status, d.serialNumber, d.manufacturer, d.model, d.responsiblePerson, d.department
  ])
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `urzadzenia_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

const exportToPDF = () => {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(18)
  doc.text('Raport urządzeń', 14, 22)
  
  // Date
  doc.setFontSize(11)
  doc.text(`Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}`, 14, 32)
  
  // Stats summary
  doc.setFontSize(12)
  doc.text(`Wszystkie: ${stats.value.total} | Działające: ${stats.value.working} | ` +
           `Konserwacja: ${stats.value.maintenance} | Awaria: ${stats.value.broken}`, 14, 42)
  
  // Table headers
  const headers = [['ID', 'Nazwa', 'Typ', 'Lokalizacja', 'Status', 'Osoba odpowiedzialna']]
  const data = filteredDevices.value.map(d => [
    d.id,
    d.name,
    d.type,
    d.location,
    getStatusText(d.status),
    d.responsiblePerson
  ])
  
  // AutoTable for table
  autoTable(doc, {
    head: headers,
    body: data,
    startY: 50,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 40 },
      2: { cellWidth: 35 },
      3: { cellWidth: 40 },
      4: { cellWidth: 25 },
      5: { cellWidth: 35 }
    }
  })
  
  // Save PDF
  doc.save(`urzadzenia_${new Date().toISOString().split('T')[0]}.pdf`)
}

// Geolocation functions
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const findNearestDevice = () => {
  geoLoading.value = true
  geoError.value = ''
  
  if (!navigator.geolocation) {
    geoError.value = 'Geolokalizacja nie jest wspierana przez Twoją przeglądarkę'
    geoLoading.value = false
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude
      const userLng = position.coords.longitude
      userLocation.value = { lat: userLat, lng: userLng }
      
      // Find nearest device with coordinates
      let nearest: Device | null = null
      let minDistance = Infinity
      
      devices.value.forEach(device => {
        if (device.latitude && device.longitude) {
          const distance = calculateDistance(userLat, userLng, device.latitude, device.longitude)
          if (distance < minDistance) {
            minDistance = distance
            nearest = device
          }
        }
      })
      
      if (nearest) {
        nearestDevice.value = nearest
        deviceDistance.value = minDistance
        showGeoModal.value = true
      } else {
        geoError.value = 'Brak urządzeń z zdefiniowaną lokalizacją'
      }
      
      geoLoading.value = false
    },
    (error) => {
      geoLoading.value = false
      switch (error.code) {
        case error.PERMISSION_DENIED:
          geoError.value = 'Odmowa dostępu do lokalizacji. Sprawdź uprawnienia przeglądarki.'
          break
        case error.POSITION_UNAVAILABLE:
          geoError.value = 'Informacja o lokalizacji niedostępna'
          break
        case error.TIMEOUT:
          geoError.value = 'Przekroczono czas oczekiwania na lokalizację'
          break
        default:
          geoError.value = 'Wystąpił błąd podczas pobierania lokalizacji'
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

const closeGeoModal = () => {
  showGeoModal.value = false
  nearestDevice.value = null
  userLocation.value = null
  deviceDistance.value = 0
}

const goToNearestDevice = () => {
  if (nearestDevice.value) {
    closeGeoModal()
    showDeviceDetails(nearestDevice.value)
  }
}

// Blockchain functions
const showBlockchainHistory = (device: Device) => {
  selectedDevice.value = device
  blockchainVerificationResult.value = null
  showBlockchainModal.value = true
}

const closeBlockchainModal = () => {
  showBlockchainModal.value = false
  blockchainVerificationResult.value = null
}

const openAddServiceRecordModal = () => {
  if (!selectedDevice.value) return
  serviceRecordForm.value = {
    action: 'maintenance',
    description: '',
    technician: '',
    cost: 0,
    parts: ''
  }
  showAddServiceRecordModal.value = true
}

const closeAddServiceRecordModal = () => {
  showAddServiceRecordModal.value = false
}

const addServiceRecord = () => {
  if (!selectedDevice.value) return
  
  // Initialize blockchain if not exists
  if (!selectedDevice.value.blockchain) {
    selectedDevice.value.blockchain = new Blockchain()
  }
  
  const parts = serviceRecordForm.value.parts 
    ? serviceRecordForm.value.parts.split(',').map(p => p.trim())
    : undefined
  
  const record = createServiceRecord(
    serviceRecordForm.value.action,
    serviceRecordForm.value.description,
    serviceRecordForm.value.technician,
    selectedDevice.value.id,
    serviceRecordForm.value.cost || undefined,
    parts
  )
  
  selectedDevice.value.blockchain.addBlock(record)
  closeAddServiceRecordModal()
}

const verifyBlockchain = () => {
  if (!selectedDevice.value?.blockchain) return
  blockchainVerificationResult.value = selectedDevice.value.blockchain.verifyIntegrity()
}

const getActionText = (action: string): string => {
  const texts: Record<string, string> = {
    maintenance: 'Konserwacja',
    repair: 'Naprawa',
    inspection: 'Przegląd',
    installation: 'Instalacja',
    warranty_claim: 'Reklamacja'
  }
  return texts[action] || action
}

const getActionColor = (action: string): string => {
  const colors: Record<string, string> = {
    maintenance: 'bg-blue-500',
    repair: 'bg-red-500',
    inspection: 'bg-green-500',
    installation: 'bg-purple-500',
    warranty_claim: 'bg-amber-500'
  }
  return colors[action] || 'bg-gray-500'
}

const stats = ref({
  total: devices.value.length,
  working: devices.value.filter(d => d.status === 'working').length,
  maintenance: devices.value.filter(d => d.status === 'maintenance').length,
  broken: devices.value.filter(d => d.status === 'broken').length
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Header with stats -->
    <section>
      <h1 class="mb-6 font-bold text-slate-800 text-3xl">Panel urządzeń</h1>
      
      <!-- Stats Cards -->
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div 
          @click="clearAllFilters"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'all' && selectedType === 'all' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-blue-500 rounded-lg w-10 h-10 text-white">
              🔧
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.total }}</div>
              <div class="text-gray-500 text-sm">Wszystkie urządzenia</div>
            </div>
          </div>
        </div>
        
        <div 
          @click="filterByStatus('working')"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'working' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-green-500 rounded-lg w-10 h-10 text-white">
              ✅
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.working }}</div>
              <div class="text-gray-500 text-sm">Działające</div>
            </div>
          </div>
        </div>
        
        <div 
          @click="filterByStatus('maintenance')"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'maintenance' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-amber-500 rounded-lg w-10 h-10 text-white">
              🔧
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.maintenance }}</div>
              <div class="text-gray-500 text-sm">Konserwacja</div>
            </div>
          </div>
        </div>
        
        <div 
          @click="filterByStatus('broken')"
          class="bg-white shadow-sm hover:shadow-md p-4 border border-gray-200 rounded-lg transition-all cursor-pointer"
          :class="{ 'ring-2 ring-blue-500': selectedStatus === 'broken' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex justify-center items-center bg-red-500 rounded-lg w-10 h-10 text-white">
              ⚠️
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-2xl">{{ stats.broken }}</div>
              <div class="text-gray-500 text-sm">Uszkodzone</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section class="bg-white shadow-sm p-6 rounded-xl">
      <div class="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4">
        <div class="flex lg:flex-row flex-col lg:items-center gap-4">
          <div class="relative">
            <input 
              v-model="searchQuery"
              @input="applyFilters"
              type="text" 
              placeholder="Szukaj urządzenia..."
              class="py-2 pr-4 pl-10 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <span class="top-2.5 left-3 absolute text-gray-400">🔍</span>
          </div>
          
          <select 
            v-model="selectedType"
            @change="applyFilters"
            class="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie typy</option>
            <option v-for="type in deviceTypes.slice(1)" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
          
          <select 
            v-model="selectedStatus"
            @change="applyFilters"
            class="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="working">Działające</option>
            <option value="maintenance">Konserwacja</option>
            <option value="broken">Uszkodzone</option>
          </select>
        </div>
        
        <div class="flex gap-2">
          <button 
            @click="findNearestDevice"
            :disabled="geoLoading"
            class="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 px-4 py-2 rounded-lg text-white transition-colors"
          >
            <span v-if="geoLoading">⏳</span>
            <span v-else>📍</span>
            {{ geoLoading ? 'Szukam...' : 'Najbliższe urządzenie' }}
          </button>
          <button 
            @click="openScanModal"
            class="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            📱 Skanuj QR
          </button>
          <button 
            @click="exportToCSV"
            class="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            📊 Eksport CSV
          </button>
          <button 
            @click="exportToPDF"
            class="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            📄 Eksport PDF
          </button>
          <button 
            @click="showAddDeviceModal"
            class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            + Dodaj urządzenie
          </button>
        </div>
      </div>
    </section>

    <!-- Devices Grid -->
    <section>
      <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="device in filteredDevices" 
          :key="device.id"
          class="bg-white shadow-sm hover:shadow-lg p-6 border border-gray-200 rounded-xl transition-all hover:-translate-y-1 duration-300"
        >
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div class="text-2xl">{{ device.icon }}</div>
              <div>
                <h3 class="font-semibold text-slate-800 text-lg">{{ device.name }}</h3>
                <p class="text-gray-500 text-sm">{{ device.id }}</p>
              </div>
            </div>
            <span 
              :class="device.statusColor"
              class="px-2 py-1 rounded-full font-medium text-white text-xs"
            >
              {{ getStatusText(device.status) }}
            </span>
          </div>
          
          <!-- Device Info -->
          <div class="space-y-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-gray-400 text-sm">📍</span>
              <span class="text-sm">{{ device.location }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400 text-sm">🏷️</span>
              <span class="text-sm">{{ device.type }}</span>
            </div>
          </div>
          
          <!-- Metrics -->
          <div class="gap-3 grid grid-cols-2 bg-gray-50 mb-4 p-3 rounded-lg">
            <div v-if="device.temperature !== '--'">
              <div class="text-gray-500 text-xs">Temperatura</div>
              <div class="font-semibold text-slate-800">{{ device.temperature }}</div>
            </div>
            <div v-if="device.humidity !== '--'">
              <div class="text-gray-500 text-xs">Wilgotność</div>
              <div class="font-semibold text-slate-800">{{ device.humidity }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-xs">Zużycie energii</div>
              <div class="font-semibold text-slate-800">{{ device.energyUsage }}</div>
            </div>
          </div>
          
          <!-- Maintenance Info -->
          <div class="flex justify-between items-center bg-blue-50 mb-4 p-3 rounded-lg">
            <div>
              <div class="font-medium text-blue-600 text-xs">Następna konserwacja</div>
              <div class="font-semibold text-blue-800 text-sm">{{ device.nextMaintenance }}</div>
            </div>
            <div class="text-blue-500 text-lg">🔧</div>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-2">
            <button 
              @click="showDeviceDetails(device)"
              class="flex-1 bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg text-white text-sm transition-colors"
            >
              Szczegóły
            </button>
            <button 
              @click="showDeviceEdit(device)"
              class="flex-1 hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors"
            >
              Edytuj
            </button>
            <button 
              @click="generateQRCode(device)"
              class="hover:bg-purple-50 px-3 py-2 border border-purple-300 rounded-lg text-sm transition-colors"
              title="Pokaż kod QR"
            >
              📱
            </button>
            <button 
              @click="showBlockchainHistory(device)"
              class="hover:bg-indigo-50 px-3 py-2 border border-indigo-300 rounded-lg text-sm transition-colors"
              title="Historia serwisowa (Blockchain)"
            >
              ⛓️
            </button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredDevices.length === 0" class="py-12 text-center">
        <div class="mb-4 text-6xl">🔍</div>
        <h3 class="mb-2 font-semibold text-slate-800 text-lg">Nie znaleziono urządzeń</h3>
        <p class="text-gray-500">Spróbuj zmienić kryteria wyszukiwania</p>
      </div>
    </section>

    <!-- Device Details Modal -->
    <div v-if="showDetailsModal && selectedDevice" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-gray-200 border-b">
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-slate-800 text-xl">Szczegóły urządzenia</h2>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <span class="text-2xl">✕</span>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="text-5xl">{{ selectedDevice.icon }}</div>
            <div>
              <h3 class="font-semibold text-slate-800 text-lg">{{ selectedDevice.name }}</h3>
              <p class="text-gray-500">{{ selectedDevice.id }}</p>
              <div class="flex gap-2 mt-2">
                <span :class="selectedDevice.statusColor" class="px-2 py-1 rounded-full font-medium text-white text-xs">
                  {{ getStatusText(selectedDevice.status) }}
                </span>
                <span class="bg-blue-100 px-2 py-1 rounded-full font-medium text-blue-500 text-xs">
                  {{ selectedDevice.type }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div class="space-y-3">
              <div>
                <div class="text-gray-500 text-xs">Lokalizacja</div>
                <div class="font-medium">{{ selectedDevice.location }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Numer seryjny</div>
                <div class="font-medium">{{ selectedDevice.serialNumber }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Producent</div>
                <div class="font-medium">{{ selectedDevice.manufacturer }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Model</div>
                <div class="font-medium">{{ selectedDevice.model }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Dział</div>
                <div class="font-medium">{{ selectedDevice.department }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Odpowiedzialna osoba</div>
                <div class="font-medium">{{ selectedDevice.responsiblePerson }}</div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <div class="text-gray-500 text-xs">Data instalacji</div>
                <div class="font-medium">{{ selectedDevice.installationDate }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Koniec gwarancji</div>
                <div class="font-medium">{{ selectedDevice.warrantyExpiry }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Ostatnia konserwacja</div>
                <div class="font-medium">{{ selectedDevice.lastMaintenance }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs">Następna konserwacja</div>
                <div class="font-medium">{{ selectedDevice.nextMaintenance }}</div>
              </div>
              <div v-if="selectedDevice.temperature !== '--'">
                <div class="text-gray-500 text-xs">Temperatura</div>
                <div class="font-medium">{{ selectedDevice.temperature }}</div>
              </div>
              <div v-if="selectedDevice.humidity !== '--'">
                <div class="text-gray-500 text-xs">Wilgotność</div>
                <div class="font-medium">{{ selectedDevice.humidity }}</div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 mt-6 p-4 rounded-lg">
            <div class="mb-1 text-gray-500 text-xs">Opis</div>
            <div class="font-medium">{{ selectedDevice.description }}</div>
          </div>
          
          <div class="bg-blue-50 mt-4 p-4 rounded-lg">
            <div class="mb-1 text-gray-500 text-xs">Notatki</div>
            <div class="font-medium">{{ selectedDevice.notes }}</div>
          </div>
          
          <div class="bg-amber-50 mt-4 p-4 rounded-lg">
            <div class="mb-1 text-gray-500 text-xs">Zużycie energii</div>
            <div class="font-medium">{{ selectedDevice.energyUsage }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Device Modal -->
    <div v-if="showEditModal && selectedDevice" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-gray-200 border-b">
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-slate-800 text-xl">Edytuj urządzenie</h2>
            <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
              <span class="text-2xl">✕</span>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="saveDevice" class="space-y-4">
            <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Nazwa urządzenia</label>
                <input 
                  v-model="editForm.name" 
                  type="text" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Typ</label>
                <select 
                  v-model="editForm.type" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="Klimatyzacja">Klimatyzacja</option>
                  <option value="Ogrzewanie">Ogrzewanie</option>
                  <option value="Wentylacja">Wentylacja</option>
                </select>
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Lokalizacja</label>
                <input 
                  v-model="editForm.location" 
                  type="text" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Status</label>
                <select 
                  v-model="editForm.status" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="working">Działające</option>
                  <option value="maintenance">Konserwacja</option>
                  <option value="broken">Uszkodzone</option>
                </select>
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Numer seryjny</label>
                <input 
                  v-model="editForm.serialNumber" 
                  type="text" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Producent</label>
                <input 
                  v-model="editForm.manufacturer" 
                  type="text" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Model</label>
                <input 
                  v-model="editForm.model" 
                  type="text" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Dział</label>
                <input 
                  v-model="editForm.department" 
                  type="text" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Odpowiedzialna osoba</label>
                <input 
                  v-model="editForm.responsiblePerson" 
                  type="text" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Data instalacji</label>
                <input 
                  v-model="editForm.installationDate" 
                  type="date" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Koniec gwarancji</label>
                <input 
                  v-model="editForm.warrantyExpiry" 
                  type="date" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Ostatnia konserwacja</label>
                <input 
                  v-model="editForm.lastMaintenance" 
                  type="date" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Następna konserwacja</label>
                <input 
                  v-model="editForm.nextMaintenance" 
                  type="date" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Temperatura</label>
                <input 
                  v-model="editForm.temperature" 
                  type="text" 
                  placeholder="np. 22°C"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Wilgotność</label>
                <input 
                  v-model="editForm.humidity" 
                  type="text" 
                  placeholder="np. 45%"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Zużycie energii</label>
                <input 
                  v-model="editForm.energyUsage" 
                  type="text" 
                  placeholder="np. 2.5 kW"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
            </div>
            
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Opis</label>
              <textarea 
                v-model="editForm.description" 
                rows="2" 
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              ></textarea>
            </div>
            
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Notatki</label>
              <textarea 
                v-model="editForm.notes" 
                rows="2" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              ></textarea>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button 
                type="submit" 
                class="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Zapisz zmiany
              </button>
              <button 
                type="button" 
                @click="closeEditModal"
                class="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Device Modal -->
    <div v-if="showAddModal" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-gray-200 border-b">
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-slate-800 text-xl">Dodaj nowe urządzenie</h2>
            <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600">
              <span class="text-2xl">✕</span>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="addDevice" class="space-y-4">
            <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Nazwa urządzenia *</label>
                <input 
                  v-model="addForm.name" 
                  type="text" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  placeholder="np. Klimatyzacja A-101"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Typ *</label>
                <select 
                  v-model="addForm.type" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="">Wybierz typ</option>
                  <option value="Klimatyzacja">Klimatyzacja</option>
                  <option value="Ogrzewanie">Ogrzewanie</option>
                  <option value="Wentylacja">Wentylacja</option>
                </select>
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Lokalizacja *</label>
                <input 
                  v-model="addForm.location" 
                  type="text" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  placeholder="np. Budynek A, piętro 1"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Status</label>
                <select 
                  v-model="addForm.status" 
                  required
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="working">Działające</option>
                  <option value="maintenance">Konserwacja</option>
                  <option value="broken">Uszkodzone</option>
                </select>
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Numer seryjny</label>
                <input 
                  v-model="addForm.serialNumber" 
                  type="text" 
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  placeholder="np. AC-2024-001"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Producent</label>
                <input 
                  v-model="addForm.manufacturer" 
                  type="text" 
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  placeholder="np. Samsung"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Model</label>
                <input 
                  v-model="addForm.model" 
                  type="text" 
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  placeholder="np. AR12TXEAAWKNEU"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Dział</label>
                <input 
                  v-model="addForm.department" 
                  type="text" 
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  placeholder="np. IT"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Odpowiedzialna osoba</label>
                <input 
                  v-model="addForm.responsiblePerson" 
                  type="text" 
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  placeholder="np. Jan Kowalski"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Data instalacji</label>
                <input 
                  v-model="addForm.installationDate" 
                  type="date" 
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Koniec gwarancji</label>
                <input 
                  v-model="addForm.warrantyExpiry" 
                  type="date" 
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Ostatnia konserwacja</label>
                <input 
                  v-model="addForm.lastMaintenance" 
                  type="date" 
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Następna konserwacja</label>
                <input 
                  v-model="addForm.nextMaintenance" 
                  type="date" 
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Temperatura</label>
                <input 
                  v-model="addForm.temperature" 
                  type="text" 
                  placeholder="np. 22°C"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Wilgotność</label>
                <input 
                  v-model="addForm.humidity" 
                  type="text" 
                  placeholder="np. 45%"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
              <div>
                <label class="block mb-1 font-medium text-gray-700 text-sm">Zużycie energii</label>
                <input 
                  v-model="addForm.energyUsage" 
                  type="text" 
                  placeholder="np. 2.5 kW"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
              </div>
            </div>
            
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Opis</label>
              <textarea 
                v-model="addForm.description" 
                rows="2" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="Szczegółowy opis urządzenia..."
              ></textarea>
            </div>
            
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Notatki</label>
              <textarea 
                v-model="addForm.notes" 
                rows="2" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="Dodatkowe notatki..."
              ></textarea>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button 
                type="submit" 
                class="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
              >
                ➕ Dodaj urządzenie
              </button>
              <button 
                type="button" 
                @click="closeAddModal"
                class="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="showQRModal && selectedDevice" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-md overflow-hidden">
        <div class="p-6 border-gray-200 border-b">
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-slate-800 text-xl">Kod QR urządzenia</h2>
            <button @click="closeQRModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
        </div>
        
        <div class="p-6 text-center">
          <div class="mb-4">
            <h3 class="font-semibold text-slate-800 text-lg">{{ selectedDevice.name }}</h3>
            <p class="text-gray-500 text-sm">{{ selectedDevice.id }} - {{ selectedDevice.location }}</p>
          </div>
          
          <div class="inline-block bg-white shadow-inner p-4 rounded-lg">
            <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="QR Code" class="w-64 h-64">
          </div>
          
          <p class="mt-4 text-gray-600 text-sm">Zeskanuj kod, aby szybko zgłosić awarię</p>
          
          <div class="flex gap-3 mt-6">
            <button 
              @click="closeQRModal"
              class="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
            >
              Drukuj
            </button>
            <button 
              @click="closeQRModal"
              class="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scan QR Modal -->
    <div v-if="showScanModal" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-md overflow-hidden">
        <div class="p-6 border-gray-200 border-b">
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-slate-800 text-xl">Skanowanie QR</h2>
            <button @click="closeScanModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
        </div>
        
        <div class="p-6 text-center">
          <div class="mb-6">
            <div class="relative flex justify-center items-center mx-auto border-4 border-purple-500 rounded-lg w-48 h-48 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent w-full h-full animate-pulse"></div>
              <div class="text-6xl">📱</div>
            </div>
          </div>
          <p class="text-gray-600">Skieruj kamerę na kod QR urządzenia...</p>
          <p class="mt-2 text-gray-400 text-sm">(Symulacja - automatycznie wykryje za 2s)</p>
        </div>
      </div>
    </div>

    <!-- Quick Report Modal -->
    <div v-if="showQuickReportModal && scannedDevice" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-gray-200 border-b">
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-slate-800 text-xl">Szybkie zgłoszenie awarii</h2>
            <button @click="closeQuickReportModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
          <p class="mt-1 text-gray-500 text-sm">Urządzenie: <strong>{{ scannedDevice.name }}</strong></p>
        </div>
        
        <div class="space-y-4 p-6">
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Tytuł zgłoszenia *</label>
            <input 
              v-model="quickReportForm.title" 
              type="text" 
              required
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              placeholder="np. Klimatyzacja nie chłodzi"
            >
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Opis problemu</label>
            <textarea 
              v-model="quickReportForm.description" 
              rows="3"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              placeholder="Opisz szczegółowo problem..."
            ></textarea>
          </div>
          
          <div class="gap-4 grid grid-cols-2">
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Priorytet</label>
              <select 
                v-model="quickReportForm.priority"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="high">Wysoki</option>
                <option value="medium">Średni</option>
                <option value="low">Niski</option>
              </select>
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Kategoria</label>
              <select 
                v-model="quickReportForm.category"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="Awaria">Awaria</option>
                <option value="Konserwacja">Konserwacja</option>
                <option value="Przegląd">Przegląd</option>
                <option value="Wydajność">Wydajność</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 p-6 border-gray-200 border-t">
          <button 
            @click="closeQuickReportModal"
            class="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
          >
            Anuluj
          </button>
          <button 
            @click="submitQuickReport"
            class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Wyślij zgłoszenie
          </button>
        </div>
      </div>
    </div>

    <!-- Geolocation Modal -->
    <div v-if="showGeoModal && nearestDevice" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-md overflow-hidden">
        <div class="p-6 border-gray-200 border-b">
          <div class="flex justify-between items-center">
            <h2 class="font-semibold text-slate-800 text-xl">📍 Najbliższe urządzenie</h2>
            <button @click="closeGeoModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
        </div>
        
        <div class="p-6 text-center">
          <!-- Distance badge -->
          <div class="mb-4">
            <div class="inline-flex items-center gap-2 bg-cyan-100 px-4 py-2 rounded-full">
              <span class="text-cyan-600 text-2xl">📍</span>
              <span class="font-semibold text-cyan-800 text-lg">
                {{ deviceDistance < 1 ? (deviceDistance * 1000).toFixed(0) + ' m' : deviceDistance.toFixed(2) + ' km' }}
              </span>
            </div>
          </div>
          
          <!-- Device info -->
          <div class="mb-6">
            <div class="mb-3 text-5xl">{{ nearestDevice.icon }}</div>
            <h3 class="font-semibold text-slate-800 text-xl">{{ nearestDevice.name }}</h3>
            <p class="text-gray-500 text-sm">{{ nearestDevice.id }} - {{ nearestDevice.location }}</p>
          </div>
          
          <!-- Device details -->
          <div class="space-y-3 mb-6 text-left">
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span class="text-gray-600 text-sm">Status</span>
              <span 
                :class="nearestDevice.statusColor" 
                class="px-2 py-1 rounded-full font-medium text-white text-xs"
              >
                {{ getStatusText(nearestDevice.status) }}
              </span>
            </div>
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span class="text-gray-600 text-sm">Typ</span>
              <span class="font-medium text-slate-800">{{ nearestDevice.type }}</span>
            </div>
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span class="text-gray-600 text-sm">Osoba odpowiedzialna</span>
              <span class="font-medium text-slate-800">{{ nearestDevice.responsiblePerson }}</span>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-3">
            <button 
              @click="goToNearestDevice"
              class="flex-1 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg text-white transition-colors"
            >
              Szczegóły urządzenia
            </button>
            <button 
              @click="closeGeoModal"
              class="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Toast for Geolocation -->
    <div 
      v-if="geoError" 
      class="top-4 right-4 z-50 fixed bg-red-100 shadow-lg px-6 py-4 border border-red-300 rounded-lg max-w-sm"
    >
      <div class="flex items-start gap-3">
        <span class="text-red-500 text-xl">⚠️</span>
        <div>
          <h4 class="font-semibold text-red-800">Błąd geolokalizacji</h4>
          <p class="text-red-600 text-sm">{{ geoError }}</p>
        </div>
        <button @click="geoError = ''" class="ml-2 text-red-400 hover:text-red-600">✕</button>
      </div>
    </div>

    <!-- Blockchain History Modal -->
    <div v-if="showBlockchainModal && selectedDevice" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div class="flex justify-between items-center p-6 border-gray-200 border-b">
          <div>
            <h2 class="font-semibold text-slate-800 text-xl">⛓️ Historia serwisowa (Blockchain)</h2>
            <p class="mt-1 text-gray-500 text-sm">{{ selectedDevice.name }} - {{ selectedDevice.id }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="verifyBlockchain"
              class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white text-sm transition-colors"
            >
              🔍 Weryfikuj integralność
            </button>
            <button 
              @click="openAddServiceRecordModal"
              class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white text-sm transition-colors"
            >
              + Dodaj wpis
            </button>
            <button @click="closeBlockchainModal" class="ml-2 text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
        </div>

        <!-- Verification Result -->
        <div v-if="blockchainVerificationResult" class="p-4 border-gray-200 border-b"
          :class="blockchainVerificationResult.valid ? 'bg-green-50' : 'bg-red-50'"
        >
          <div class="flex items-center gap-2">
            <span v-if="blockchainVerificationResult.valid" class="text-green-600 text-xl">✅</span>
            <span v-else class="text-red-600 text-xl">⚠️</span>
            <span :class="blockchainVerificationResult.valid ? 'text-green-800' : 'text-red-800'" class="font-medium">
              {{ blockchainVerificationResult.valid ? 'Blockchain zweryfikowany - wszystkie bloki integralne' : 
                 `Wykryto manipulację w blokach: ${blockchainVerificationResult.tamperedBlocks.join(', ')}` }}
            </span>
          </div>
        </div>
        
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div v-if="!selectedDevice.blockchain || selectedDevice.blockchain.getServiceHistory().length === 0" class="py-8 text-center">
            <div class="mb-3 text-5xl">📋</div>
            <h3 class="mb-2 font-semibold text-slate-800 text-lg">Brak historii serwisowej</h3>
            <p class="mb-4 text-gray-500">To urządzenie nie ma jeszcze wpisów w blockchain</p>
            <button 
              @click="openAddServiceRecordModal"
              class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
            >
              Dodaj pierwszy wpis
            </button>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="block in selectedDevice.blockchain.getServiceHistory()" 
              :key="block.index"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <span :class="getActionColor(block.data.action)" class="px-3 py-1 rounded-full font-medium text-white text-xs">
                    {{ getActionText(block.data.action) }}
                  </span>
                  <span class="text-gray-500 text-sm">Blok #{{ block.index }}</span>
                </div>
                <span class="text-gray-400 text-xs">{{ new Date(block.timestamp).toLocaleString('pl-PL') }}</span>
              </div>
              
              <p class="mb-2 text-gray-700">{{ block.data.description }}</p>
              
              <div class="flex justify-between items-center text-sm">
                <div class="text-gray-500">
                  <span class="font-medium">Technik:</span> {{ block.data.technician }}
                  <span v-if="block.data.cost" class="ml-3">| <span class="font-medium">Koszt:</span> {{ block.data.cost }} zł</span>
                </div>
              </div>
              
              <div v-if="block.data.parts && block.data.parts.length > 0" class="mt-2">
                <span class="text-gray-500 text-xs">Części: {{ block.data.parts.join(', ') }}</span>
              </div>
              
              <div class="mt-3 pt-3 border-gray-100 border-t">
                <div class="flex gap-4 font-mono text-gray-400 text-xs">
                  <div class="flex-1 truncate" :title="block.hash">
                    <span class="font-medium">Hash:</span> {{ block.hash.substring(0, 20) }}...
                  </div>
                  <div class="flex-1 truncate" :title="block.previousHash">
                    <span class="font-medium">Poprzedni:</span> {{ block.previousHash.substring(0, 20) }}...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 p-6 border-gray-200 border-t">
          <button 
            @click="closeBlockchainModal"
            class="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>

    <!-- Add Service Record Modal -->
    <div v-if="showAddServiceRecordModal && selectedDevice" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div class="bg-white shadow-xl mx-4 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-gray-200 border-b">
          <h2 class="font-semibold text-slate-800 text-xl">➕ Dodaj wpis serwisowy</h2>
          <button @click="closeAddServiceRecordModal" class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <div class="space-y-4 p-6">
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Typ akcji *</label>
            <select 
              v-model="serviceRecordForm.action"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
              <option value="maintenance">Konserwacja</option>
              <option value="repair">Naprawa</option>
              <option value="inspection">Przegląd</option>
              <option value="installation">Instalacja</option>
              <option value="warranty_claim">Reklamacja</option>
            </select>
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Opis *</label>
            <textarea 
              v-model="serviceRecordForm.description" 
              rows="3"
              required
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              placeholder="Opisz wykonaną czynność..."
            ></textarea>
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-gray-700 text-sm">Technik *</label>
            <input 
              v-model="serviceRecordForm.technician" 
              type="text" 
              required
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              placeholder="Imię i nazwisko technika"
            >
          </div>
          
          <div class="gap-4 grid grid-cols-2">
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Koszt (zł)</label>
              <input 
                v-model="serviceRecordForm.cost" 
                type="number" 
                min="0"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="0"
              >
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700 text-sm">Części (oddzielone przecinkami)</label>
              <input 
                v-model="serviceRecordForm.parts" 
                type="text" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="np. filtr, łożysko"
              >
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 p-6 border-gray-200 border-t">
          <button 
            @click="closeAddServiceRecordModal"
            class="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
          >
            Anuluj
          </button>
          <button 
            @click="addServiceRecord"
            :disabled="!serviceRecordForm.description || !serviceRecordForm.technician"
            class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Dodaj do blockchain
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
