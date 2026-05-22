<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const pin = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showResetForm = ref(false)

// Check if we have pin in URL (reset link)
onMounted(() => {
  const urlPin = route.query.pin as string
  const urlEmail = route.query.email as string
  if (urlPin && urlEmail) {
    pin.value = urlPin
    email.value = urlEmail
    showResetForm.value = true
  }
})

async function handleRequestReset() {
  if (!email.value) {
    alert('Wprowadź adres email')
    return
  }

  console.log('Requesting password reset for email:', email.value)
  const success = await authStore.requestPasswordReset(email.value)
  console.log('Password reset request success:', success)

  if (success) {
    showResetForm.value = true
  } else {
    console.error('Password reset failed with error:', authStore.error)
  }
}

async function handleResetPassword() {
  if (!newPassword.value || !confirmPassword.value) {
    alert('Wypełnij oba pola hasła')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    alert('Hasła nie są zgodne')
    return
  }

  if (newPassword.value.length < 6) {
    alert('Hasło musi mieć co najmniej 6 znaków')
    return
  }

  const success = await authStore.resetPassword(pin.value, email.value, newPassword.value)
  if (success) {
    alert('Hasło zostało zmienione pomyślnie')
    router.push('/login')
  }
}

function backToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="flex justify-center items-center bg-gray-100 px-4 min-h-screen">
    <BaseCard class="p-8 w-full max-w-md">
      <h1 class="mb-6 font-bold text-2xl text-center">
        {{ showResetForm ? 'Resetowanie hasła' : 'Zapomniałeś hasła?' }}
      </h1>

      <!-- Request Reset Form -->
      <form v-if="!showResetForm" @submit.prevent="handleRequestReset" class="space-y-4">
        <p class="mb-4 text-gray-600 text-sm text-center">
          Wprowadź swój adres email, a wyślemy Ci PIN do resetowania hasła.
        </p>

        <BaseInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="twoj@email.com"
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
          Wyślij PIN
        </BaseButton>

        <BaseButton
          type="button"
          variant="secondary"
          class="w-full"
          @click="backToLogin"
        >
          Wróć do logowania
        </BaseButton>
      </form>

      <!-- Reset Password Form -->
      <form v-else @submit.prevent="handleResetPassword" class="space-y-4">
        <p class="mb-4 text-gray-600 text-sm text-center">
          Wprowadź PIN otrzymany w emailu oraz nowe hasło dla konta <strong>{{ email }}</strong>.
        </p>

        <BaseInput
          v-model="pin"
          label="PIN z emaila"
          type="text"
          placeholder="np. 123456"
          required
          maxlength="6"
        />

        <BaseInput
          v-model="newPassword"
          label="Nowe hasło"
          type="password"
          placeholder="••••••••"
          required
        />

        <BaseInput
          v-model="confirmPassword"
          label="Potwierdź hasło"
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
          Zmień hasło
        </BaseButton>

        <BaseButton
          type="button"
          variant="secondary"
          class="w-full"
          @click="backToLogin"
        >
          Wróć do logowania
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>
