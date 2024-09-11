<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  PlusIcon,
  Cog6ToothIcon,
  ArrowRightCircleIcon,
  Bars3Icon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/solid'

import BaseTable from '../components/BaseTable.vue'
import AButton from '../components/AButton.vue'
import TransferDialog from '../components/TransferDialog.vue'
import AuctionDialog from '../components/AuctionDialog.vue'
import DeleteAuctionDialog from '../components/DeleteAuctionDialog.vue'
import BniTransfersDialog from '../components/BniTransfersDialog.vue'
import Spinner from '../components/Spinner.vue'

import AuctionService from '../services/AuctionService'
import FishonService from '../services/FishonService'
import { formatDateTime } from '../utils'

const props = defineProps({
  user: Object,
})

const router = useRouter()

// Fetched data
const auctions = ref([])
const adminCost = ref(0)
const bniAccount = ref(null)

const selectedAuctionId = ref(null)

// Flags
const bniTransfersOpen = ref(false)
const auctionOpen = ref(false)
const deleteAuctionOpen = ref(false)
const transferOpen = ref(false)
const processLoading = ref(false)

const tableHeaders = [
  'Jenis Ikan',
  'Penjual',
  'Penawar Tertinggi',
  'Jumlah Tawaran',
  'Batas Harga',
  'Waktu',
  'Diproses',
]

onMounted(() => {
  if (props.user != null) {
    getAuctions()

    if (props.user.group != 'etpi') {
      getAdminCost()
      getCurrentBniAccount()
    }
  }
})

watch(() => props.user, (newUser, oldUser) => {
  if (newUser != null) {
    getAuctions()

    if (props.user.group != 'etpi') {
      getAdminCost()
      getCurrentBniAccount()
    }
  }
})

/**
 * Get current BNI account.
 */
 const getCurrentBniAccount = () => {
  FishonService.getCurrentBniAccount()
    .then(response => {
      bniAccount.value = response.data.account
    })
    .catch(error => {
      if (error.response.status == 401) {
        router.push({ name: 'login' })
      }
    })
}

/**
 * Get auction list in current month.
 * Filtered by user's full name if the user group is `coldstorage`.
 * All auctions if the user group is `headoffice`.
 */
const getAuctions = () => {
  let fisherman = props.user.name
  if (props.user.group == 'headoffice' || props.user.group == 'etpi') {
    fisherman = ''
  }

  AuctionService.getAdminAuctions(fisherman)
    .then(response => {
      auctions.value = response.data.auctions
    })
    .catch(error => {
      console.log(error)
    })
}

/**
 * Get admin cost from Seaseed config.
 */
const getAdminCost = () => {
  AuctionService.getConfig('bni_admin_cost')
    .then(response => {
      adminCost.value = parseInt(response.data.value)
    })
    .catch(error => {
      console.log(error)
    })
}

/**
 * Process all finished auctions.
 */
const processAuctions = () => {
  processLoading.value = true

  AuctionService.processAuction()
    .then(response => {
      getAuctions()
    })
    .catch(error => {
      console.log(error)
    })
    .finally(() => {
      processLoading.value = false
    })
}

const setBniTransfersOpen = (open) => bniTransfersOpen.value = open
const setAuctionOpen = (open) => auctionOpen.value = open
const setTransferOpen = (open) => transferOpen.value = open

/**
 * Initialize auction ID to delete, then set auction dialog open or close.
 * @param {boolean} open - Open or close dialog.
 * @param {number} auctionId - ID of auction to be deleted. Can be `null`.
 */
const setDeleteAuctionOpen = (open, auctionId) => {
  if (auctionId) {
    selectedAuctionId.value = auctionId
  } else {
    selectedAuctionId.value = null
  }

  deleteAuctionOpen.value = open
}
</script>

