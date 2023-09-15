<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  PlusIcon,
  Cog6ToothIcon,
  ArrowRightCircleIcon,
  ArrowDownCircleIcon,
  Bars3Icon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/solid'

import BaseTable from '../components/BaseTable.vue'
import AButton from '../components/AButton.vue'
import TransactionsDialog from '../components/TransactionsDialog.vue'
import TransferDialog from '../components/TransferDialog.vue'
import WithdrawalDialog from '../components/WithdrawalDialog.vue'
import AuctionDialog from '../components/AuctionDialog.vue'
import DeleteAuctionDialog from '../components/DeleteAuctionDialog.vue'
import Spinner from '../components/Spinner.vue'

import AuctionService from '../services/AuctionService'
import FishonService from '../services/FishonService'

const props = defineProps({
  user: Object,
})
const router = useRouter()

// Fetched data
const seaseedUser = ref(null)
const auctions = ref([])
const adminCost = ref(0)

const selectedAuctionId = ref(null)

// Flags
const transactionsOpen = ref(false)
const auctionOpen = ref(false)
const deleteAuctionOpen = ref(false)
const transferOpen = ref(false)
const withdrawalOpen = ref(false)
const processLoading = ref(false)

const tableHeaders = [
  'Jenis Ikan',
  'Penjual',
  'Penawar Tertinggi',
  'Jumlah Tawaran',
  'Waktu Mulai',
  'Waktu Selesai',
  'Diproses',
]

onMounted(() => {
  if (props.user != null) {
    getCurrentSeaseedUser()
    getAuctions()
    getAdminCost()
    processCost()
  }
})

watch(() => props.user, (newUser, oldUser) => {
  if (newUser != null) {
    getCurrentSeaseedUser()
    getAuctions()
    getAdminCost()
    processCost()
  }
})

/**
 * Get current Seaseed user, contains Seaseed UUID and balance.
 */
const getCurrentSeaseedUser = () => {
  FishonService.getCurrentSeaseedUser()
    .then(response => {
      seaseedUser.value = {
        uuid: response.data.user.user_uuid,
        balance: response.data.user.balance,
      }
    })
    .catch(error => {
      if (error.response.status == 401) {
        router.push({ name: 'login' })
      }
    })
}

/**
 * Get auction list in current month.
 * Filtered by user's full name if the user group is coldstorage.
 * All auctions if the user group is headoffice.
 */
const getAuctions = () => {
  let fisherman = props.user.name
  if (props.user.group == 'headoffice') fisherman = ''

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
  AuctionService.getConfig('admin_cost')
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

/**
 * Process admin cost of pending withdrawal.
 */
const processCost = () => {
  FishonService.processCost()
    .then(response => console.log(response.data))
    .catch(error => console.log(error))
}

const setTransactionsOpen = (open) => transactionsOpen.value = open
const setAuctionOpen = (open) => auctionOpen.value = open
const setTransferOpen = (open) => transferOpen.value = open
const setWithdrawalOpen = (open) => withdrawalOpen.value = open

/**
 * Initialize auction ID to delete, then set auction dialog open or close.
 * @param {Boolean} open - Open or close dialog.
 * @param {Number} auctionId - ID of auction to be deleted.
 */
const setDeleteAuctionOpen = (open, auctionId) => {
  if (auctionId) {
    selectedAuctionId.value = auctionId
  } else {
    selectedAuctionId.value = null
  }

  deleteAuctionOpen.value = open
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
  <div>
    <!-- Actions section -->
    <div class="mt-8 flex flex-col sm:flex-row items-end sm:justify-between">
      <div class="flex items-end gap-2">
        <!-- Balance -->
        <div class="w-full sm:w-auto rounded-lg shadow-lg
          bg-gray-50 px-8 py-4 text-gray-900">
          <p>Saldo Wallet</p>

          <div class="flex items-center gap-2">
            <p class="text-xl font-semibold">
              {{ seaseedUser ? seaseedUser.balance.toLocaleString('id-ID') : '?' }} IDR
            </p>

            <!-- Transactions button -->
            <Bars3Icon @click="setTransactionsOpen(true)"
              class="h-6 w-6 text-cyan-500 hover:text-cyan-600
              cursor-pointer" />
          </div>
        </div>

        <!-- Transfer button -->
        <AButton v-if="user?.group == 'headoffice'"
          @click="setTransferOpen(true)">
          <ArrowRightCircleIcon class="mr-2 h-6 w-6" />
          Pindah Saldo
        </AButton>

        <!-- Withdrawal button -->
        <AButton v-if="user?.group == 'headoffice'"
          @click="setWithdrawalOpen(true)">
          <ArrowDownCircleIcon class="mr-2 h-6 w-6" />
          Tarik Saldo
        </AButton>
      </div>

      <div class="flex gap-2">
        <!-- Create Auction button -->
        <AButton v-if="user?.group?.startsWith('coldstorage')"
          @click="setAuctionOpen(true)">
          <PlusIcon class="mr-2 h-6 w-6" />
          Buat Lelang
        </AButton>

        <!-- Process Auction button -->
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
            {{ auction.ikan[0].nama_ikan }}
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

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ formatDateTime(auction.created_at) }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ formatDateTime(auction.exp_at) }}
          </td>

          <td class="px-4 py-3">
            <CheckCircleIcon v-if="auction.is_all_done == 1"
              class="h-6 w-6 text-green-600" />
            <XCircleIcon v-else class="h-6 w-6 text-red-600" />
          </td>

          <td v-if="user?.group?.startsWith('coldstorage')" class="px-4 py-3">
            <AButton v-if="auction.last_bidding_user == null"
              color="red" :rounded="true"
              @click="setDeleteAuctionOpen(true, auction.id)">
              <TrashIcon class="h-4 w-4" />
            </AButton>
          </td>
        </tr>
      </template>
    </BaseTable>

    <!-- Transactions dialog -->
    <TransactionsDialog :open="transactionsOpen"
      @onClose="setTransactionsOpen(false)" />

    <!-- Create Auction dialog -->
    <AuctionDialog v-if="user?.group?.startsWith('coldstorage')"
      :open="auctionOpen" :storeCode="user?.storeCode"
      @onClose="setAuctionOpen(false)" @onAuctionCreated="getAuctions()" />

    <!-- Delete Auction dialog -->
    <DeleteAuctionDialog v-if="user?.group?.startsWith('coldstorage')"
      :open="deleteAuctionOpen" :auctionId="selectedAuctionId"
      @onClose="setDeleteAuctionOpen(false, null)" @onDelete="getAuctions()" />

    <!-- Transfer dialog -->
    <TransferDialog v-if="user?.group == 'headoffice'" :open="transferOpen"
      :userUuid="seaseedUser != null ? seaseedUser.uuid : null"
      :adminCost="adminCost"
      @onClose="setTransferOpen(false)"
      @onTransferDone="getCurrentSeaseedUser()" />

    <!-- Withdrawal dialog -->
    <WithdrawalDialog v-if="user?.group == 'headoffice'" :open="withdrawalOpen"
      :adminCost="adminCost"
      @onClose="setWithdrawalOpen(false)" />
  </div>
</template>
