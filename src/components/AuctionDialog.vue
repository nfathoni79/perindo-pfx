<script setup>
import { ref, computed, onMounted } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'
import Spinner from './Spinner.vue'

import FishonService from '../services/FishonService'
import AuctionService from '../services/AuctionService'

const props = defineProps({
  open: Boolean,
  storeCode: String,
})

const emit = defineEmits(['onClose', 'onAuctionCreated'])

// Fetched data
const fishList = ref([])

// Form fields
const fishId = ref(null)
const group = ref(null)
const weight = ref(1)
const duration = ref(5)

// Messages
const auctionErrorMessage = ref(null)

// Flags
const auctionLoading = ref(false)

// Computed data
const selectedFish = computed(() => {
  return fishList.value.find(fish => {
    return fish.id == fishId.value
  })
})

const groups = ['pemindang', 'pabrik']

onMounted(() => {
  getFishList()
})

/**
 * Get fish list to sell to an auction.
 */
const getFishList = () => {
  FishonService.getFishList(props.storeCode)
    .then(response => {
      fishList.value = []
      const fishListRaw = response.data

      fishListRaw.forEach(fish => {
        const minPrice = parseFloat(fish.price)
        const maxPrice = parseFloat(fish.max_price)

        if (minPrice > 0 || maxPrice > 0) {
          fishList.value.push({
            id: fish.id,
            name: fish.name,
            minPrice: minPrice,
            maxPrice: maxPrice,
          })
        }
      })
    })
    .catch(error => {
      if (error.response.status == 401) {
        router.push({ name: 'login' })
      }
    })
}

/**
 * Create an auction.
 */
const createAuction = () => {
  auctionLoading.value = true
  auctionErrorMessage.value = ''

  const fishToSell = [{
    jenis_ikan_id: fishId.value,
    jenis_ikan_name: fishList.value.find(f => f.id == fishId.value).name,
    amountOfFish: weight.value,
  }]

  FishonService.createAuction(props.storeCode, group.value, fishToSell)
    .then(response => {
      const osposAuctionId = response.data.ospos_auction_id

      AuctionService.acceptOsposAuction(props.storeCode, osposAuctionId, duration.value)
        .then(response => {
          emit('onClose')
          fishId.value = null
          weight.value = 1
          duration.value = 5

          emit('onAuctionCreated')
        })
        .catch(error => {
          auctionErrorMessage.value = error.message
        })
    })
    .catch(error => {
      if (error.response.status == 401) {
        router.push({ name: 'login' })
        return
      }

      auctionErrorMessage.value = error.message
    })
    .finally(() => {
      auctionLoading.value = false
    })
}

/**
 * Capitalize the first letter of text.
 * @param {String} text - Text to be capitalized.
 */
const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
</script>

<template>
  <ADialog :open="open" @onClose="$emit('onClose')">
    <DialogTitle class="mb-4 text-lg text-cyan-700 font-semibold">
      Buat Lelang
    </DialogTitle>

    <form @submit.prevent="createAuction()" class="flex flex-col gap-4">
      <label class="block">
        <span class="text-gray-800">Jenis Ikan</span>
        <select v-model="fishId" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600">
          <option v-for="fish in fishList" :value="fish.id">
            {{ fish.name }}
          </option>
        </select>

        <p v-if="selectedFish" class="text-gray-800">
          Harga:
          <span class="font-semibold">
            {{ selectedFish.minPrice.toLocaleString('id-ID') }} -
            {{ selectedFish.maxPrice.toLocaleString('id-ID') }} IDR
          </span>
        </p>
      </label>

      <label class="block">
        <span class="text-gray-800">Jenis Penawar</span>
        <select v-model="group" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600">
          <option v-for="item in groups" :value="item">
            {{ capitalize(item) }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="text-gray-800">Berat (Kg)</span>
        <input type="number" v-model="weight" min="0" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />
      </label>

      <label class="block">
        <span class="text-gray-800">Durasi (menit)</span>
        <input type="number" v-model="duration" min="5" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />
      </label>

      <p v-if="auctionErrorMessage" class="text-red-800">
        {{ auctionErrorMessage }}
      </p>

      <div class="flex justify-end gap-2">
        <AButton type="button" color="black" @click="$emit('onClose')">
          Batal
        </AButton>

        <AButton type="submit" :disabled="auctionLoading">
          <Spinner v-if="auctionLoading" class="mr-2 w-6" />
          Buat
        </AButton>
      </div>
    </form>
  </ADialog>
</template>
