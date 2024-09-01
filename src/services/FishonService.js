import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_FISHON_API_BASE_URL || 'http://localhost:8010',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

/**
 * Set token in headers.
 */
const setToken = () => {
  const token = localStorage.getItem('fishonToken')
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

/**
 * Login as a Fishon user.
 * @param {string} username - Fishon username.
 * @param {password} password - Fishon password.
 */
const login = (username, password) => {
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
}

/**
 * Logout by removing token from local storage.
 */
const logout = () => {
  localStorage.removeItem('fishonToken')
}

/**
 * Get current Fishon user.
 */
const getCurrentUser = () => {
  setToken()
  return apiClient.get('api/user/myprofile/')
}

/**
 * Get Seaseed user by UUID.
 * @param {string} uuid - Seaseed user UUID.
 * @returns
 */
const getSeaseedUser = uuid => {
  setToken()
  return apiClient.get(`api/seaseed/users/?uuid=${uuid}`)
}

/**
 * Get current Seaseed user.
 */
const getCurrentSeaseedUser = () => {
  setToken()
  return apiClient.get('api/seaseed/users/current/')
}

/**
 * Get fish list. Can be filtered by area code.
 * @param {string} areaCode - Fish area code.
 */
const getFishList = areaCode => {
  setToken()
  if (!areaCode) return apiClient.get(`/api/log/ikan/`)

  return apiClient.get(`/api/log/ikan/?area=${areaCode}`)
}

/**
 * Get Perindo only fish list.
 */
const getPerindoFishList = () => {
  setToken()
  return apiClient.get(`/api/log/ikan/?area-prefix=PI`)
}

/**
 * Create a new fish.
 * @param {Object} fishData - Fish data to be created.
 */
const createFish = fishData => {
  setToken()
  return apiClient.post('/api/log/ikan/', fishData)
}

/**
 * Update a fish.
 * @param {number} fishId - ID of fish to be updated.
 * @param {Object} fishData - New fish data.
 */
const updateFish = (fishId, fishData) => {
  setToken()
  return apiClient.put(`/api/log/ikan/${fishId}/`, fishData)
}

/**
 * Delete a fish.
 * @param {number} fishId - ID of fish to be deleted.
 */
const deleteFish = fishId => {
  setToken()
  return apiClient.delete(`/api/log/ikan/${fishId}/`)
}

/**
 * Get Cold Storage users list.
 */
const getColdStorageList = () => {
  setToken()
  return apiClient.get('/api/seaseed/users/coldstorage/')
}

/**
 * Get Seaseed bank list.
 */
const getBanks = () => {
  setToken()
  return apiClient.get('/api/seaseed/banks/')
}

/**
 * Get current Seaseed user's transaction history.
 */
const getTransactions = () => {
  setToken()
  return apiClient.get('/api/seaseed/transactions/')
}

/**
 * Create an auction.
 * @param {string} storeCode - Auction area code.
 * @param {string} group - Auction target: `pemindang` or `pabrik`.
 * @param {Object} fishToSell - Fish data to sell in an auction.
 * @returns
 */
const createAuction = (storeCode, group, fishToSell) => {
  setToken()
  return apiClient. post('/api/jual/', {
    store: storeCode,
    group: group,
    data: fishToSell,
  })
}

/**
 * Create a Seaseed transfer.
 * @param {string} fromUuid - From user UUID.
 * @param {string} toUuid - To user UUID.
 * @param {number} amount - Amount to transfer.
 */
const createTransfer = (fromUuid, toUuid, amount) => {
  setToken()
  const params = new URLSearchParams()
  params.append('from_user_uuid', fromUuid)
  params.append('to_user_uuid', toUuid)
  params.append('amount', amount)
  params.append('remark', 'Kirim Head Office')

  return apiClient.post('/api/seaseed/transfers/', params)
}

/**
 * Create a withdrawal.
 * @param {number} amount - Amount to withdraw.
 * @param {string} email - Withdrawer email.
 * @param {string} accountNo - Bank account number.
 * @param {string} bankCode - Bank code.
 */
const createWithdrawal = (amount, email, accountNo, bankCode) => {
  setToken()
  const params = new URLSearchParams()
  params.append('amount', amount)
  params.append('email', email)
  params.append('account_no', accountNo)
  params.append('bank_code', bankCode)

  return apiClient.post('/api/seaseed/withdrawals/', params)
}

/**
 * Process admin cost for withdrawal.
 */
const processCost = () => {
  setToken()
  return apiClient.post('api/seaseed/process/')
}

/**
 * Get Cold Storage users list, containing BNI account number.
 */
const getBniColdStorageList = () => {
  setToken()
  return apiClient.get('/api/user/coldstorage/')
}

/**
 * Get current BNI account.
 */
const getCurrentBniAccount = () => {
  setToken()
  return apiClient.get('api/bni/accounts/')
}

/**
 * Get a BNI account by number.
 */
const getBniAccountByNo = accountNo => {
  return apiClient.get(`api/bni/accounts/?account_no=${accountNo}`)
}

/**
 * Get current BNI account's transfer history.
 */
const getBniTransfers = () => {
  setToken()
  return apiClient.get('/api/bni/transfers/')
}

/**
 * Create a BNI transfer.
 * @param {string} fromAccountNo - From account number.
 * @param {string} toAccountNo - To account number.
 * @param {number} amount - Amount to transfer.
 */
const createBniTransfer = (fromAccountNo, toAccountNo, amount) => {
  setToken()
  const params = new URLSearchParams()
  params.append('from_account_no', fromAccountNo)
  params.append('to_account_no', toAccountNo)
  params.append('amount', amount)
  params.append('remark', 'Kirim Head Office')

  return apiClient.post('/api/bni/transfers/', params)
}

export default {
  login,
  logout,
  getCurrentUser,
  getSeaseedUser,
  getCurrentSeaseedUser,
  getFishList,
  getPerindoFishList,
  createFish,
  updateFish,
  deleteFish,
  getColdStorageList,
  getBanks,
  getTransactions,
  createAuction,
  createTransfer,
  createWithdrawal,
  processCost,
  getBniColdStorageList,
  getCurrentBniAccount,
  getBniAccountByNo,
  getBniTransfers,
  createBniTransfer,
}
