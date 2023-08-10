<script setup>
import { useRouter } from 'vue-router'
import AButton from '../components/AButton.vue'

const router = useRouter()

const goToHome = () => router.push({ name: 'home' })
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-cyan-600">404</h1>
      <h2 class="text-3xl font-medium text-gray-800">Not Found</h2>
      <AButton color="cyan" @click="goToHome()" class="mt-4">Ke Home</AButton>
    </div>
  </div>
</template>
