<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const twoFACode = ref('')
const show2FA = ref(false)

// Load Google Identity Services
onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  document.head.appendChild(script)
})

async function handleLogin() {
  const result = await authStore.login(email.value, password.value)

  if (result === '2fa_required') {
    show2FA.value = true
  } else if (result === true) {
    // Wait a moment to ensure auth state is set
    setTimeout(() => {
      router.push('/')
    }, 100)
  } else {
    // Login failed - error is in authStore.error
    console.error('Login failed:', authStore.error)
  }
}

async function handle2FAVerify() {
  const success = await authStore.verify2FA(twoFACode.value)
  if (success) {
    router.push('/')
  }
}

function backToLogin() {
  show2FA.value = false
  twoFACode.value = ''
  authStore.requires2FA = false
}

async function handleGoogleLogin(response: any) {
  const credential = response.credential
  const result = await authStore.loginWithGoogle(credential)

  if (result === '2fa_required') {
    show2FA.value = true
  } else if (result === true) {
    setTimeout(() => {
      router.push('/')
    }, 100)
  } else {
    console.error('Google login failed:', authStore.error)
  }
}
</script>

<template>
  <div class="flex justify-center items-center bg-gray-100 px-4 min-h-screen">
    <BaseCard class="p-8 w-full max-w-md">
      <h1 class="mb-6 font-bold text-2xl text-center">
        {{ show2FA ? 'Weryfikacja 2FA' : 'Zaloguj się' }}
      </h1>
      
      <!-- Login Form -->
      <form v-if="!show2FA" @submit.prevent="handleLogin" class="space-y-4">
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
        
        <div v-if="authStore.error" class="bg-red-50 mb-4 p-3 border border-red-200 rounded-lg">
          <p class="font-medium text-red-700 text-sm text-center">
            {{ authStore.error }}
          </p>
        </div>
        
        <BaseButton
          type="submit"
          class="w-full"
          :loading="authStore.loading"
        >
          Zaloguj się
        </BaseButton>

        <div class="mt-4 text-center">
          <router-link to="/forgot-password" class="font-medium text-blue-500 hover:text-blue-700 hover:underline">
            Zapomniałeś hasła?
          </router-link>
        </div>

        <!-- Google Sign-In Button -->
        <div class="mt-4">
          <div id="g_id_onload"
               :data-client_id="import.meta.env.VITE_GOOGLE_CLIENT_ID"
               data-context="signin"
               data-ux_mode="popup"
               data-callback="handleGoogleLogin"
               data-auto_prompt="false">
          </div>
          <div class="g_id_signin"
               data-type="standard"
               data-shape="rectangular"
               data-theme="outline"
               data-text="signin_with"
               data-size="large"
               data-logo_alignment="left">
          </div>
        </div>
      </form>
      
      <!-- 2FA Form -->
      <form v-else @submit.prevent="handle2FAVerify" class="space-y-4">
        <p class="text-gray-600 text-sm text-center">
          Wprowadź kod 2FA z aplikacji uwierzytelniającej
        </p>
        
        <BaseInput
          v-model="twoFACode"
          label="Kod 2FA"
          type="text"
          placeholder="123456"
          required
          maxlength="6"
        />
        
        <div v-if="authStore.error" class="bg-red-50 mb-4 p-3 border border-red-200 rounded-lg">
          <p class="font-medium text-red-700 text-sm text-center">
            {{ authStore.error }}
          </p>
        </div>
        
        <BaseButton
          type="submit"
          class="w-full"
          :loading="authStore.loading"
        >
          Zweryfikuj
        </BaseButton>
        
        <BaseButton
          type="button"
          variant="secondary"
          class="w-full"
          @click="backToLogin"
        >
          Wróć
        </BaseButton>
      </form>
      
      <p v-if="!show2FA" class="mt-4 text-gray-600 text-center">
        Nie masz konta? 
        <router-link to="/register" class="text-blue-500 hover:underline">Zarejestruj się</router-link>
      </p>
    </BaseCard>
  </div>
</template>
