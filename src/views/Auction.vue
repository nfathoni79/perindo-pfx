<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import NProgress from 'nprogress'
import { PlusIcon } from '@heroicons/vue/24/solid'
import {
  DialogTitle,
} from '@headlessui/vue'

import BaseTable from '../components/BaseTable.vue'
import AButton from '../components/AButton.vue'
import Spinner from '../components/Spinner.vue'
import ADialog from '../components/ADialog.vue'

import AuctionService from '../services/AuctionService'
import FishonService from '../services/FishonService'

const router = useRouter()

// Timeout/intervals
const currentDate = ref(new Date())
const searchTimeout = ref(null)
const countdownInterval = ref(null)
const auctionInterval = ref(null)

// Fetched data
const auctions = ref([])
const fishList = ref([])

// Form fields
const sort = ref('time')
const search = ref('')
const fish = ref(null)
const weight = ref(1)
const duration = ref(5)

// Flags/messages
const formOpen = ref(false)
const errorMessage = ref('')
const loggedIn = ref(false)
const createAuctionLoading = ref(false)

const tableHeaders = [
  'Jenis Ikan',
  'Berat Total',
  'Penawar Tertinggi',
  'Jumlah Tawaran',
  'Batas Bawah',
  'Batas Atas',
  'Tenggat Waktu'
]

const formattedCurrentDate = computed(() => {
  return currentDate.value.toLocaleString(
    'id-ID', { dateStyle: 'long', timeStyle: 'medium' })
})

onMounted(() => {
  getAuctions()
  getFishList()

  countdownInterval.value = setInterval(() => {
    currentDate.value = new Date()
  }, 1000)

  auctionInterval.value = setInterval(() => {
    getAuctions()
  }, 10000)
})

onBeforeUnmount(() => {
  clearInterval(countdownInterval.value)
  clearInterval(auctionInterval.value)
})

watch(search, (newValue) => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() =>
    getAuctions(sort.value, newValue), 1000)
})

const setFormOpen = (open) => formOpen.value = open

const getAuctions = () => {
  NProgress.start()
  AuctionService.getAuctions(sort.value, search.value)
    .then(response => {
      auctions.value = response.data.lelang
    })
    .catch(error => {
      if (error.response.status == 401) {
        alert('Unauthorized')
      } else {
        alert(error.message)
      }
    })
    .finally(() => {
      NProgress.done()
    })
}

const getFishList = () => {
  FishonService.getFishList()
    .then(response => {
      loggedIn.value = true
      fishList.value = []
      const fishListRaw = response.data

      fishListRaw.forEach(fish => {
        fishList.value.push({
          id: fish.id,
          name: fish.name,
        })
      })
    })
    .catch(error => {
      if (error.response.status == 401) {
        loggedIn.value = false
      }
    })
}

const createAuction = () => {
  createAuctionLoading.value = true
  errorMessage.value = ''

  const fishToSell = [{
    jenis_ikan_id: fish.value,
    jenis_ikan_name: fishList.value.find(f => f.id == fish.value).name,
    amountOfFish: weight.value,
  }]

  FishonService.createAuction(fishToSell)
    .then(response => {
      const osposAuctionId = response.data.ospos_auction_id

      AuctionService.acceptOsposAuction(osposAuctionId, duration.value)
        .then(response => {
          setFormOpen(false)
          fish.value = null
          weight.value = 1
          duration.value = 5
        })
        .catch(error => {
          errorMessage.value = error.message
        })
    })
    .catch(error => {
      if (error.response.status == 401) {
        loggedIn.value = false
        router.push({ name: 'login' })
      }
    })
    .finally(() => {
      createAuctionLoading.value = false
    })
}

const getRemainingMillis = (expString) => {
  return Date.parse(expString) - currentDate.value.getTime()
}

const toMinutesSeconds = (milliseconds, closed) => {
  if (closed) return 'Selesai'
  if (milliseconds < 0) return '0:00'

  let seconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(seconds / 3600)
  seconds %= 3600
  const minutes = Math.floor(seconds / 60)
  seconds %= 60

  const padMinutes = minutes.toString().padStart(2, '0')
  const padSeconds = seconds.toString().padStart(2, '0')

  return `${hours}:${padMinutes}:${padSeconds}`
}

const submitForm = () => createAuction()
</script>

