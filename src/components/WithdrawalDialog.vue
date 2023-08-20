<script setup>
import { ref, onMounted } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'
import Spinner from './Spinner.vue'

import FishonService from '../services/FishonService'

const props = defineProps({
  open: Boolean,
})

const emit = defineEmits(['onClose'])

// Fetched data
const banks = ref([])

// Form fields
const withdrawAmount = ref(0)
const email = ref('')
const accountNo = ref('')
const bankCode = ref(null)

// Messages
const withdrawalErrorMessage = ref(null)

// Flags
const withdrawalLoading = ref(false)

onMounted(() => {
  getBanks()
})

/**
 * Get bank list.
 */
const getBanks = () => {
  FishonService.getBanks()
    .then(response => {
      banks.value = []
      const banksRaw = response.data.banks

      banksRaw.forEach(bank => {
        banks.value.push({
          code: bank.code,
          name: bank.name,
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
 * Create a withdrawal.
 */
const createWithdrawal = () => {
  withdrawalLoading.value = true
  withdrawalErrorMessage.value = null

  FishonService.createWithdrawal(withdrawAmount.value, email.value, accountNo.value, bankCode.value)
    .then(response => {
      emit('onClose')
      withdrawAmount.value = 0
      email.value = ''
      accountNo.value = ''
      bankCode.value = null
    })
    .catch(error => {
      if (error.response.status == 401) {
        router.push({ name: 'login' })
        return
      }

      if (error.response.data.message) {
        withdrawalErrorMessage.value = error.response.data.message
        return
      }

      withdrawalErrorMessage.value = error.message
    })
    .finally(() => {
      withdrawalLoading.value = false
    })
}
</script>

<template>
  <ADialog :open="open" @onClose="$emit('onClose')">
    <DialogTitle class="mb-4 text-lg text-cyan-700 font-semibold">
      Tarik Saldo
    </DialogTitle>

    <form @submit.prevent="createWithdrawal()" class="flex flex-col gap-4">
      <label class="block">
        <span class="text-gray-800">Nominal Tarik (IDR)</span>
        <input type="number" v-model="withdrawAmount" min="0" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />
      </label>

      <label class="block">
        <span class="text-gray-800">Email</span>
        <input type="email" v-model="email" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />
      </label>

      <label class="block">
        <span class="text-gray-800">Nomor Rekening</span>
        <input type="text" v-model="accountNo" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />
      </label>

      <label class="block">
        <span class="text-gray-800">Nama Bank</span>
        <select v-model="bankCode" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600">
          <option v-for="bank in banks" :value="bank.code">
            {{ bank.name }}
          </option>
        </select>
      </label>

      <p v-if="withdrawalErrorMessage" class="text-red-800">
        {{ withdrawalErrorMessage }}
      </p>

      <div class="flex justify-end gap-2">
        <AButton type="button" color="black" @click="$emit('onClose')">
          Batal
        </AButton>

        <AButton type="submit" :disabled="withdrawalLoading">
          <Spinner v-if="withdrawalLoading" class="mr-2 w-6" />
          Tarik
        </AButton>
      </div>
    </form>
  </ADialog>
</template>
