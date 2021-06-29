<template>
  <div>
    <el-tabs v-model="active" @tab-click="onClick">
      <el-tab-pane label="获取股票快照" name="get-security-snapshot-demo">获取股票快照</el-tab-pane>
      <el-tab-pane label="所属板块" name="get-security-plate">获取所属板块</el-tab-pane>
      <el-tab-pane label="北向资金" name="north-finance">北向资金</el-tab-pane>
      <el-tab-pane label="MACD策略" name="macd-strategy">MACD策略</el-tab-pane>
    </el-tabs>
    <div id="main">
      <router-view />
    </div>
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
  data() {
    return {
      active: 'get-security-snapshot-demo'
    };
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
  },
  methods: {
    onClick(tab, event) {
      console.log('the tab is:' + tab)
      console.log('the event is:' + event)
      this.$router.push({ path: "/" + this.active })
      .catch(() => {});
      console.log(this.active);
    }
  },
  mounted() {
    this.$nextTick(()=> {
      this.onClick('get-security-snapshot-demo', null)
    })
  }
})

</script>

<style rel="stylesheet/scss" lang="scss" scoped>
#app {
  margin-left: 10px;
  margin-right: 10px;
}

#main {
  padding-top: 10px;
  font-family: "Microsoft Yahei";
  font-size: 16px;
}
</style>
