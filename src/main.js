import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import store from './store/store'
import installElementPlus from './plugins/element'

const app = createApp(App)
installElementPlus(app)
app.use(router).use(store).mount('#app')