<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-8 lg:px-12">
    <div class="mb-4 flex flex-col sm:flex-row items-center sm:justify-between
      space-y-2 sm:space-y-0">

      <!-- Current date/time -->
      <div class="w-full sm:w-auto rounded-lg shadow-lg
        bg-gray-50 px-4 py-2 text-gray-900">
        {{ formattedCurrentDate }}
      </div>

      <!-- Sort and search -->
      <div class="flex flex-col lg:flex-row sm:items-end lg:justify-end
        space-y-2 lg:space-x-2 w-full sm:w-auto">
        <div>
          <label for="sort" class="sr-only">Urutan</label>
          <select name="sort" id="sort" v-model="sort" @change="getAuctions"
            class="w-full sm:w-auto border-transparent rounded-lg shadow-lg
            bg-white px-4 pr-10 py-2 text-gray-900 focus:ring-cyan-600">
            <option value="time">Urutan: Tenggat Waktu</option>
            <option value="bidding">Urutan: Jumlah Tawaran</option>
            <option value="weight">Urutan: Berat Total</option>
          </select>
        </div>

        <div>
          <label for="search" class="sr-only">Cari</label>
          <input type="search" name="search" id="search" v-model="search"
            placeholder="Cari ikan atau nama penawar..."
            class="w-full sm:w-80 border-transparent rounded-lg shadow-lg
            px-4 py-2 text-gray-900 focus:ring-cyan-600" />
        </div>

        <AButton v-if="loggedIn" color="green" @click="setFormOpen(true)">
          <PlusIcon class="h-6 w-6" />
        </AButton>
      </div>
    </div>

    <!-- Auction table -->
    <BaseTable>
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
            Belum ada lelang hari ini.
          </td>
        </tr>

        <tr v-else v-for="(auction, index) in auctions" :key="auction.id"
          :class="index % 2 != 0 ? 'bg-gray-50' : ''">

          <td class="px-4 py-3 text-sm text-gray-900
            font-semibold whitespace-nowrap">
            {{ auction.ikan[0].nama_ikan }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            {{ parseFloat(auction.berat_total).toLocaleString('id-ID', { minimumFractionDigits: 1 }) }} kg
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ auction.last_bidding_user == null ? '?' : auction.last_bidding_user.full_name }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            Rp {{ Math.ceil(auction.last_bidding / auction.berat_total).toLocaleString('id-ID') }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            Rp {{ Math.ceil(auction.min_bidding / auction.berat_total).toLocaleString('id-ID') }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            Rp {{ Math.ceil(auction.max_bidding / auction.berat_total).toLocaleString('id-ID') }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            <span :class="auction.status == 1 ? 'text-red-600 font-semibold' : '' ">
              {{ toMinutesSeconds(getRemainingMillis(auction.exp_at), auction.status) }}
            </span>
          </td>
        </tr>
      </template>
    </BaseTable>

    <ADialog :open="formOpen" @onClose="setFormOpen(false)">
      <DialogTitle class="mb-4 text-lg text-cyan-700 font-semibold">
        Buat Lelang
      </DialogTitle>

      <form @submit.prevent="submitForm()" class="flex flex-col gap-4">
        <label class="block">
          <span class="text-gray-800">Jenis Ikan</span>
          <select name="fish" id="fish" v-model="fish" required
            class="block w-full border border-gray-400 rounded-lg shadow-sm
            px-4 py-2 text-gray-800 focus:ring-cyan-600">
            <option v-for="fish in fishList" :value="fish.id">
              {{ fish.name }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="text-gray-800">Berat (Kg)</span>
          <input type="number" name="weight" id="weight"
            v-model="weight" min="0" required
            class="block w-full border border-gray-400 rounded-lg shadow-sm
            px-4 py-2 text-gray-800 focus:ring-cyan-600" />
        </label>

        <label class="block">
          <span class="text-gray-800">Durasi (menit)</span>
          <input type="number" name="duration" id="duration"
            v-model="duration" min="5" required
            class="block w-full border border-gray-400 rounded-lg shadow-sm
            px-4 py-2 text-gray-800 focus:ring-cyan-600" />
        </label>

        <p v-if="errorMessage" class="text-red-800">
          {{ errorMessage }}
        </p>

        <div class="flex justify-end gap-2">
          <AButton type="button" color="black" @click="setFormOpen(false)">
            Batal
          </AButton>

          <AButton type="submit" color="green" :disabled="createAuctionLoading">
            <Spinner v-if="createAuctionLoading" class="mr-2 w-6" />
            Buat
          </AButton>
        </div>
      </form>
    </ADialog>
  </div>
</template>
