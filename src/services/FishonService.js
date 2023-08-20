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
  logout: () => {
    localStorage.removeItem('fishonToken')
  },
  getCurrentUser: () => {
    setToken()
    return apiClient.get('api/user/myprofile/')
  },
  getSeaseedUser: (uuid) => {
    setToken()
    return apiClient.get(`api/seaseed/users/?uuid=${uuid}`)
  },
  getCurrentSeaseedUser: () => {
    setToken()
    return apiClient.get('api/seaseed/users/current/')
  },
  getFishList: () => {
    setToken()
    return apiClient.get('/api/log/ikan/?area=PI0010')
  },
  getColdStorageList: () => {
    setToken()
    return apiClient.get('/api/seaseed/users/coldstorage/')
  },
  getBanks: () => {
    setToken()
    return apiClient.get('/api/seaseed/banks/')
  },
  getTransactions: () => {
    setToken()
    return apiClient.get('/api/seaseed/transactions/')
  },
  createAuction: (storeCode, fishToSell) => {
    setToken()
    return apiClient. post('/api/jual/', {
      store: storeCode,
      data: fishToSell,
    })
  },
  createTransfer: (fromUuid, toUuid, amount) => {
    const params = new URLSearchParams()
    params.append('from_user_uuid', fromUuid)
    params.append('to_user_uuid', toUuid)
    params.append('amount', amount)
    params.append('remark', 'Kirim Head Office')

    return apiClient.post('/api/seaseed/transfers/', params)
  },
  createWithdrawal: (amount, email, accountNo, bankCode) => {
    const params = new URLSearchParams()
    params.append('amount', amount)
    params.append('email', email)
    params.append('account_no', accountNo)
    params.append('bank_code', bankCode)

    return apiClient.post('/api/seaseed/withdrawals/', params)
  },
}
