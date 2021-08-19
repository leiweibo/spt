<template>
  <div id="main">
    <div id="input">
      <el-form :inline=true>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">执行</el-button>
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
    }
  },
  methods: {
    newDate: function() {
      return dayjs().millisecond;
    },
    executeStrategy: async function() {
      const strategyResult = await aliyunGet(`/strategy/1`)
      const profits = strategyResult.data.map((data) => data.profit);
      const initPrice = strategyResult.data[0].close;
      const prices = strategyResult.data.map((data) => {
        return ((data.close - initPrice)/initPrice).toFixed(3);
      });
      this.strategyResultChart.setOption({
        legend: {
          data: ['收益率', '价格(SH510500)']
        },
        series: [
          {
            name: '收益率',
            type: 'line',
            data: profits
          },
          {
            name: '收益率(SH510500)',
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
            name: "收益率",
            type: "value",
            splitLine:{
                 show:false
             }
          },
          {
            name: "收益率(SH510500)",
            type: "value",
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
      this.passedData = {};
      this.ccode = '';
      await this.executeStrategy(this.ccode, 1);
    },
  },

  mounted: function() {
    this.strategyResultChart = echarts.init(document.getElementById(this.chart_box_id), "dark");
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
