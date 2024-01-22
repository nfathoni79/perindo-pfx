<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navs = [
  { name: 'Home', routeName: 'home' },
  { name: 'Live Auction', routeName: 'auction' },
]

/**
 * Check if nav menu is active based on the current route.
 * @param {string} routeName - Nav route name.
 */
const isMenuActive = (routeName) => {
  return route.name.startsWith(routeName)
}
</script>

<template>
  <div>
    <nav class="bg-cyan-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div class="flex items-center justify-between h-20">
          <!-- Left: Logo -->
          <div>
            <router-link :to="{ name: 'home' }">
              <img class="h-10" src="../assets/pfx-logo.png" alt="PFX" />
            </router-link>
          </div>

          <!-- Right: Navigation -->
          <div>
            <div class="flex space-x-6">
              <router-link v-for="item in navs" :key="item.routeName"
                :to="{ name: item.routeName }"
                :class="[isMenuActive(item.routeName)
                ? 'font-semibold underline underline-offset-4 decoration-2'
                : 'font-medium', 'text-cyan-600']">
                {{ item.name }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>
