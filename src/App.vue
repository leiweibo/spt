<template>
  <div>
    <img src="./assets/logo.png">
    <p>
      If Element Plus is successfully added to this project, you'll see an
      <code v-text="'<el-button>'"></code>
      below
    </p>
    <el-button type="primary">el-button</el-button>
    <el-input v-model="input" placeholder="请输入内容"></el-input>
    <el-input-number v-model="numInput" @change="handleChange" :min="1" :max="10" label="描述文字"></el-input-number>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import { defineComponent, ref } from 'vue'

export default defineComponent ({
  name: 'App',
  components: {
    // HelloWorld
  },
  setup() {
    const numInput = ref(1);
    const handleChange = (value) => {
      console.log(value);
    };

    return {
      input: ref(''),
      numInput,
      handleChange,
    }
  }
})

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
