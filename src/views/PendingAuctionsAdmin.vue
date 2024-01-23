<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'

import AcceptAuctionDialog from '../components/AcceptAuctionDialog.vue'
import RejectAuctionDialog from '../components/RejectAuctionDialog.vue'
import BaseTable from '../components/BaseTable.vue'
import AButton from '../components/AButton.vue'
import Spinner from '../components/Spinner.vue'

import AuctionService from '../services/AuctionService'
import { formatDateTime } from '../utils'

const props = defineProps({
  user: Object,
})

const router = useRouter()

// Fetched data
const auctions = ref([])

// Form fields
const areaCode = ref('PI0010')
const selectedAuctionId = ref(null)

// Flags
const acceptAuctionOpen = ref(false)
const rejectAuctionOpen = ref(false)
const loading = ref(false)

const tableHeaders = [
  'Nama Nelayan',
  'Jenis Ikan',
  'Berat Total',
  'Tanggal',
  'Tindakan',
]

onMounted(() => {
  getPendingAuctions()
})

/**
 * Get pending auctions.
 */
const getPendingAuctions = () => {
  AuctionService.getPendingAuctions(areaCode.value)
    .then(response => {
      auctions.value = response.data.pending_auctions
    })
    .catch(error => {
      if (error.response.status == 401) {
        router.push({ name: 'login' })
      }
    })
}

/**
 * Initialize auction ID to accept, then set auction dialog open or close.
 * @param {boolean} open - Open or close dialog.
 * @param {number} auctionId - ID of auction to be accepted. Can be `null`.
 */
 const setAcceptAuctionOpen = (open, auctionId) => {
  if (auctionId) {
    selectedAuctionId.value = auctionId
  } else {
    selectedAuctionId.value = null
  }

  acceptAuctionOpen.value = open
}

/**
 * Initialize auction ID to reject, then set auction dialog open or close.
 * @param {boolean} open - Open or close dialog.
 * @param {number} auctionId - ID of auction to be rejected. Can be `null`.
 */
 const setRejectAuctionOpen = (open, auctionId) => {
  if (auctionId) {
    selectedAuctionId.value = auctionId
  } else {
    selectedAuctionId.value = null
  }

  rejectAuctionOpen.value = open
}
</script>

<template>
  <div>
    <!-- Actions section -->
    <div class="mt-8 flex flex-col sm:flex-row items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-medium text-gray-800">
          Lelang Menunggu Persetujuan
        </h1>
      </div>

      <div>
        <label for="area" class="sr-only">Area</label>
        <select id="area" v-model="areaCode" @change="getPendingAuctions()"
          class="w-full sm:w-auto border-transparent rounded-lg shadow-lg
          bg-white px-4 pr-10 py-2 text-gray-900 focus:ring-cyan-600">
          <option value="PI0010">Muara Baru</option>
          <option value="PI0008">Jakarta</option>
        </select>
      </div>
    </div>

    <!-- Pending Auctions table -->
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
        <tr v-if="auctions.length <= 0">
          <td colspan="7" class="py-4 text-center">
            Tidak ada lelang yang menunggu persetujuan.
          </td>
        </tr>

        <tr v-else v-for="(auction, index) in auctions" :key="auction.id"
          :class="index % 2 != 0 ? 'bg-gray-50' : ''">

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ auction.fisherman_name }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ auction.fish.kindoffish_name }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ auction.fish.fishamount.toLocaleString('id-ID', { minimumFractionDigits: 1 }) }} Kg
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ formatDateTime(auction.created_at) }}
          </td>

          <td class="px-4 py-3">
            <div class="flex gap-2">
              <AButton color="green" :rounded="true" :disabled="loading"
                title="Setujui"
                @click="setAcceptAuctionOpen(true, auction.id)">
                <Spinner v-if="loading" class="w-4" />
                <CheckIcon v-else class="h-4 w-4" />
              </AButton>

              <AButton color="red" :rounded="true" :disabled="loading"
                title="Tolak"
                @click="setRejectAuctionOpen(true, auction.id)">
                <Spinner v-if="loading" class="w-4" />
                <XMarkIcon v-else class="h-4 w-4" />
              </AButton>
            </div>
          </td>
        </tr>
      </template>
    </BaseTable>

    <!-- Accept Auction dialog -->
    <AcceptAuctionDialog :open="acceptAuctionOpen"
      :areaCode="areaCode" :auctionId="selectedAuctionId"
      @onClose="setAcceptAuctionOpen(false, null)"
      @onAccept="getPendingAuctions()" />

    <!-- Reject Auction dialog -->
    <RejectAuctionDialog :open="rejectAuctionOpen"
      :areaCode="areaCode" :auctionId="selectedAuctionId"
      @onClose="setRejectAuctionOpen(false, null)"
      @onReject="getPendingAuctions()" />
  </div>
</template>
