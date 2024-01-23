<script setup>
import { ref } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'
import Spinner from './Spinner.vue'

import AuctionService from '../services/AuctionService'

import { capitalize } from '../utils'

const props = defineProps({
  open: Boolean,
  areaCode: String,
  auctionId: Number,
})

const emit = defineEmits(['onClose', 'onAccept'])

// Form fields
const group = ref(null)
const duration = ref(5)

// Messages
const errorMessage = ref(null)

// Flags
const loading = ref(false)

const groups = ['pemindang', 'pabrik']

/**
 * Accept a pending auction.
 */
const acceptAuction = () => {
  loading.value = true
  errorMessage.value = ''

  AuctionService.acceptOsposAuction(
      props.areaCode, props.auctionId, duration.value, group.value)
    .then(response => {
      emit('onClose')
      group.value = null
      duration.value = 5

      emit('onAccept')
    })
    .catch(error => {
      errorMessage.value = error.message
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <ADialog :open="open" @onClose="$emit('onClose')">
    <DialogTitle class="mb-4 text-lg text-cyan-700 font-semibold">
      Setujui Lelang
    </DialogTitle>

    <form @submit.prevent="acceptAuction()" class="flex flex-col gap-4">
      <label class="block">
        <span class="text-gray-800">Jenis Penawar</span>
        <select v-model="group" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600">
          <option v-for="item in groups" :value="item">
            {{ capitalize(item) }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="text-gray-800">Durasi (menit)</span>
        <input type="number" v-model="duration" min="5" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />
      </label>

      <p v-if="errorMessage" class="text-red-800">
        {{ errorMessage }}
      </p>

      <div class="flex justify-end gap-2">
        <AButton type="button" color="black" @click="$emit('onClose')">
          Batal
        </AButton>

        <AButton type="submit" color="green" :disabled="loading">
          <Spinner v-if="loading" class="mr-2 w-6" />
          Setujui
        </AButton>
      </div>
    </form>
  </ADialog>
</template>
