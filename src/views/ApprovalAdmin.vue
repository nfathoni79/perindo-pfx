<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import BaseTable from '../components/BaseTable.vue'
import AButton from '../components/AButton.vue'
import Spinner from '../components/Spinner.vue'
import AuctionService from '../services/AuctionService'

const props = defineProps({
  user: Object,
})
const router = useRouter()

// Fetched data
const approvals = ref([])

// Flags
const approveLoading = ref(false)

const tableHeaders = [
  'Username',
  'Nama Lengkap',
  'Nomor Ponsel',
  'Email',
  'Tanggal Daftar',
  '',
]

onMounted(() => {
  getApprovals()
})

watch(() => props.user, (newUser, oldUser) => {
  if (newUser?.group != 'headoffice') {
    router.push({ name: 'admin-auction' })
  }
})

/**
 * Get pending approvals.
 */
const getApprovals = () => {
  AuctionService.getApprovals()
    .then(response => {
      approvals.value = response.data.approvals
    })
}

/**
 * Approve or reject a pending approval.
 * @param {Number} userId - User ID to be approved.
 * @param {Boolean} approve - Approve or reject.
 */
const approveApproval = (userId, approve) => {
  approveLoading.value = true

  AuctionService.approveApproval(userId, approve)
    .then(response => {
      getApprovals()
    })
    .finally(() => {
      approveLoading.value = false
    })
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
        <tr v-if="approvals.length <= 0">
          <td colspan="7" class="py-4 text-center">
            Tidak ada user yang menunggu persetujuan.
          </td>
        </tr>

        <tr v-else v-for="(appr, index) in approvals" :key="appr.user.id"
          :class="index % 2 != 0 ? 'bg-gray-50' : ''">

          <td class="px-4 py-3 text-sm text-gray-900
            font-semibold whitespace-nowrap">
            {{ appr.user.username }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ appr.user.full_name }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ appr.user.phone }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ appr.user.email }}
          </td>

          <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
            {{ formatDateTime(appr.created_at) }}
          </td>

          <td class="px-4 py-3">
            <div class="flex gap-2">
              <AButton color="green" :rounded="true" :disabled="approveLoading"
                @click="approveApproval(appr.user.id, true)">
                <Spinner v-if="approveLoading" class="w-4" />
                <CheckIcon v-else class="h-4 w-4" />
              </AButton>

              <AButton color="red" :rounded="true" :disabled="approveLoading"
                @click="approveApproval(appr.user.id, false)">
                <Spinner v-if="approveLoading" class="w-4" />
                <XMarkIcon v-else class="h-4 w-4" />
              </AButton>
            </div>
          </td>
        </tr>
      </template>
    </BaseTable>
  </div>
</template>
