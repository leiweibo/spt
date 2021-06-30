<template>
  <div id="main">
    <div id="input">
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
    </div>
    <el-button type="primary" v-on:click="getData()">股票北向资金持仓</el-button>
    <div id="err">{{ errMsg }}</div>
    <!-- <el-space wrap>
      <div id="chars-box" style="width: 100%; height: 400px;">
      </div>
      <Layout :title='chartTitleStock'>
        <div id="chart-type-stock-k-line" class="k-line-chart"/>
      </Layout>
    </el-space> -->
    <div id="output">
      <div id="content" wrap>
        <div id="chars-box" style="width: 100%; height: 400px;">
        </div>
        <div id="chart-type-stock-k-line" style="width: 100%; height: 400px; margin-top: 50px"/>
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
import { dorequest } from '../utils/ftservice';
import { init } from 'klinecharts'

export default {
  name: "northFinance",
  data() {
    return {
      errMsg: "",
      market: 21,
      code: "601108",
      options: [
        {
          value: 1, //Qot_Common.QotMarket_HK_Security
          label: "HK",
        },
        {
          value: 11, //Qot_Common.QotMarket_US_Security
          label: "US",
        },
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
      chartTitleStock: ''
    };
  },
  methods: {
    getData: async function() {
      this.websocket = dorequest(this.$store, async (msg) => {
        console.log(`this.market: ${this.market}`)
        console.log(`this.code: ${this.code}`)
        console.log(`the msg: ${msg}`)

        const northholding = await aliyunGet(`/northholding/${this.code}`, {
          startDate: dateFormat(this.date[0]),
          endDate: dateFormat(this.date[1]),
        })
        const klineMap = new Map();
        const holdingMap = new Map();
        // const finalHoldingMap = new Map();

        const securityLineRaw = await this.fetchHistoryKline({"code": this.code, "market": this.market})
        this.setupKline(securityLineRaw, this.stKLineChart)
        northholding.data.rows.map((data) => {
          holdingMap.set(dayjs(data.trade_date).format('YYYYMMDD'), data.holding_amt);
        })

        // let preAmt = 0;
        // securityLineRaw.map((data) => {
        //   const date = dayjs(data.time).format('YYYYMMDD')
        //   if (!holdingMap.get(date)) {
        //     finalHoldingMap.set(date, preAmt);
        //   } else {
        //     finalHoldingMap.set(date, holdingMap.get(date))
        //     preAmt = holdingMap.get(date)
        //   }
        //   klineMap.set(date, data.closePrice * 3000000);
        // })

        const holdingData = Array.from(holdingMap.values());

        const klineData = Array.from(klineMap.values());

        console.log(`the legth of holdingData is ${holdingData.length}`)
        console.log(`the legth of klineData is ${klineData.length}`)

        this.myChart.setOption({  //动画的配置
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

        window.onresize = function() {
          //自适应大小
          this.myChart.resize();
        };
      }, 
      (msg) => {
        this.errMsg = msg
      });
    },

    fetchHistoryKline(security) {
      let beginTime = dateFormat(this.date[0]);
      // if (security.code.startsWith("BK")) {
      //   // 板块数据需要计算5日，或者15日涨跌幅，这里的数据多取一点。
      //   beginTime = dateFormat(dayjs(this.date[0]).subtract(30, "day"))
      // }
      return this.websocket
        .RequestHistoryKL({
          c2s: {
            rehabType: 1,
            klType: 2,
            security,
            beginTime: dateFormat(beginTime),
            endTime: dateFormat(this.date[1]),
          },
        })
        .then((res) => {
          return res.s2c.klList.map((item) => {
            return {
              ...item,
              volume: item.volume.low ? item.volume.low : item.volume,
              changeRate: `${item.changeRate.toFixed(2)} %`,
            };
          });
        })
        .catch((err) => {
          console.log("err:", err);
        });
    },

    setupKline(rawLine, kLineChart) {
      const plateLine = rawLine.map((item) => {
          return {
            close: item.closePrice,
            high: item.highPrice,
            low: item.lowPrice,
            open: item.openPrice,
            timestamp: item.timestamp * 1000,
            turnover: item.turnover,
            volume: item.volume,
            changeRate: item.changeRate
          };
        });
        console.log(`the plateLine is: ${plateLine}`)
        kLineChart.setStyleOptions({
          xAxis: {
            show: true,
            height: 30,
            axisLine: {
              show: true,
              color: '#888888',
              size: 1
            },
            tickText: {
              show: true,
              color: '#D9D9D9',
              family: 'Helvetica Neue',
              weight: 'normal',
              size: 12,
              paddingTop: 3,
              paddingBottom: 6
            },
            tickLine: {
              show: true,
              size: 1,
              length: 3,
              color: '#888888'
            }
          },
          candle: {
            bar: {
              upColor: '#EF5350',
              downColor: '#26A69A',
              noChangeColor: '#888888'
            },
            // 提示  
            tooltip: {
              // 'always' | 'follow_cross' | 'none'
              showRule: 'follow_cross',
              // 'standard' | 'rect'
              showType: 'rect',
              labels: ['时间', '开', '收', '高', '低', '成交量', '涨跌幅'],
              // 可以是数组，也可以是方法，如果是方法则需要返回一个数组
              // 数组和方法返回的数组格式为:
              // [xxx, xxx, ......]或者[{ color: '#fff', value: xxx }, { color: '#000', value: xxx }, .......]
              values: kLineData => {
                return [
                  {
                    value: kLineData['timestamp']
                  },
                  {
                    value: kLineData['open']
                  },
                  {
                    value: kLineData['close']
                  },
                  {
                    value: kLineData['high']
                  },
                  {
                    value: kLineData['low']
                  },
                  {
                    value: kLineData['volume']
                  },
                  {
                    value: kLineData['changeRate']
                  },
                ]
              },
              defaultValue: 'n/a',
              rect: {
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 6,
                offsetLeft: 8,
                offsetTop: 8,
                offsetRight: 8,
                borderRadius: 4,
                borderSize: 1,
                borderColor: '#e9ebef',
                fillColor: 'rgba(17, 17, 17, .3)'
              },
              text: {
                size: 12,
                family: 'Helvetica Neue',
                weight: 'normal',
                color: '#ffffff',
                marginLeft: 8,
                marginTop: 6,
                marginRight: 8,
                marginBottom: 0
              }
            }
          }
        })
        kLineChart.applyNewData(plateLine)
    }
  },

  mounted: function () {
    this.stKLineChart = init('chart-type-stock-k-line')
    this.myChart = echarts.init(document.getElementById("chars-box"), "dark");
  },

  setup() {
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
      let chart = echart.init(document.getElementById("chars-box"), "dark");
      // 把配置和数据放这里
      chart.setOption({
        xAxis: {
          type: "category",
        },
        tooltip: {
          trigger: "axis"
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            type: "line",
            smooth: true
          }
        ]
      });
      window.onresize = function() {
        //自适应大小
        chart.resize();
      };
    }

    return { initChart };
  }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .el-input {
    display: inline;
  }

  .el-range-editor {
    margin-left: 30px;
  }

  .el-button {
    margin-top: 30px;
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
    #content {
      padding: 30px;
      border: 1px solid #d8dfe6;
    }
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
