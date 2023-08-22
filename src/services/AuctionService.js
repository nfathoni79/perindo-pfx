import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN || ''}`,
  },
})

export default {
  getAuctions(sort, search) {
    return apiClient.get(`/lelang/v2/auctions/pfx/?sort=${sort}&search=${search}`)
  },
  getAdminAuctions(fisherman) {
    return apiClient.get(`/lelang/v2/auctions/pfx/?sort=created&range=month&fisherman=${fisherman}`)
  },
  getApprovals: () => {
    return apiClient.get('/seaseed/approvals/')
  },
  approveApproval: (userId, approve) => {
    return apiClient.post(`/seaseed/approvals/${userId}/`, { approve: approve })
  },
  acceptOsposAuction: (storeCode, osposAuctionId, duration) => {
    const params = new URLSearchParams()
    params.append('store', storeCode)
    params.append('ospos_auction_id', osposAuctionId)
    params.append('minute', duration)

    return apiClient.post('/lelang/v2/auctions/accept/', params)
  },
  processAuction: () => {
    return apiClient.post('/lelang/v2/auctions/process/')
  },
  deleteAuction: (id) => {
    return apiClient.delete(`/lelang/v2/auctions/${id}`)
  },
}
