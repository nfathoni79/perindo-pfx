<script setup>
import { ref, onMounted } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import BaseTable from './BaseTable.vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'

import FishonService from '../services/FishonService'

const props = defineProps({
  open: Boolean,
})

const emit = defineEmits(['onClose'])

// Fetched data
const transactions = ref([])

const tableHeaders = [
  'Tanggal',
  'Tipe',
  'Dari',
  'Ke',
  'Nominal',
]

onMounted(() => {
  getTransactions()
})

/**
 * Get transaction list of current user.
 */
const getTransactions = () => {
  FishonService.getTransactions()
    .then(response => {
      transactions.value = []
      const transactionsRaw = response.data.transactions

      transactionsRaw.forEach(trx => {
        const toUser = trx.to_user == null ? '-' : trx.to_user.full_name

        let type = 'Setor'
        switch (trx.type) {
          case 0:
            type = 'Setor'
            break
          case 1:
            type = 'Tarik'
            break
          case 2:
            type = 'Kirim'
            break
          default:
            type = 'Setor'
            break
        }

        transactions.value.push({
          fromUser: trx.from_user.full_name,
          toUser: toUser,
          amount: trx.amount,
          type: type,
          createdAt: trx.created_at
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
        <tr v-if="transactions.length <= 0">
          <td colspan="7" class="py-4 text-center">
            Tidak ada transaksi.
          </td>
        </tr>

        <tr v-else v-for="(trx, index) in transactions" :key="index"
          :class="index % 2 != 0 ? 'bg-gray-50' : ''">

          <td class="px-4 py-3 text-sm text-gray-800
            font-semibold whitespace-nowrap">
            {{ formatDateTime(trx.createdAt) }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
            {{ trx.type }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
            {{ trx.fromUser }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
            {{ trx.toUser }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-800
            whitespace-nowrap text-right">
            {{ trx.amount.toLocaleString('id-ID') }} IDR
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
