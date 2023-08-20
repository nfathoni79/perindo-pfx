<script setup>
import { ref, onMounted } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'
import Spinner from './Spinner.vue'

import FishonService from '../services/FishonService'

const props = defineProps({
  open: Boolean,
  userUuid: String,
})

const emit = defineEmits(['onClose', 'onTransferDone'])

// Fetched data
const coldStorageList = ref([])
const coldStorageBalance = ref(0)

// Form fields
const transferAmount = ref(0)
const coldStorageUuid = ref(null)

// Messages
const transferErrorMessage = ref(null)

// Flags
const transferLoading = ref(false)

onMounted(() => {
  getColdStorageList()
})

/**
 * Get Cold Storage user list.
 */
const getColdStorageList = () => {
  FishonService.getColdStorageList()
    .then(response => {
      coldStorageList.value = []
      const coldStorageListRaw = response.data.users

      coldStorageListRaw.forEach(user => {
        coldStorageList.value.push({
          uuid: user.user_uuid,
          name: user.full_name,
        })
      })
    })
    .catch(error => {
      if (error.response.status == 401) {
        router.push({ name: 'login' })
      }
    })
}

/**
 * Get Cold Storage user's balance.
 */
const getColdStorageBalance = () => {
  coldStorageBalance.value = 0

  FishonService.getSeaseedUser(coldStorageUuid.value)
    .then(response => {
      coldStorageBalance.value = response.data.user.balance
      transferAmount.value = coldStorageBalance.value
    })
    .catch(error => {
      transferErrorMessage.value = 'Tidak dapat mengambil saldo.'
    })
}

/**
 * Create a transfer from a Cold Storage to current user (Head Office).
 */
const createTransfer = () => {
  transferLoading.value = true
  transferErrorMessage.value = null

  FishonService.createTransfer(coldStorageUuid.value, props.userUuid, transferAmount.value)
    .then(response => {
      emit('onClose')
      coldStorageUuid.value = null
      transferAmount.value = 0

      emit('onTransferDone')
    })
    .catch(error => {
      if (error.response.status == 401) {
        router.push({ name: 'login' })
        return
      }

      if (error.response.data.message) {
        transferErrorMessage.value = error.response.data.message
        return
      }

      transferErrorMessage.value = error.message
    })
    .finally(() => {
      transferLoading.value = false
    })
}
</script>

<template>
  <ADialog :open="open" @onClose="$emit('onClose')">
    <DialogTitle class="mb-4 text-lg text-cyan-700 font-semibold">
      Pindah Saldo dari Cold Storage
    </DialogTitle>

    <form @submit.prevent="createTransfer()" class="flex flex-col gap-4">
      <label class="block">
        <span class="text-gray-800">Cold Storage</span>
        <select v-model="coldStorageUuid" required
          @change="getColdStorageBalance()"
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600">
          <option v-for="storage in coldStorageList" :value="storage.uuid">
            {{ storage.name }}
          </option>
        </select>

        <p v-if="coldStorageUuid != null" class="text-gray-800">
          Saldo: {{ coldStorageBalance.toLocaleString('id-ID') }} IDR
        </p>
      </label>

      <label class="block">
        <span class="text-gray-800">Nominal Kirim (IDR)</span>
        <input type="number" v-model="transferAmount" min="0" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />
      </label>

      <p v-if="transferErrorMessage" class="text-red-800">
        {{ transferErrorMessage }}
      </p>

      <div class="flex justify-end gap-2">
        <AButton type="button" color="black" @click="$emit('onClose')">
          Batal
        </AButton>

        <AButton type="submit" :disabled="transferLoading">
          <Spinner v-if="transferLoading" class="mr-2 w-6" />
          Pindah
        </AButton>
      </div>
    </form>
  </ADialog>
</template>
