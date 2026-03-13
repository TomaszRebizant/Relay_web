<script setup lang="ts">
import { BaseCard } from '@/components/ui'
</script>

<template>
  <div class="flex flex-col gap-8">
    <section>
      <h1 class="mb-2 font-bold text-slate-800 text-3xl">O aplikacji</h1>
      <p class="text-gray-600">ServiceHub - System zarządzania urządzeniami i zgłoszeniami serwisowymi</p>
    </section>

    <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
      <BaseCard title="Wersja" icon="📦" color="blue">
        <p class="mt-2 text-gray-600 text-sm">v1.0.0</p>
      </BaseCard>
      
      <BaseCard title="Technologie" icon="🛠️" color="green">
        <p class="mt-2 text-gray-600 text-sm">Vue 3 + TypeScript + Tailwind CSS</p>
      </BaseCard>
      
      <BaseCard title="Funkcjonalności" icon="✨" color="purple">
        <ul class="space-y-1 mt-2 text-gray-600 text-sm">
          <li>• Zarządzanie urządzeniami</li>
          <li>• System zgłoszeń</li>
          <li>• Kody QR</li>
          <li>• Geolokalizacja</li>
        </ul>
      </BaseCard>
      
      <BaseCard title="Autor" icon="👤" color="cyan">
        <p class="mt-2 text-gray-600 text-sm">ZMP Development Team</p>
      </BaseCard>
    </div>
  </div>
</template>
