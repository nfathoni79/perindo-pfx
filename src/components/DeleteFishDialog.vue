<script setup>
import { ref } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'
import Spinner from './Spinner.vue'

import FishonService from '../services/FishonService'

const props = defineProps({
  open: Boolean,
  fishId: Number,
})

const emit = defineEmits(['onClose', 'onDelete'])

const errorMessage = ref(null)
const loading = ref(false)

/**
 * Delete a fish.
 */
const deleteAuction = () => {
  loading.value = true
  errorMessage.value = null

  FishonService.deleteFish(props.fishId)
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
      Hapus Ikan
    </DialogTitle>

    <form @submit.prevent="deleteAuction()" class="flex flex-col gap-4">
      <p>
        Apakah Anda yakin akan menghapus ikan ini?
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
