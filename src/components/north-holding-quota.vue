<template>
  <div id="main">
    <div id="input" v-show="!pd && si">
      <div id="stock">
        股票
        <el-select id="market" v-model="market">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <el-input id="code" v-model="code" placeholder="股票代码"></el-input>
      <el-date-picker
        v-model="date"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="margin-left: 30px;">
      </el-date-picker>

      <el-button id="submitBtn" type="primary" v-on:click="getData()">获取数据</el-button>
      <div id="err">{{ errMsg }}</div>
    </div>
    <div v-show="pd">
      <span class="demonstration">{{resultShowValue}}</span>
    </div>
    <div id="output">
        <div id="content" wrap>
          <div id="chars-box" style="width: 100%; height: 340px;">
          </div>
          <div id="chart-type-stock-k-line" style="width: 100%; height: 340px; margin-top: 30px"/>
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
import { dateFormat } from "../utils/format";
import { setupKlineCharts2 } from '../utils/kline'

export default {
  name: 'NorthHoldingQuota',
  props: [
    'passedData',
    'showInput'
  ],
  data() {
    return {
      errMsg: "",
      market: 21,
      code: "601108",
      options: [
        {
          value: 21, //Qot_Common.QotMarket_CNSH_Security
          label: "SH",
        },
        {
          value: 22, //Qot_Common.QotMarket_CNSZ_Security
          label: "SZ",
        },
      ],

      get_message: null,
      date: [
        dayjs().subtract(200, "day").format("YYYY-MM-DD"),
        dayjs().format("YYYY-MM-DD"),
      ],
      chartTitlePlate: '所属板块',
      chartTitleStock: '',
      klineDates: [],
      klineArray: [],
      resultShowValue: 'loading.....'
    };
  },
  methods: {
    getData: async function() {
      this.resultShowValue = 'loading......'
      const northholding = await aliyunGet(`/northholding/${this.code}`, {
        startDate: dateFormat(this.date[0]),
        endDate: dateFormat(this.date[1]),
      })
      const klineMap = new Map();
      const holdingMap = new Map();
      // const finalHoldingMap = new Map();

      // this.setupKline(securityLineRaw, this.stKLineChart)
      northholding.data.rows.map((data) => {
        holdingMap.set(dayjs(data.trade_date).format('YYYYMMDD'), data.holding_amt);
      })

      const holdingData = Array.from(holdingMap.values());

      const klineData = Array.from(klineMap.values());

      console.log(`the legth of holdingData is ${holdingData.length}`)
      console.log(`the legth of klineData is ${klineData.length}`)

      this.northHoldingChart.setOption({  //动画的配置
        series: [
        {
          smooth: true,
          type: 'line',
          data: holdingData
        }],
        tooltip: {
          trigger: "axis"
        },
        yAxis: {
          type: "value"
        },
        xAxis: [{
          data: northholding.data.rows.map((data) => {
            return dayjs(data.trade_date).format('YYYYMMDD')
          })
        }]
      })

      const klineResp = await setupKlineCharts2("", this.klineChart, {"code": this.code, "market": this.market}, this.date[0], this.date[1]);
      this.resultShowValue = klineResp.code
      console.log(this.resultShowValue);
      window.onresize = function() {
        //自适应大小
        this.northHoldingChart.resize();
        this.klineChart.resize();
      };
    },
  },

  mounted: function () {
    // this.stKLineChart = init('chart-type-stock-k-line')
    this.northHoldingChart = echarts.init(document.getElementById("chars-box"), "dark");
    this.klineChart = echarts.init(document.getElementById("chart-type-stock-k-line"), "dark");
    
  },

  setup(props) {
    /// 声明定义一下echart
    let echart = echarts;

    onMounted(() => {
      initChart();
    });

    onUnmounted(() => {
      echart.dispose;
    });
    // 基础配置一下Echarts
    function initChart() {
      console.log('initChart.')
      // if (props.passedData) {
      //   console.log(`${props.passedData.code}`);
      //   this.code = props.passedData.code
      //   this.market = props.passedData.market
      //   this.date0 = dateFormat(props.passedData.date0)
      //   this.data1 = dateFormat(props.passedData)
      //   this.getData();
      // }
      return props.passedData;
    }
    return { pd: initChart(), si: props.showInput };
  },

  created() {
    
    if (this.pd) {
      console.log(`-------------> ${this.pd.code}`);
      this.code = this.pd.code;
      this.market = this.pd.market;
      this.date[0] = dateFormat(this.pd.date0);
      this.date[1] = dateFormat(this.pd.date1);
      this.getData();
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .el-input {
    display: inline;
  }
  .el-range-editor {
    margin-left: 30px;
  }
  #submitBtn {
    margin-left: 30px;
  }
  :deep(#stock) {
    display: inline;
  }
  :deep(#market) {
    width: 70px;
    margin-left: 10px;
  }
  :deep(#code) {
    width: 100px;
    margin-left: 5px;
  }
  :deep(#err) {
    color: firebrick;
    margin-top: 15px;
  }
  #output {
    font-size: 14px;
    text-align: left;
    margin-top: 20px;
    width: 1080px;
    
  }
  .k-line-chart-container {
    display: flex;
    flex-direction: column;
    margin: 15px;
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .3);
    background-color: #FFFFFF;
    width: 620px;
    height: 440px;
    padding: 16px 6px 16px 16px;
  }
.k-line-chart {
  display: flex;
  flex: 1;
}
</style>
