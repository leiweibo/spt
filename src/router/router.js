import { createWebHistory, createRouter } from "vue-router";
import getSecuritySnapshotDemo from '../components/get-security-snapshot-demo'
import getSecurityPlate from '../components/get-security-plate'
import northFinance from '../components/north-finance'
import northNewShareHolding from '../components/north-new-shareholding'

const routes = [
  {
    path: '/',
    name: 'index',
    component: northNewShareHolding
  },
  {
    path: '/get-security-snapshot-demo',
    name: 'getSecuritySnapshotDemo',
    component: getSecuritySnapshotDemo
  },
  {
    path: '/get-security-plate',
    name: 'getSecurityPlate',
    component: getSecurityPlate
  },
  {
    path: '/north-finance',
    name: 'northFinance',
    component: northFinance
  },
  {
    path: '/north-new-shareholding',
    name: 'northNewShareHold',
    component: northNewShareHolding
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
