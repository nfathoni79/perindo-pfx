import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_FISHON_API_BASE_URL || 'http://localhost:8010',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

const setToken = () => {
  const token = localStorage.getItem('fishonToken')
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default {
  login: (username, password) => {
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)
    params.append('grant_type', 'password')

    return apiClient.post('/o/token/', params, {
      auth: {
        username: import.meta.env.VITE_FISHON_API_CLIENT_ID,
        password: import.meta.env.VITE_FISHON_API_CLIENT_SECRET,
      },
    })
  },
  getFishList: () => {
    setToken()
    return apiClient.get('/api/log/ikan/?area=PI0010')
  },
  createAuction: (fishToSell) => {
    setToken()
    return apiClient. post('/api/jual/', {
      store: 'PI0010',
      data: fishToSell,
    })
  },
}
