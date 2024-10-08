<script setup>
import { ref, computed, onMounted } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'
import Spinner from './Spinner.vue'

import FishonService from '../services/FishonService'

const props = defineProps({
  open: Boolean,
  accountNo: String,
  adminCost: Number,
})

const emit = defineEmits(['onClose', 'onTransferDone'])

// Fetched data
const coldStorageList = ref([])
const coldStorageBalance = ref(0)

// Form fields
const transferAmount = ref(0)
const maxTransferAmount = computed(() => {
  const max = coldStorageBalance.value - props.adminCost
  return max < 0 ? 0 : max
})
const coldStorageAccountNo = ref(null)

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
  FishonService.getBniColdStorageList()
    .then(response => {
      coldStorageList.value = []
      const coldStorageListRaw = response.data.users

      coldStorageListRaw.forEach(user => {
        coldStorageList.value.push({
          bninum: user.bninum,
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
 * Get Cold Storage BNI balance.
 */
const getColdStorageBalance = () => {
  coldStorageBalance.value = 0
  transferErrorMessage.value = null

  FishonService.getBniAccountByNo(coldStorageAccountNo.value)
    .then(response => {
      coldStorageBalance.value = response.data.account.last_balance
      transferAmount.value = coldStorageBalance.value - props.adminCost
    })
    .catch(error => {
      coldStorageBalance.value = 0
      transferAmount.value = 0
      transferErrorMessage.value = 'Tidak dapat mengambil saldo.'
    })
}

/**
 * Create a transfer from a Cold Storage to current user (Head Office).
 */
const createTransfer = () => {
  transferLoading.value = true
  transferErrorMessage.value = null

  FishonService.createBniTransfer(coldStorageAccountNo.value, props.accountNo, transferAmount.value)
    .then(response => {
      emit('onClose')
      coldStorageAccountNo.value = null
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
        <select v-model="coldStorageAccountNo" required
          @change="getColdStorageBalance()"
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600">
          <option v-for="storage in coldStorageList" :value="storage.bninum">
            {{ storage.name }}
          </option>
        </select>

        <p v-if="coldStorageAccountNo != null" class="text-gray-800">
          Saldo:
          <span class="font-semibold">
            {{ coldStorageBalance.toLocaleString('id-ID') }} IDR
          </span>
        </p>
      </label>

      <label class="block">
        <span class="text-gray-800">Nominal Kirim (IDR)</span>
        <input type="number" v-model="transferAmount"
          min="0" :max="maxTransferAmount" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />

        <p class="text-gray-800">
          Biaya Admin:
          <span class="font-semibold">
            {{ adminCost.toLocaleString('id-ID') }} IDR
          </span>
        </p>
        <p class="text-lg text-gray-800">
          Total:
          <span class="font-semibold">
            {{ (transferAmount + adminCost).toLocaleString('id-ID') }} IDR
          </span>
        </p>
      </label>

      <p v-if="transferErrorMessage" class="text-red-800">
        {{ transferErrorMessage }}
      </p>

      <div class="flex justify-end gap-2">
        <AButton type="button" color="black" @click="$emit('onClose')">
          Batal
        </AButton>

        <AButton type="submit" :disabled="transferLoading || coldStorageBalance <= 0">
          <Spinner v-if="transferLoading" class="mr-2 w-6" />
          Pindah
        </AButton>
      </div>
    </form>
  </ADialog>
</template>
