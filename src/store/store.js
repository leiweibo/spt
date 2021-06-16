import { createStore } from 'vuex'

const store = createStore({
  state () {
    return {
      addr: "127.0.0.1",
      port: 33333,
      enable_ssl: false,
      key: "7ecd9e8bd711ed95",
    }
  }
})

export default store;
