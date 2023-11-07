<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  UserIcon,
  PowerIcon,
} from '@heroicons/vue/24/outline'
import AButton from '../components/AButton.vue'
import FishonService from '../services/FishonService'

const router = useRouter()
const route = useRoute()
const user = ref(null)
const navs = [
  { name: 'Auction', routeName: 'admin-auction' },
  { name: 'Approval', routeName: 'admin-approval' },
  { name: 'Fish', routeName: 'admin-fish' },
]

onMounted(() => {
  getCurrentUser()
})

/**
 * Get current user.
 */
 const getCurrentUser = () => {
  FishonService.getCurrentUser()
    .then(response => {
      const groups = response.data.data.profil.groups
      const groupName = groups[0].name
      const splits = groupName.split('_')

      user.value = {
        name: response.data.data.profil.full_name,
        group: groups[0].name,
        storeCode: splits.length == 2 ? splits[1] : null,
      }
    })
    .catch(error => {
      if (error.response.status == 401) {
        router.push({ name: 'login' })
      }
    })
}

/**
 * Log user out. Remove token from local storage.
 */
 const logout = () => {
  FishonService.logout()
  router.push({ name: 'login' })
}

/**
 * Check if nav menu active base on the current route.
 * @param {String} routeName - Nav route name.
 */
const isMenuActive = (routeName) => {
  return route.name.startsWith(routeName)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
    <nav class="flex items-center justify-between h-20">
      <!-- Logo -->
      <div>
        <router-link :to="{ name: 'home' }">
          <img class="h-10" src="../assets/pfx-logo.png" alt="PFX" />
        </router-link>
      </div>

      <!-- Navs -->
      <div v-if="user?.group == 'headoffice'" class="flex gap-4">
        <router-link v-for="nav in navs" :key="nav.routeName"
          :to="{ name: nav.routeName}"
          :class="[isMenuActive(nav.routeName)
          ? 'font-semibold underline underline-offset-4 decoration-2'
          : 'font-medium', 'text-cyan-600']">
          {{ nav.name }}
        </router-link>
      </div>

      <!-- User info -->
      <div class="flex items-center gap-2 text-cyan-600 font-semibold">
        <UserIcon class="h-6 w-6" />
        <div>{{ user?.name }}</div>
        <AButton color="red" :rounded="true" @click="logout()">
          <PowerIcon class="h-4 w-4" />
        </AButton>
      </div>
    </nav>

    <router-view :user="user" />
  </div>
</template>
