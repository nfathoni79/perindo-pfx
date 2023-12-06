<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseTable from '../components/BaseTable.vue'
import AButton from '../components/AButton.vue'
import FishDialog from '../components/FishDialog.vue'
import DeleteFishDialog from '../components/DeleteFishDialog.vue'

import FishonService from '../services/FishonService'

const props = defineProps({
  user: Object,
})
const router = useRouter()

// Fetched data
const fishList = ref([])

// Flags
const fishOpen = ref(false)
const deleteFishOpen = ref(false)

// Selected data
const selectedFishId = ref(null)
const selectedFish = ref(null)

const tableHeaders = [
  'Nama',
  'Harga Bawah',
  'Harga Atas',
  'Area',
  'Stok',
  '',
]

const areas = [
  {
    code: 'PI0010',
    name: 'Muara Baru',
  },
  {
    code: 'PI0008',
    name: 'Jakarta',
  },
]

onMounted(() => {
  getFishList()
})

watch(() => props.user, (newUser, oldUser) => {
  if (newUser?.group != 'headoffice') {
    router.push({ name: 'admin-auction' })
  }
})

/**
 * Get fish list.
 */
 const getFishList = () => {
  FishonService.getPerindoFishList()
    .then(response => {
      fishList.value = []
      const fishListRaw = response.data

      fishListRaw.forEach(fish => {
        fishList.value.push({
          id: fish.id,
          name: fish.name,
          minPrice: parseFloat(fish.price),
          maxPrice: parseFloat(fish.max_price),
          areaCode: fish.area_code,
          area: areas.find(area => area.code == fish.area_code)?.name,
          quantity: fish.quantity,
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
 * Set create or edit fish dialog open or close.
 * @param {Boolean} open - Open or close dialog.
 * @param {Number} fishId - ID of fish to be edited. Set null to clear the selectedFish.
 */
const setFishOpen = (open, fishId) => {
  if (fishId) {
    selectedFish.value = fishList.value.find(fish => {
      return fish.id == fishId
    })
  } else if (fishId === null) {
    selectedFish.value = null
  }

  fishOpen.value = open
}

/**
 * Initialize fish ID to delete, then set delete fish dialog open or close.
 * @param {Boolean} open - Open or close dialog.
 * @param {Number} fishId - ID of fish to be deleted.
 */
 const setDeleteFishOpen = (open, fishId) => {
  if (fishId) {
    selectedFishId.value = fishId
  } else {
    selectedFishId.value = null
  }

  deleteFishOpen.value = open
}
</script>

<template>
  <div>
    <!-- Actions section -->
    <div class="mt-8 flex flex-col sm:flex-row items-end sm:justify-end">
      <div class="flex gap-2">
        <!-- Create Auction button -->
        <AButton
          @click="setFishOpen(true, null)">
          <PlusIcon class="mr-2 h-6 w-6" />
          Tambah Ikan
        </AButton>
      </div>
    </div>

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
        <tr v-if="fishList.length <= 0">
          <td colspan="7" class="py-4 text-center">
            Tidak ada ikan.
          </td>
        </tr>

        <tr v-else v-for="(fish, index) in fishList" :key="fish.id"
          :class="index % 2 != 0 ? 'bg-gray-50' : ''">

          <td class="px-4 py-3 text-sm text-gray-900
            font-semibold whitespace-nowrap">
            {{ fish.name }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            {{ fish.minPrice.toLocaleString('id-ID') }} IDR
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            {{ fish.maxPrice.toLocaleString('id-ID') }} IDR
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ fish.area }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900
            whitespace-nowrap text-right">
            {{ fish.quantity.toLocaleString('id-ID') }}
          </td>

          <td class="px-4 py-3">
            <div class="flex gap-2">
              <AButton color="blue" :rounded="true"
                @click="setFishOpen(true, fish.id)">
                <PencilSquareIcon class="h-4 w-4" />
              </AButton>

              <AButton color="red" :rounded="true"
                @click="setDeleteFishOpen(true, fish.id)">
                <TrashIcon class="h-4 w-4" />
              </AButton>
            </div>
          </td>
        </tr>
      </template>
    </BaseTable>

    <!-- Create/Edit fish dialog -->
    <FishDialog
      :open="fishOpen" :fish="selectedFish" :areas="areas"
      @onClose="setFishOpen(false, false)" @onFishSubmit="getFishList()" />

    <!-- Delete Fish dialog -->
    <DeleteFishDialog
      :open="deleteFishOpen" :fishId="selectedFishId"
      @onClose="setDeleteFishOpen(false, null)" @onDelete="getFishList()" />
  </div>
</template>
