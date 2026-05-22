<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  const code = route.query.code as string

  if (!code) {
    console.error('No code in callback')
    router.push('/login?error=no_code')
    return
  }

  try {
    // Send the code to backend to exchange for token
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ code })
    })

    const data = await response.json()

    if (data.access_token || data.token) {
      const authToken = data.access_token || data.token
      authStore.token = authToken
      authStore.user = data.user || { email: '', token: authToken }
      localStorage.setItem('auth_token', authToken)
      router.push('/')
    } else if (data.requires_2fa) {
      authStore.requires2FA = true
      authStore.intermediateToken = data.intermediate_token
      router.push('/login?2fa_required=true')
    } else {
      console.error('No token in response', data)
      router.push('/login?error=no_token')
    }
  } catch (error) {
    console.error('Google callback error:', error)
    router.push('/login?error=callback_failed')
  }
})
</script>

<template>
  <div class="flex justify-center items-center bg-gray-100 px-4 min-h-screen">
    <div class="text-center">
      <div class="animate-spin text-4xl mb-4">⏳</div>
      <p class="text-gray-600">Logowanie przez Google...</p>
    </div>
  </div>
</template>
