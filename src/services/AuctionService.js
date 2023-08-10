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
    return apiClient.get(`/lelang/pfx/?sort=${sort}&search=${search}`)
  },
  acceptOsposAuction: (osposAuctionId, duration) => {
    const params = new URLSearchParams()
    params.append('store', 'PI0010')
    params.append('ospos_auction_id', osposAuctionId)
    params.append('minute', duration)

    return apiClient.post('/lelang/v2/auctions/accept/', params)
  },
}
