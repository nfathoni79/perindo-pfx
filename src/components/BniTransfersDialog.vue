<script setup>
import { ref, onMounted } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/solid'
import BaseTable from './BaseTable.vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'

import FishonService from '../services/FishonService'

const props = defineProps({
  open: Boolean,
})

const emit = defineEmits(['onClose'])

// Fetched data
const transfers = ref([])

const tableHeaders = [
  'Tanggal',
  'Dari',
  'Ke',
  'Sukses',
  'Nominal',
]

onMounted(() => {
  getBniTransfers()
})

/**
 * Get BNI transfers of current user.
 */
const getBniTransfers = () => {
  FishonService.getBniTransfers()
    .then(response => {
      transfers.value = []
      const transfersRaw = response.data.transfers

      transfersRaw.forEach(trf => {
        transfers.value.push({
          fromAccount: trf.from_account.name,
          toAccount: trf.to_account.name,
          amount: trf.amount,
          status: trf.status,
          createdAt: trf.created_at
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
 * Format date time string to Indonesian locale.
 * @param {string} dateTimeString - date time string.
 */
const formatDateTime = (dateTimeString) => {
  return new Date(dateTimeString).toLocaleString(
    'id-ID', { dateStyle: 'short', timeStyle: 'short' })
}
</script>

<template>
  <ADialog :open="open" :large="true" @onClose="$emit('onClose')">
    <DialogTitle class="mb-4 text-lg text-cyan-700 font-semibold">
      Riwayat Transaksi
    </DialogTitle>

    <BaseTable class="mt-4">
      <template v-slot:head>
        <tr>
          <th v-for="header in tableHeaders" :key="header" scope="col"
          class="px-4 py-2 text-left text-sm font-semibold
          text-gray-900 tracking-wider">
            {{ header }}
          </th>
        </tr>
      </template>

      <template v-slot:body>
        <tr v-if="transfers.length <= 0">
          <td colspan="7" class="py-4 text-center">
            Tidak ada transaksi.
          </td>
        </tr>

        <tr v-else v-for="(trf, index) in transfers" :key="index"
          :class="index % 2 != 0 ? 'bg-gray-50' : ''">

          <td class="px-4 py-3 text-sm text-gray-800
            font-semibold whitespace-nowrap">
            {{ formatDateTime(trf.createdAt) }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
            {{ trf.fromAccount }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
            {{ trf.toAccount }}
          </td>

          <td class="px-4 py-3">
            <CheckCircleIcon v-if="trf.status == 1"
              class="h-6 w-6 text-green-600" />
            <XCircleIcon v-else class="h-6 w-6 text-red-600" />
          </td>

          <td class="px-4 py-3 text-sm text-gray-800
            whitespace-nowrap text-right">
            {{ trf.amount.toLocaleString('id-ID') }} IDR
          </td>
        </tr>
      </template>
    </BaseTable>

    <div class="mt-4 flex justify-end gap-2">
      <AButton type="button" color="black" @click="$emit('onClose')">
        Tutup
      </AButton>
    </div>
  </ADialog>
</template>
