<script setup>
import { ref, watch } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'
import Spinner from './Spinner.vue'

import AuctionService from '../services/AuctionService'

const props = defineProps({
  open: Boolean,
  user: Object,
})

const emit = defineEmits(['onClose', 'onBniSubmit'])

// Form fields
const accountNo = ref('')

// Messages
const bniErrorMessage = ref(null)

// Flags
const bniLoading = ref(false)

watch(() => props.user, (newUser, oldUser) => {
  if (newUser) {
    accountNo.value = newUser.bninum
  } else {
    accountNo.value = ''
  }
})

/**
 * Update BNI account number of a user.
 */
const submitBni = () => {
  bniLoading.value = true
  bniErrorMessage.value = ''

  if (accountNo.value == '') {
    AuctionService.updateUserBni(props.user.id, '')
      .then(response => {
        emit('onClose')
        emit('onBniSubmit')
      })
      .catch(error => {
        bniErrorMessage.value = error.message
      })
      .finally(() => {
        bniLoading.value = false
      })

    return
  }

  AuctionService.getBniAccountByNo(accountNo.value)
    .then(response => {
      const account = response.data.account

      if (!account.is_ogp || account.status != 'BUKA') {
        bniErrorMessage.value = 'Rekening tidak aktif.'
        return
      }

      AuctionService.updateUserBni(props.user.id, account.number)
        .then(response => {
          emit('onClose')
          emit('onBniSubmit')
        }).catch(error => {
          bniErrorMessage.value = error.message
        })
    })
    .catch(error => {
      bniErrorMessage.value = error.message
    })
    .finally(() => {
      bniLoading.value = false
    })
}
</script>

<template>
  <ADialog :open="open" @onClose="$emit('onClose')">
    <DialogTitle class="mb-4 text-lg text-cyan-700 font-semibold">
      Input Nomor Rekening BNI
    </DialogTitle>

    <form @submit.prevent="submitBni()" class="flex flex-col gap-4">
      <label class="block">
        <span class="text-gray-800">Nomor Rekening</span>
        <input type="text" v-model="accountNo"
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />
      </label>

      <p v-if="bniErrorMessage" class="text-red-800">
        {{ bniErrorMessage }}
      </p>

      <div class="flex justify-end gap-2">
        <AButton type="button" color="black" @click="$emit('onClose')">
          Batal
        </AButton>

        <AButton type="submit" :disabled="bniLoading">
          <Spinner v-if="bniLoading" class="mr-2 w-6" />
          Submit
        </AButton>
      </div>
    </form>
  </ADialog>
</template>
