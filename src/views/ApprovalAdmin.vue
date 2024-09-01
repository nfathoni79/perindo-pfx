<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PencilSquareIcon } from '@heroicons/vue/24/outline'

import BaseTable from '../components/BaseTable.vue'
import AButton from '../components/AButton.vue'
import BniEditDialog from '../components/BniEditDialog.vue'

import AuctionService from '../services/AuctionService'
import { formatDateTime } from '../utils'

const props = defineProps({
  user: Object,
})

const router = useRouter()

// Fetched data
const users = ref([])

// Flags
const bniOpen = ref(false)

// Selected data
const selectedUser = ref(null)

const tableHeaders = [
  'Username',
  'Nama Lengkap',
  'Nomor Ponsel',
  'Email',
  'Rekening BNI',
  'Tanggal Daftar',
  '',
]

onMounted(() => {
  getBisnisUsers()
})

watch(() => props.user, (newUser, oldUser) => {
  if (newUser?.group != 'headoffice') {
    router.push({ name: 'admin-auction' })
  }
})

/**
 * Get Perindo Bisnis users to assign BNI account.
 */
 const getBisnisUsers = () => {
  AuctionService.getBisnisUsers()
    .then(response => {
      users.value = response.data.users
    })
}

/**
 * Set edit BNI dialog open or close.
 * @param {boolean} open - Open or close dialog.
 * @param {number} userId - ID of user to be edited. Set `null` to clear the `selectedUser`.
 */
 const setBniOpen = (open, userId) => {
  if (userId) {
    selectedUser.value = users.value.find(user => {
      return user.id == userId
    })
  } else if (userId === null) {
    selectedUser.value = null
  }

  bniOpen.value = open
}
</script>

<template>
  <div>
    <BaseTable class="mt-8">
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
        <tr v-if="users.length <= 0">
          <td colspan="7" class="py-4 text-center">
            Tidak ada user yang menunggu persetujuan.
          </td>
        </tr>

        <tr v-else v-for="(user, index) in users" :key="user.id"
          :class="index % 2 != 0 ? 'bg-gray-50' : ''">

          <td class="px-4 py-3 text-sm text-gray-900
            font-semibold whitespace-nowrap">
            {{ user.username }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ user.full_name }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ user.phone }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ user.email }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ user.bninum != '' ? user.bninum : '-' }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ formatDateTime(user.date_joined) }}
          </td>

          <td class="px-4 py-3">
            <div class="flex gap-2">
              <AButton color="blue" :rounded="true"
                @click="setBniOpen(true, user.id)">
                <PencilSquareIcon class="h-4 w-4" />
              </AButton>
            </div>
          </td>
        </tr>
      </template>
    </BaseTable>

    <!-- Edit BNI account dialog -->
    <BniEditDialog
      :open="bniOpen" :user="selectedUser"
      @onClose="setBniOpen(false, false)" @onBniSubmit="getBisnisUsers()" />
  </div>
</template>
