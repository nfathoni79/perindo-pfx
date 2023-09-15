<script setup>
import { computed } from 'vue'
import cntl from 'cntl'

const props = defineProps({
  color: String,
  rounded: Boolean,
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'cyan':
      return cntl`
        bg-cyan-500 hover:bg-cyan-600
        text-cyan-50 focus:ring-cyan-300
      `
    case 'green':
      return cntl`
        bg-green-500 hover:bg-green-600
        text-green-50 focus:ring-green-300
      `
    case 'red':
      return cntl`
        bg-red-500 hover:bg-red-600
        text-red-50 focus:ring-red-300
      `
    case 'black':
      return cntl`
        bg-gray-600 hover:bg-gray-700
        text-gray-50 focus:ring-gray-300
      `
    default:
    return cntl`
        bg-cyan-500 hover:bg-cyan-600
        text-cyan-50 focus:ring-cyan-300
      `
  }
})
</script>

<template>
  <button
    :class="['inline-flex items-center justify-center',
    'shadow-lg font-semibold',
    'focus:outline-none focus:ring-2', colorClasses,
    rounded ? 'rounded-full p-2' : 'rounded-lg px-4 py-2']">
    <slot></slot>
  </button>
</template>
