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
    <el-button type="primary" v-on:click="getStockPlate()">获取股票所属板块</el-button>
    <div id="err">{{ errMsg }}</div>
    <div id="output">
      <el-tag effect="dark">K线图</el-tag>
      <div id="content" wrap>
        <el-space wrap>
          <Layout :title='chartTitlePlate'>
            <div id="chart-type-plate-k-line" class="k-line-chart"/>
          </Layout>

          <Layout :title='chartTitleStock'>
            <div id="chart-type-stock-k-line" class="k-line-chart"/>
          </Layout>
        </el-space>
      </div>


    </div>
  </div>
</template>

<script>
import "../../public/prism.css";
import dayjs from "dayjs";
import { init } from 'klinecharts'
import Layout from "./Layout"
import { dorequest } from '../utils/ftservice';
import { dateFormat } from "../utils/format";

export default {
  name: "getSecurityPlate",
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
  created() {},
  mounted: function () {
    this.kLineChart = init('chart-type-plate-k-line')
    this.stKLineChart = init('chart-type-stock-k-line')
  },
  unmounted() {},
  components: {Layout},
  methods: {
    getStockPlate() {
      this.errMsg = "";
      this.websocket = dorequest(this.$store, async (msg) => {
        console.log(`this.market: ${this.market}`)
        console.log(`this.code: ${this.code}`)
        const securityList = [{
          market: this.market,
          code: this.code,
        }];

        const plateInfo = await this.getSecurityPlate(securityList);
        const plate = plateInfo.s2c.ownerPlateList[0].plateInfoList[0].plate
        this.chartTitlePlate = `${plateInfo.s2c.ownerPlateList[0].plateInfoList[0].name}板块`;
        this.chartTitleStock = `${this.code}`
        console.log(plate)
        console.log(`------${msg}`)
        const plateLineRaw = await this.fetchHistoryKline(plate)
        this.setupKline(plateLineRaw, this.kLineChart)
        const securityLineRaw = await this.fetchHistoryKline({"code": this.code, "market": this.market})
        this.setupKline(securityLineRaw, this.stKLineChart)
      }, 
      (msg) => {
        this.errMsg = msg
      });
    },
    // 获取股票所属板块
    getSecurityPlate(securityList) {
      const response = this.websocket
        .GetOwnerPlate({
          c2s: {
            securityList: securityList,
          },
        })
      return response;
    },
    // 获取历史K线图
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
            console.log(item)
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
    // 
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
.k-line-chart-title {
  margin: 0;
  color: #252525;
  padding-bottom: 10px;
}
.k-line-chart {
  display: flex;
  flex: 1;
}
</style>