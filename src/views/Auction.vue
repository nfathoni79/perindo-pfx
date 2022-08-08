<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-8 lg:px-12">
    <div class="flex items-center mb-4 flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
      <!-- Current date/time -->
      <div class="px-4 py-2 bg-white text-gray-900 shadow-lg rounded-lg w-full sm:w-auto">
        {{ formattedCurrentDate }}
      </div>

      <!-- Sort and search -->
      <div class="flex flex-col sm:items-end space-y-2 lg:flex-row lg:justify-end lg:space-x-2 w-full sm:w-auto">
        <div>
          <label for="sort" class="sr-only">Urutan</label>
          <select name="sort" id="sort" v-model="sort" @change="getAuctions" class="px-4 pr-10 py-2 border-transparent bg-white rounded-lg shadow-lg text-gray-900 w-full sm:w-auto focus:ring-cyan-600">
            <option value="time">Urutan: Tenggat Waktu</option>
            <option value="bidding">Urutan: Jumlah Tawaran</option>
            <option value="weight">Urutan: Berat Total</option>
          </select>
        </div>
        <div>
          <label for="search" class="sr-only">Cari</label>
          <input type="search" name="search" id="search" placeholder="Cari ikan atau nama penawar..." v-model="search" class="px-4 py-2 border-transparent rounded-lg shadow-lg text-gray-900 w-full sm:w-80 focus:ring-cyan-600" />
        </div>
      </div>
    </div>

    <!-- Auction table -->
    <BaseTable>
      <template v-slot:head>
        <tr>
          <th v-for="header in tableHeaders" :key="header" scope="col" class="px-4 py-2 text-left text-sm font-semibold text-gray-900 tracking-wider">
            {{ header }}
          </th>
        </tr>
      </template>

      <template v-slot:body>
        <tr v-for="(auction, index) in auctions" :key="auction.id" :class="index % 2 != 0 ? 'bg-gray-50' : ''">
          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-semibold">
            {{ auction.ikan[0].nama_ikan }}
          </td>
          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap text-right">
            {{ parseFloat(auction.berat_total).toLocaleString('id-ID', { minimumFractionDigits: 1 }) }} kg
          </td>
          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ auction.last_bidding_user == null ? '?' : auction.last_bidding_user.full_name }}
          </td>
          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap text-right">
            Rp {{ Math.ceil(auction.last_bidding / auction.berat_total).toLocaleString('id-ID') }}
          </td>
          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap text-right">
            Rp {{ Math.ceil(auction.min_bidding / auction.berat_total).toLocaleString('id-ID') }}
          </td>
          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap text-right">
            Rp {{ Math.ceil(auction.max_bidding / auction.berat_total).toLocaleString('id-ID') }}
          </td>
          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap text-right">
            <span :class="auction.status == 1 ? 'text-red-600 font-semibold' : '' ">
              {{ toMinutesSeconds(getRemainingMillis(auction.exp_at), auction.status) }}
            </span>
          </td>
        </tr>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import NProgress from 'nprogress'
import BaseTable from '../components/BaseTable.vue'
import AuctionService from '../services/AuctionService'

export default {
  components: {
    BaseTable,
  },
  data() {
    return {
      currentDate: new Date(),
      tableHeaders: [
        'Jenis Ikan',
        'Berat Total',
        'Penawar Tertinggi',
        'Jumlah Tawaran',
        'Batas Bawah',
        'Batas Atas',
        'Tenggat Waktu'
      ],
      sort: 'time',
      search: '',
      searchTimeout: null,
      countdownInterval: null,
      auctionInterval: null,
      auctions: [],
    }
  },
  created() {
    this.getAuctions()
  },
  mounted() {
    this.countdownInterval = setInterval(() => {
      this.currentDate = new Date()
    }, 1000)

    this.auctionInterval = setInterval(() => {
      this.getAuctions()
    }, 10000)
  },
  beforeUnmount() {
    clearInterval(this.countdownInterval)
    clearInterval(this.auctionInterval)
  },
  watch: {
    search(newValue) {
      clearTimeout(this.searchTimout)
      this.searchTimout = setTimeout(() =>
        this.getAuctions(this.sort, this.newValue), 1000)
    }
  },
  computed: {
    formattedCurrentDate() {
      return this.currentDate.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' })
    },
  },
  methods: {
    getAuctions() {
      NProgress.start()
      AuctionService.getAuctions(this.sort, this.search)
        .then((response) => {
          this.auctions = response.data.lelang
        })
        .catch((error) => {
          if (error.response.status == 401) {
            alert('Unauthorized')
          } else {
            alert(error.message)
          }
        })
        .finally(() => {
          NProgress.done()
        })
    },
    getRemainingMillis(expString) {
      return Date.parse(expString) - this.currentDate.getTime()
    },
    toMinutesSeconds(milliseconds, closed) {
      if (closed) return 'Selesai'
      if (milliseconds < 0) return '0:00'

      let seconds = Math.floor(milliseconds / 1000)
      const hours = Math.floor(seconds / 3600)
      seconds %= 3600
      const minutes = Math.floor(seconds / 60)
      seconds %= 60

      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
  },
}
</script>
