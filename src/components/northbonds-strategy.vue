<template>
  <div id="main">
    <div id="input">
      <el-form :inline=true>
        <el-form-item label="股票代码">
          <el-input id="code" v-model="code" placeholder="SH或者SZ开头"></el-input>
        </el-form-item>
        <el-form-item label="起始资金">
          <el-input id="initBalance" v-model="initBalance" placeholder="起始资金"></el-input>
        </el-form-item>
        <el-form-item label="每次购买金额比例">
          <el-input id="buyRatio" v-model="buyRatio" placeholder="格式为0.01, 表示10%"></el-input>
        </el-form-item>
        <el-form-item label="每次卖出比例">
          <el-input id="sellRatio" v-model="sellRatio" placeholder="格式为0.01, 表示10%"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit"
           v-loading.fullscreen.lock="fullscreenLoading">执行</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div id="err">{{ errMsg }}</div>
    
    <div id="output">
      <div id="content" wrap>
        <div :id="chart_box_id" style="width: 100%; height: 340px;">
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import "../../public/prism.css";
import * as echarts from "echarts";
import { onUnmounted, onMounted } from 'vue';
import dayjs from "dayjs";
import { aliyunGet } from "../service/http";

export default {
  name: "northbondStrategy",
  data() {
    return {
      chart_box_id: this.newDate(),
      errMsg: '',
      code: null, 
      initBalance: null,
      buyRatio: null,
      sellRatio: null,
      fullscreenLoading: false,
    }
  },
  methods: {
    newDate: function() {
      return dayjs().millisecond;
    },
    executeStrategy: async function() {
      const strategyResult = await aliyunGet(`/strategy/1`, { code: this.code, init: this.initBalance, buyRatio: this.buyRatio, sellRatio: this.sellRatio })
      this.fullscreenLoading = false;
      const profits = strategyResult.data.map((data) => data.profit);
      const initPrice = strategyResult.data[0].close;
      
      const prices = strategyResult.data.map((data) => {
        return ((data.close - initPrice)/initPrice).toFixed(3);
      });
      console.log(profits);
      console.log(prices);
      this.strategyResultChart.setOption({
        legend: {
          data: ['策略收益率', '指数收益率']
        },
        series: [
          {
            name: '策略收益率',
            type: 'line',
            data: profits
          },
          {
            name: '指数收益率',
            type: 'line',
            data: prices,
            yAxisIndex: 1,
          }
        ],
        tooltip: {
          trigger: "axis"
        },
        yAxis: [
          {
            name: "策略收益率",
            type: "value",
            min: -0.20,
            max: 0.3,
            splitNumber: 5,
            splitLine:{
              show:false
            }
          },
          {
            name: "指数收益率",
            type: "value",
            min: -0.20,
            max: 0.3,
            splitNumber: 5,
            splitLine:{
              show:false
            }
          },
          
        ],
        xAxis: [{
          data: strategyResult.data.map((data) => {
            return dayjs(data.date).format('YYYYMMDD')
          })
        }]
      })

    },
    onSubmit: async function() {
      this.fullscreenLoading = true;
      await this.executeStrategy(this.ccode, this.initBalance, this.buyRatio, this.sellRatio);
    },
  },

  mounted: function() {
    this.strategyResultChart = echarts.init(document.getElementById(this.chart_box_id));
  },

  setup() {
    /// 声明定义一下echart
    let echart = echarts;

    onMounted(() => {
      // initChart();
    });

    onUnmounted(() => {
      echart.dispose;
    });
	
  }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  #output {
    font-size: 14px;
    text-align: left;
    margin-top: 20px;
    width: 100%;
    
  }

</style>]
