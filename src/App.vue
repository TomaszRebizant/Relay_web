<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'
</script>

<template>
  <div class="flex bg-gray-50 min-h-screen">
    <Sidebar />
    <div class="flex flex-col flex-1">
      <Header />
      <main class="flex-1 p-8 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
