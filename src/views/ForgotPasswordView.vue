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
const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showResetForm = ref(false)
const showSuccess = ref(false)

// Check if we have token in URL (reset link)
onMounted(() => {
  const urlToken = route.query.token as string
  const urlEmail = route.query.email as string
  if (urlToken && urlEmail) {
    token.value = urlToken
    email.value = urlEmail
    showResetForm.value = true
  }
})

async function handleRequestReset() {
  if (!email.value) {
    alert('Wprowadź adres email')
    return
  }

  const success = await authStore.requestPasswordReset(email.value)
  if (success) {
    showSuccess.value = true
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

  const success = await authStore.resetPassword(token.value, email.value, newPassword.value)
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
      <form v-if="!showResetForm && !showSuccess" @submit.prevent="handleRequestReset" class="space-y-4">
        <p class="mb-4 text-gray-600 text-sm text-center">
          Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła.
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
          Wyślij link resetujący
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

      <!-- Success Message -->
      <div v-else-if="showSuccess" class="space-y-4 text-center">
        <div class="text-6xl">📧</div>
        <p class="text-gray-600">
          Link do resetowania hasła został wysłany na adres <strong>{{ email }}</strong>.
        </p>
        <p class="text-gray-500 text-sm">
          Sprawdź swoją skrzynkę odbiorczą i postępuj zgodnie z instrukcjami w emailu.
        </p>
        <BaseButton
          type="button"
          variant="secondary"
          class="w-full"
          @click="backToLogin"
        >
          Wróć do logowania
        </BaseButton>
      </div>

      <!-- Reset Password Form -->
      <form v-else @submit.prevent="handleResetPassword" class="space-y-4">
        <p class="mb-4 text-gray-600 text-sm text-center">
          Wprowadź nowe hasło dla konta <strong>{{ email }}</strong>.
        </p>

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
