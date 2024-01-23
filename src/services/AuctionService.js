import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN || ''}`,
  },
})

/**
 * Get config value by key.
 * @param {string} key - Config key.
 */
const getConfig = key => {
  return apiClient.get(`/seaseed/configs/?key=${key}`)
}

/**
 * Get public auctions by sort and search.
 * @param {string} sort - Sort query.
 * @param {string} search - Search query.
 */
const getAuctions = (sort, search) => {
  return apiClient.get(`/lelang/v2/auctions/pfx/?sort=${sort}&search=${search}`)
}

/**
 * Get auctions for admin. Can be filtered by fisherman name.
 * @param {string} fisherman - Fisherman name.
 */
const getAdminAuctions = fisherman => {
  return apiClient.get(`/lelang/v2/auctions/pfx/?sort=created&range=month&fisherman=${fisherman}`)
}

/**
 * Get pending auctions filtered by store/area code.
 * @param {string} storeCode - Store/area code.
 */
const getPendingAuctions = storeCode => {
  return apiClient.get(`/lelang/v2/auctions/pending/?store=${storeCode}`)
}

/**
 * Get unapproved users.
 */
const getApprovals = () => {
  return apiClient.get('/seaseed/approvals/')
}

/**
 * Approve or reject unapproved user.
 * @param {number} userId - User ID to be approved or rejected.
 * @param {boolean} approve - Approve if true else reject.
 */
const approveApproval = (userId, approve) => {
  return apiClient.post(`/seaseed/approvals/${userId}/`, { approve: approve })
}

/**
 * Accept pending auction in Ospos.
 * @param {string} areaCode - Area code.
 * @param {number} osposAuctionId - ID of the Ospos auction.
 * @param {number} duration - Auction duration in minutes.
 * @param {string} group - Auction target. Can be `null`.
 */
const acceptOsposAuction = (areaCode, osposAuctionId, duration, group) => {
  const params = new URLSearchParams()
  params.append('store', areaCode)
  params.append('ospos_auction_id', osposAuctionId)
  params.append('minute', duration)

  if (group) {
    params.append('group', group)
  }

  return apiClient.post('/lelang/v2/auctions/accept/', params)
}

/**
 * Reject pending auction in Ospos.
 * @param {string} areaCode - Area code.
 * @param {number} osposAuctionId - ID of the Ospos auction.
 */
const rejectOsposAuction = (areaCode, osposAuctionId) => {
  const params = new URLSearchParams()
  params.append('store', areaCode)
  params.append('ospos_auction_id', osposAuctionId)

  return apiClient.post('/lelang/v2/auctions/reject/', params)
}

/**
 * Manually process all finished auctions.
 */
const processAuction = () => {
  return apiClient.post('/lelang/v2/auctions/process/')
}

/**
 * Delete an auction that has not been bid on.
 * @param {number} id - Auction ID.
 */
const deleteAuction = id => {
  return apiClient.delete(`/lelang/v2/auctions/${id}`)
}

export default {
  getConfig,
  getAuctions,
  getAdminAuctions,
  getPendingAuctions,
  getApprovals,
  approveApproval,
  acceptOsposAuction,
  rejectOsposAuction,
  processAuction,
  deleteAuction,
}
