<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import api from '../utils/api'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('user')
const loading = ref(false)
const error = ref<string | null>(null)

async function handleRegister() {
  loading.value = true
  error.value = null
  
  try {
    console.log('Attempting registration with:', { name: name.value, email: email.value, role: role.value })
    
    // Map role to API flags
    const roleFlags = {
      is_admin: role.value === 'admin',
      is_installer: role.value === 'installer',
      is_service: role.value === 'technician'
    }
    
    const response = await api.post('/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      ...roleFlags
    })

    console.log('Registration response:', response.data)

    // Auto login after registration
    const loginSuccess = await authStore.login(email.value, password.value)
    if (loginSuccess) {
      router.push('/')
    }
  } catch (err: any) {
    console.error('Registration error:', err)
    console.error('Error response:', err.response?.data)
    error.value = err.response?.data?.message || err.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center bg-gray-100 px-4 min-h-screen">
    <BaseCard class="p-8 w-full max-w-md">
      <h1 class="mb-6 font-bold text-2xl text-center">Zarejestruj się</h1>
      
      <form @submit.prevent="handleRegister" class="space-y-4">
        <BaseInput
          v-model="name"
          label="Imię"
          type="text"
          placeholder="Twoje imię"
          required
        />
        
        <BaseInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="twoj@email.com"
          required
        />
        
        <BaseInput
          v-model="password"
          label="Hasło"
          type="password"
          placeholder="••••••••"
          required
        />
        
        <div>
          <label class="block mb-1 font-medium text-gray-700 text-sm">Rola</label>
          <select
            v-model="role"
            required
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value="user">Użytkownik</option>
            <option value="technician">Technik Serwisowy</option>
            <option value="installer">Instalator</option>
          </select>
        </div>
        
        <p v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </p>
        
        <BaseButton
          type="submit"
          class="w-full"
          :loading="loading"
        >
          Zarejestruj się
        </BaseButton>
      </form>
      
      <p class="mt-4 text-gray-600 text-center">
        Masz już konto? 
        <router-link to="/login" class="text-blue-500 hover:underline">Zaloguj się</router-link>
      </p>
    </BaseCard>
  </div>
</template>
