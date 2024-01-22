<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AButton from '../components/AButton.vue'
import Spinner from '../components/Spinner.vue'
import FishonService from '../services/FishonService'

const router = useRouter()

const loading = ref(false)
const username = ref('')
const password = ref('')
const errorMessage = ref('')

const submitForm = () => {
  loading.value = true
  errorMessage.value = ''

  FishonService.login(username.value, password.value)
    .then(response => {
      localStorage.setItem('fishonToken', response.data.access_token)

      FishonService.getCurrentUser()
        .then(response => {
          const groups = response.data.data.profil.groups
          const allowedGroups = groups.filter(group => {
            return group.name.startsWith('coldstorage') || group.name == 'headoffice'
          })

          if (allowedGroups.length < 1) {
            localStorage.removeItem('fishonToken')
            errorMessage.value = 'Unauthorized'
            return
          }

          router.push({ name: 'admin-auction' })
        })
    })
    .catch(error => {
      if (error.response.status == 400) {
        errorMessage.value = error.response.data.error_description
      } else {
        errorMessage.value = error.message
      }
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <router-link :to="{ name: 'home' }">
      <img src="../assets/pfx-logo.png" alt="PFX" class="mt-8 mx-auto h-20" />
    </router-link>

    <div class="mt-8 rounded-lg shadow-lg bg-white p-6">
      <h1 class="text-xl text-cyan-700 font-semibold">
        Masuk dengan akun Nelayan
      </h1>

      <form @submit.prevent="submitForm()" class="mt-4 flex flex-col gap-4">
        <label class="block">
          <span class="text-gray-800">Username</span>
          <input type="text" name="username" id="username"
            v-model="username" required autofocus
            class="block w-full border border-gray-400 rounded-lg shadow-sm
            px-4 py-2 text-gray-800 focus:ring-cyan-600" />
        </label>

        <label class="block">
          <span class="text-gray-800">Password</span>
          <input type="password" name="password" id="password"
            v-model="password" required
            class="block w-full border border-gray-400 rounded-lg shadow-sm
            px-4 py-2 text-gray-800 focus:ring-cyan-600" />
        </label>

        <p v-if="errorMessage" class="text-red-800">
          {{ errorMessage }}
        </p>

        <div class="flex justify-end gap-2">
          <AButton type="submit" color="cyan" :disabled="loading"
            class="w-full">
            <Spinner v-if="loading" class="mr-2 w-6"/>
            Masuk
          </AButton>
        </div>
      </form>
    </div>
  </div>
</template>
