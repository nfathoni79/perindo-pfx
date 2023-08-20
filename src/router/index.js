import { createWebHistory, createRouter } from 'vue-router'
import Base from '../views/Base.vue'
import Home from '../views/Home.vue'
import Auction from '../views/Auction.vue'
import Login from '../views/Login.vue'
import Admin from '../views/Admin.vue'
import NotFound from '../views/NotFound.vue'

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
        path: '/auction',
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
    name: 'admin',
    component: Admin,
    beforeEnter: (to, from) => {
      if (localStorage.getItem('fishonToken') == null) {
        return { name: 'login' }
      }
    },
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