<template>
  <div>
    <!-- Actions section -->
    <div class="mt-8 flex flex-col sm:flex-row items-end sm:justify-between">
      <div class="flex items-end gap-2">
        <!-- Balance (except for E-TPI) -->
        <div v-if="user?.group != 'etpi'"
          class="w-full sm:w-auto rounded-lg shadow-lg
          bg-gray-50 px-8 py-4 text-gray-900">
          <p>Saldo BNI</p>

          <div class="flex items-center gap-2">
            <p class="text-xl font-semibold">
              {{ bniAccount ? bniAccount.last_balance.toLocaleString('id-ID') : '?' }} IDR
            </p>

            <!-- Transactions button -->
            <Bars3Icon @click="setBniTransfersOpen(true)"
              class="h-6 w-6 text-cyan-500 hover:text-cyan-600
              cursor-pointer" />
          </div>
        </div>
        <div v-else>
          <h1 class="mb-2 text-xl font-medium text-gray-800">
            Lelang Berlangsung
          </h1>
        </div>

        <!-- Transfer button (Head Office only) -->
        <AButton v-if="user?.group == 'headoffice'"
          @click="setTransferOpen(true)">
          <ArrowRightCircleIcon class="mr-2 h-6 w-6" />
          Pindah Saldo
        </AButton>
      </div>

      <div class="flex gap-2">
        <!-- Create Auction button (Cold Storage only) -->
        <AButton v-if="user?.group?.startsWith('coldstorage')"
          @click="setAuctionOpen(true)">
          <PlusIcon class="mr-2 h-6 w-6" />
          Buat Lelang
        </AButton>

        <!-- Process Auction button (Head Office only) -->
        <AButton v-if="user?.group == 'headoffice'"
          @click="processAuctions">
          <Cog6ToothIcon v-if="!processLoading" class="mr-2 h-6 w-6" />
          <Spinner v-else class="mr-2 w-6" />
          Proses Lelang
        </AButton>
      </div>
    </div>

    <!-- Auctions table -->
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
            Tidak ada lelang bulan ini.
          </td>
        </tr>

        <tr v-else v-for="(auction, index) in auctions" :key="auction.id"
          :class="index % 2 != 0 ? 'bg-gray-50' : ''">

          <td class="px-4 py-3 text-sm text-gray-900
            font-semibold whitespace-nowrap">
            {{ auction.ikan[0].nama_ikan }}<br>
            <span class="font-medium">
              {{ parseFloat(auction.berat_total).toLocaleString('id-ID', { minimumFractionDigits: 1 }) }} kg
            </span><br>
            <span class="text-xs font-medium text-gray-600">
              ({{ auction.group }})
            </span>
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ auction.nelayan_name }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ auction.last_bidding_user == null ? '?' : auction.last_bidding_user.full_name }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            {{ Math.ceil(auction.last_bidding).toLocaleString('id-ID') }} IDR
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            {{ Math.ceil(auction.min_bidding).toLocaleString('id-ID') }} IDR<br>
            {{ Math.ceil(auction.max_bidding).toLocaleString('id-ID') }} IDR
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ formatDateTime(auction.created_at) }}<br>
            {{ formatDateTime(auction.exp_at) }}
          </td>

          <td class="px-4 py-3">
            <CheckCircleIcon v-if="auction.is_all_done == 1"
              class="h-6 w-6 text-green-600" />
            <XCircleIcon v-else class="h-6 w-6 text-red-600" />
          </td>

          <td v-if="user?.group?.startsWith('coldstorage') || user?.group == 'etpi'"
            class="px-4 py-3">
            <AButton v-if="auction.last_bidding_user == null"
              color="red" :rounded="true"
              @click="setDeleteAuctionOpen(true, auction.id)">
              <TrashIcon class="h-4 w-4" />
            </AButton>
          </td>
        </tr>
      </template>
    </BaseTable>

    <!-- BNI Transfers dialog -->
    <BniTransfersDialog v-if="user?.group != 'etpi'" :open="bniTransfersOpen"
      @onClose="setBniTransfersOpen(false)" />

    <!-- Create Auction dialog -->
    <AuctionDialog v-if="user?.group?.startsWith('coldstorage')"
      :open="auctionOpen" :storeCode="user?.storeCode"
      @onClose="setAuctionOpen(false)" @onAuctionCreated="getAuctions()" />

    <!-- Delete Auction dialog -->
    <DeleteAuctionDialog
      v-if="user?.group?.startsWith('coldstorage') || user?.group == 'etpi'"
      :open="deleteAuctionOpen" :auctionId="selectedAuctionId"
      @onClose="setDeleteAuctionOpen(false, null)" @onDelete="getAuctions()" />

    <!-- Transfer dialog -->
    <TransferDialog v-if="user?.group == 'headoffice'" :open="transferOpen"
      :accountNo="bniAccount != null ? bniAccount.number : null"
      :adminCost="adminCost"
      @onClose="setTransferOpen(false)"
      @onTransferDone="getCurrentBniAccount()" />
  </div>
</template>
