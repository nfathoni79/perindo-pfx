<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import NProgress from 'nprogress'

import BaseTable from '../components/BaseTable.vue'
import AuctionService from '../services/AuctionService'

// Timeout/intervals
const currentDate = ref(new Date())
const searchTimeout = ref(null)
const countdownInterval = ref(null)
const auctionInterval = ref(null)

// Fetched data
const auctions = ref([])

// Form fields
const sort = ref('time')
const search = ref('')

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

const getAuctions = () => {
  NProgress.start()
  AuctionService.getAuctions(sort.value, search.value)
    .then(response => {
      auctions.value = response.data.auctions
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

/**
 * Calculate the difference between current time and expired time.
 * @param {string} expString - Expired time in string.
 */
const getRemainingMillis = (expString) => {
  return Date.parse(expString) - currentDate.value.getTime()
}

/**
 * Convert milliseconds to minute:second format.
 * If `closed` is true, it will display text instead.
 * @param {number} milliseconds - Milliseconds to convert.
 * @param {boolean} closed - If auction is already closed or not.
 */
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
            {{ auction.ikan[0].nama_ikan }}<br>
            <span class="text-xs font-medium text-gray-600">
              ({{ auction.group }})
            </span>
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
            {{ Math.ceil(auction.last_bidding / auction.berat_total).toLocaleString('id-ID') }} IDR
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            {{ Math.ceil(auction.min_bidding / auction.berat_total).toLocaleString('id-ID') }} IDR
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            {{ Math.ceil(auction.max_bidding / auction.berat_total).toLocaleString('id-ID') }} IDR
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
  </div>
</template>
