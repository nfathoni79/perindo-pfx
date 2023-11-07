<script setup>
import { ref, computed, watch } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import ADialog from './ADialog.vue'
import AButton from './AButton.vue'
import Spinner from './Spinner.vue'

import FishonService from '../services/FishonService'

const props = defineProps({
  open: Boolean,
  fish: Object,
  areas: Array,
})

const emit = defineEmits(['onClose', 'onFishSubmit'])

// Fetched data
const fishList = ref([])

// Form fields
const name = ref(null)
const minPrice = ref(0)
const maxPrice = ref(999999)
const areaCode = ref(null)

// Messages
const fishErrorMessage = ref(null)

// Flags
const fishLoading = ref(false)

// Computed data
const isEdit = computed(() => {
  return props.fish
})

watch(() => props.fish, (newFish, oldFish) => {
  if (newFish) {
    name.value = newFish.name
    minPrice.value = newFish.minPrice
    maxPrice.value = newFish.maxPrice
    areaCode.value = newFish.areaCode
  } else {
    name.value = null
    minPrice.value = 0
    maxPrice.value = 999999
    areaCode.value = null
  }
})

/**
 * Edit or create a new fish.
 */
const submitFish = () => {
  fishLoading.value = true
  fishErrorMessage.value = ''

  const fishData = {
    name: name.value,
    price: minPrice.value,
    max_price: maxPrice.value,
    area_code: areaCode.value,
  }

  if (isEdit.value) {
    FishonService.updateFish(props.fish?.id, fishData)
    .then(response => {
      emit('onClose')
      emit('onFishSubmit')
    })
    .catch(error => {
      fishErrorMessage.value = error.message
    })
    .finally(() => {
      fishLoading.value = false
    })
  } else {
    FishonService.createFish(fishData)
    .then(response => {
      emit('onClose')
      emit('onFishSubmit')
    })
    .catch(error => {
      fishErrorMessage.value = error.message
    })
    .finally(() => {
      fishLoading.value = false
    })
  }
}
</script>

<template>
  <ADialog :open="open" @onClose="$emit('onClose')">
    <DialogTitle class="mb-4 text-lg text-cyan-700 font-semibold">
      {{ isEdit ? 'Ubah Ikan' : 'Tambah Ikan' }}
    </DialogTitle>

    <form @submit.prevent="submitFish()" class="flex flex-col gap-4">
      <label class="block">
        <span class="text-gray-800">Nama Ikan</span>
        <input type="text" v-model="name" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />
      </label>

      <label class="block">
        <span class="text-gray-800">Harga Bawah (IDR)</span>
        <input type="number" v-model="minPrice" min="0" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />
      </label>

      <label class="block">
        <span class="text-gray-800">Harga Atas (IDR)</span>
        <input type="number" v-model="maxPrice" min="0" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600" />
      </label>

      <label class="block">
        <span class="text-gray-800">Area</span>
        <select v-model="areaCode" required
          class="block w-full border border-gray-400 rounded-lg shadow-sm
          px-4 py-2 text-gray-800 focus:ring-cyan-600">
          <option v-for="area in areas" :value="area.code">
            {{ area.name }}
          </option>
        </select>
      </label>

      <p v-if="fishErrorMessage" class="text-red-800">
        {{ fishErrorMessage }}
      </p>

      <div class="flex justify-end gap-2">
        <AButton type="button" color="black" @click="$emit('onClose')">
          Batal
        </AButton>

        <AButton type="submit" :disabled="fishLoading">
          <Spinner v-if="fishLoading" class="mr-2 w-6" />
          Submit
        </AButton>
      </div>
    </form>
  </ADialog>
</template>
