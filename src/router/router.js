import { createWebHistory, createRouter } from "vue-router";
import getSecuritySnapshotDemo from '../components/get-security-snapshot-demo'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
