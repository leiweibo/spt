<template>
  <div id="main">
    <div id="input">
      <el-form :inline=true>
        <el-form-item label="股票代码">
          <el-input id="code" v-model="code" placeholder="SH或者SZ开头"></el-input>
        </el-form-item>
        <el-form-item label="最近">
          <el-input id="nDays" v-model="ndays" placeholder="最近N天"></el-input>
          <span class="el-form-item__label" style="margin-left:5px;"> 天</span>
        </el-form-item>
        <el-form-item label="净流入">
          <el-input id="netBuy" v-model="netBuy" placeholder="净流入"></el-input>
          <span class="el-form-item__label" style="margin-left:5px;"> 亿</span>
        </el-form-item>
        <el-form-item label="净流出">
          <el-input id="netSell" v-model="netSell" placeholder="净流出"></el-input>
          <span class="el-form-item__label" style="margin-left:5px;"> 亿</span>
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
          <el-checkbox v-model="syncOperation">同步操作</el-checkbox>
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
      netBuy: null,
      netSell: null,
      ndays: null,
      initBalance: null,
      buyRatio: null,
      sellRatio: null,
      fullscreenLoading: false,
      syncOperation: false,
    }
  },
  methods: {
    newDate: function() {
      return dayjs().millisecond;
    },
    executeStrategy: async function() {
      const strategyResult = await aliyunGet(`/strategy/1`, { code: this.code, netBuy: this.netBuy, netSell: this.netSell, init: this.initBalance, ndays: this.ndays, buyRatio: this.buyRatio, sellRatio: this.sellRatio })
      this.fullscreenLoading = false;
      let initPrice = strategyResult.data[0].close;
      let initDate = strategyResult.data[0].date;
      let initPriceFetched = false;
      const profits = strategyResult.data.map((data) => {
        if (this.syncOperation &&  data.holdingAmount > 0 & !initPriceFetched) {
          initPriceFetched = true;
          initPrice = data.close
          initDate = data.date
        }
        return data.profit
      });
      
      console.log(`the init price: ${initPrice}, the init date is: ${initDate}`)
      const prices = strategyResult.data.map((data) => {
        if (dayjs(data.date) >= dayjs(initDate)) {
          return ((data.close - initPrice)/initPrice).toFixed(3);
        }
        return "0.000";
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
