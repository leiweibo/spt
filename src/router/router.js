import { createWebHistory, createRouter } from "vue-router";
import getSecuritySnapshotDemo from '../components/get-security-snapshot-demo'
import getSecurityPlate from '../components/get-security-plate'
import northFinance from '../components/north-finance'

const routes = [
  {
    path: '/',
    name: 'getSecuritySnapshotDemo',
    component: getSecuritySnapshotDemo
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
