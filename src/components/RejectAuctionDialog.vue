<script setup>
import { ref } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'
import Spinner from './Spinner.vue'

import AuctionService from '../services/AuctionService'

const props = defineProps({
  open: Boolean,
  areaCode: String,
  auctionId: Number,
})

const emit = defineEmits(['onClose', 'onReject'])

const errorMessage = ref(null)
const loading = ref(false)

/**
 * Reject a pending auction.
 */
const rejectAuction = () => {
  loading.value = true
  errorMessage.value = null

  AuctionService.rejectOsposAuction(props.areaCode, props.auctionId)
    .then(response => {
      emit('onClose')
      emit('onReject')
    })
    .catch(error => {
      if (error.response.data.message) {
        errorMessage.value = error.response.data.message
        return
      }

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
      Tolak Lelang
    </DialogTitle>

    <form @submit.prevent="rejectAuction()" class="flex flex-col gap-4">
      <p>
        Apakah Anda yakin?
      </p>

      <div class="flex justify-end gap-2">
        <AButton type="button" color="black" @click="$emit('onClose')">
          Batal
        </AButton>

        <AButton type="submit" color="red" :disabled="loading">
          <Spinner v-if="loading" class="mr-2 w-6" />
          Tolak
        </AButton>
      </div>
    </form>
  </ADialog>
</template>
