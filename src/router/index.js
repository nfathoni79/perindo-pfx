import { createWebHistory, createRouter } from 'vue-router'
import Base from '../views/Base.vue'
import Home from '../views/Home.vue'
import Auction from '../views/Auction.vue'
import Login from '../views/Login.vue'
import BaseAdmin from '../views/BaseAdmin.vue'
import AuctionAdmin from '../views/AuctionAdmin.vue'
import ApprovalAdmin from '../views/ApprovalAdmin.vue'
import NotFound from '../views/NotFound.vue'

import FishonService from '../services/FishonService'

/**
 * Check if current user is logged in.
 */
const isUserLoggedIn = async () => {
  if (localStorage.getItem('fishonToken') == null) {
    return false
  }

  try {
    await FishonService.getCurrentUser()
    return true
  } catch (error) {
    return false
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
    beforeEnter: async (to, from, next) => {
      if (await isUserLoggedIn()) {
        next()
      } else {
        next({ name: 'login' })
      }
    },
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
