<script setup>
import { ref } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'
import Spinner from './Spinner.vue'

import AuctionService from '../services/AuctionService'

const props = defineProps({
  open: Boolean,
  auctionId: Number,
})

const emit = defineEmits(['onClose', 'onDelete'])

const errorMessage = ref(null)
const loading = ref(false)

/**
 * Delete an auction.
 */
const deleteAuction = () => {
  loading.value = true
  errorMessage.value = null

  AuctionService.deleteAuction(props.auctionId)
    .then(response => {
      emit('onClose')
      emit('onDelete')
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
      Hapus Lelang
    </DialogTitle>

    <form @submit.prevent="deleteAuction()" class="flex flex-col gap-4">
      <p>
        Apakah Anda yakin akan menghapus lelang ini?
      </p>

      <div class="flex justify-end gap-2">
        <AButton type="button" color="black" @click="$emit('onClose')">
          Batal
        </AButton>

        <AButton type="submit" color="red" :disabled="loading">
          <Spinner v-if="loading" class="mr-2 w-6" />
          Hapus
        </AButton>
      </div>
    </form>
  </ADialog>
</template>
