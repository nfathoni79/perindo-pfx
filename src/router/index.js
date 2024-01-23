import { createWebHistory, createRouter } from 'vue-router'
import Base from '../views/Base.vue'
import Home from '../views/Home.vue'
import Auction from '../views/Auction.vue'
import Login from '../views/Login.vue'
import BaseAdmin from '../views/BaseAdmin.vue'
import AuctionAdmin from '../views/AuctionAdmin.vue'
import ApprovalAdmin from '../views/ApprovalAdmin.vue'
import FishAdmin from '../views/FishAdmin.vue'
import PendingAuctionsAdmin from '../views/PendingAuctionsAdmin.vue'
import NotFound from '../views/NotFound.vue'

import FishonService from '../services/FishonService'

/**
 * Check if user is logged in or not before entering a route.
 * @param {*} to - Target route.
 * @param {*} from - Current route.
 * @param {*} next - Function to pass the next route.
 */
const checkIfAuthed = async (to, from, next) => {
  if (localStorage.getItem('fishonToken') == null) {
    next({ name: 'login' })
    return
  }

  try {
    await FishonService.getCurrentUser()
    next()
  } catch (error) {
    next({ name: 'login' })
  }
}

const routes = [
  {
    path: '/',
    name: 'base',
    component: Base,
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
      },
      {
        path: 'auction',
        name: 'auction',
        component: Auction,
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/admin',
    name: 'admin-base',
    component: BaseAdmin,
    beforeEnter: checkIfAuthed,
    children: [
      {
        path: '',
        name: 'admin-auction',
        component: AuctionAdmin,
      },
      {
        path: 'approval',
        name: 'admin-approval',
        component: ApprovalAdmin,
      },
      {
        path: 'fish',
        name: 'admin-fish',
        component: FishAdmin,
      },
      {
        path: 'pending-auctions',
        name: 'admin-pending-auctions',
        component: PendingAuctionsAdmin,
      }
    ],
  },
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
