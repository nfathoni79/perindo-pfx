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
  }
}
