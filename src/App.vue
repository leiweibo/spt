<template>
  <div>
    <!-- <el-tabs v-model="active" @tab-click="onClick">
      <el-tab-pane label="获取股票快照" name="get-security-snapshot-demo">获取股票快照</el-tab-pane>
      <el-tab-pane label="所属板块" name="get-security-plate">获取所属板块</el-tab-pane>
      <el-tab-pane label="北向资金" name="north-finance">个股北向资金持仓和K线图</el-tab-pane>
      <el-tab-pane label="MACD策略" name="macd-strategy">MACD策略</el-tab-pane>
    </el-tabs> -->
    <el-menu
      :default-active="active"
      @select="handleSelect"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-submenu index="1">
        <template #title>北向资金</template>
        <el-menu-item index="north-new-shareholding">新增持仓</el-menu-item>
        <el-menu-item index="north-finance">北向资金个股</el-menu-item>
      </el-submenu>
      
      <el-submenu index="2">
        <template #title>股票信息查看</template>
        <el-menu-item index="get-security-snapshot-demo">股票快照</el-menu-item>
        <el-menu-item index="get-security-info">选股核心指标</el-menu-item>
        <el-menu-item index="2-3">item three</el-menu-item>
        <el-submenu index="2-4">
          <template #title disabled>待定2</template>
          <el-menu-item index="2-4-1">item one</el-menu-item>
          <el-menu-item index="2-4-2">item two</el-menu-item>
          <el-menu-item index="2-4-3">item three</el-menu-item>
        </el-submenu>
      </el-submenu>
      <el-menu-item index="3" disabled>待定3</el-menu-item>
      <el-menu-item index="4" disabled>待定4</el-menu-item>
    </el-menu>
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
      active: 'north-new-shareholding'
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
    handleSelect(key, keyPath) {
      console.log(`the key is ${key}, and keyPath: ${keyPath}`)
      const targetPath = key;
      this.$router.push({ path: "/" + targetPath })
      .catch(() => {});
      console.log(this.active);
    }
  },
  mounted() {
    // this.$nextTick(()=> {
    //   this.onClick('north-finance')
    // })
  }
})

</script>

<style rel="stylesheet/scss" lang="scss" scoped>
#app {
  // margin-left: 10px;
  // margin-right: 10px;
}

#main {
  margin: 8px;
  padding-top: 10px;
  font-family: "Microsoft Yahei";
  font-size: 16px;
}
</style>
