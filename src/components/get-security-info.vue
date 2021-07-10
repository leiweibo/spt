<template>
  <div id="main">
    <div id="input">
      <div id="stock">
        股票
        <el-select id="market" v-model="market" ref="mkt">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <el-input id="code" v-model="code" placeholder="股票代码"></el-input>
      <el-button type="primary" style="margin-left: 30px;" v-on:click="getKeyIndex()">获取股票关键指标</el-button>
    </div>
    <span id="err">{{ errMsg }}</span>
    <div id="output">
      <el-tag effect="dark">{{ reportDate }}</el-tag>
      <div id="content">
        <el-row>
          <el-col :span="11">
            <el-descriptions title="核心指标" border>
              <el-descriptions-item label="总市值">{{ totalMktValue }}</el-descriptions-item>
              <el-descriptions-item label="资产负债率"> {{ debtRatio }}</el-descriptions-item>
              <el-descriptions-item label="质押比例">{{ pledgeRatio }}</el-descriptions-item>
              <el-descriptions-item label="商誉/净资产">{{ goodWillRatio }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col class="line" :span="2"></el-col>
          <el-col :span="11">
            <el-descriptions title="资产负债相关" border>
            <el-descriptions-item label="短期借款">{{ shortLoan }}</el-descriptions-item>
            <el-descriptions-item label="长期借款">{{ longLoan }}</el-descriptions-item>
            <el-descriptions-item label="应付债券">{{ boundPayable }}</el-descriptions-item>

            <el-descriptions-item label="货币资金">{{ cash }}</el-descriptions-item>
            <el-descriptions-item label="应收账款"> 待获取 </el-descriptions-item>
            <el-descriptions-item label="预付款项"> 待获取 </el-descriptions-item>
            <el-descriptions-item label="净利润">{{ netProfit }}</el-descriptions-item>
          </el-descriptions>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <div id="kline-chars-box" style="width: 100%; height: 340px;" />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <div id="roe-chart" style="width: 100%; height: 340px; margin-top: 30px"/>
          </el-col>
          <el-col class="line" :span="2"></el-col>
          <el-col :span="11">
            <div id="netprofit-chart" style="width: 100%; height: 340px; margin-top: 30px"/>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <div id="operation-cash-chart" style="width: 100%; height: 340px; margin-top: 30px"/>
          </el-col>

          <el-col class="line" :span="2"></el-col>
          <el-col :span="11">
            <div id="netgrossprofit-chart" style="width: 100%; height: 340px; margin-top: 30px"/>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import "../../public/prism.css";
import { aliyunGet } from "../service/http";
import { numberFormat } from "../utils/format";
import * as echarts from "echarts";
import { dorequest, calculateMA, fetchHistoryKline } from '../utils/ftservice';
import dayjs from "dayjs";

export default {
  name: "getSecurityInfo",
  data() {
    return {
      errMsg: "",
      market: 21,
      code: "601318",
      options: [
        // {
        //   value: 1, //Qot_Common.QotMarket_HK_Security
        //   label: "HK",
        // },
        // {
        //   value: 11, //Qot_Common.QotMarket_US_Security
        //   label: "US",
        // },
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
      totalMktValue: '--',
      debtRatio: '--',
      pledgeRatio: '--',
      goodWillRatio: '--',
      cash: '--',
      netProfit: '--',
      reportDate: '数据日期',
      shortLoan: '--',
      longLoan: '--',
      boundPayable: '---'
    };
  },
  created() {},
  mounted() {
    this.roeChart = echarts.init(document.getElementById("roe-chart"))
    this.netProfitChart = echarts.init(document.getElementById("netprofit-chart"))
    this.operationCashChart = echarts.init(document.getElementById("operation-cash-chart"))
    this.netGrossProfitChart = echarts.init(document.getElementById("netgrossprofit-chart"))
    this.klineChart = echarts.init(document.getElementById("kline-chars-box"))
  },
  unmounted() {},
  methods: {
    getKeyIndex: async function() {
      const securityCode = `${this.$refs.mkt.selectedLabel}${this.code}`
      const stkInfoResp = await aliyunGet(`/stockinfo/important`, {
        code: securityCode
      });
      const stkInfoData = stkInfoResp.data
      this.totalMktValue = numberFormat(stkInfoData.totalMktValue)
      this.debtRatio = (stkInfoData.finalComposedData[0].debtRatio * 100).toFixed(2) + " %"
      this.pledgeRatio = stkInfoData.pledgeRatio + "%"
      this.goodWillRatio = (stkInfoData.finalComposedData[0].goodWillRatio * 100).toFixed(2) + " %"
      this.cash = numberFormat(stkInfoData.finalComposedData[0].cash)
      this.netProfit = numberFormat(stkInfoData.finalComposedData[0].netProfit)
      this.reportDate = stkInfoData.securityName + " " + stkInfoData.finalComposedData[0].reportDate;
      this.shortLoan = numberFormat(stkInfoData.finalComposedData[0].shortLoan);
      this.longLoan = numberFormat(stkInfoData.finalComposedData[0].longLoan);
      this.boundPayable = numberFormat(stkInfoData.finalComposedData[0].boundPayable);

      this.websocket = dorequest(this.$store, async (msg) => {
        console.log(`this.market: ${this.market}`)
        console.log(`this.code: ${this.code}`)
        console.log(`the msg: ${msg}`)
        console.log(`${this.d}`)

        const klineMap = new Map();

        const klineData = Array.from(klineMap.values());

        console.log(`the legth of klineData is ${klineData.length}`)

        const currentDate = dayjs();
        const startDate = currentDate.subtract(5, "year");
        
        
        const securityLineRaw = await fetchHistoryKline(this.websocket, 
              {"code": this.code, "market": this.market}, 
              startDate.set('month', 0).set('date', 1).format('YYYY-MM-DD'), 
              currentDate.format('YYYY-MM-DD'))
        this.resultShowValue = this.code;
        this.klineArray = []
        this.klineDates = []
        securityLineRaw.map((data) => {
          this.klineDates.push(dayjs(data.time).format("YYYY/MM/DD"));
          this.klineArray.push([data.openPrice, data.closePrice, data.lowPrice, data.highPrice])
        })
        this.klineChart.setOption({
          title: {
            text: '过去5年日K',
            left: 'left',
            align: 'right'
          },
          legend: {
              data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
              inactiveColor: '#777',
          },
          tooltip: {
              trigger: 'axis',
              axisPointer: {
                  animation: false,
                  type: 'cross',
                  lineStyle: {
                      color: '#376df4',
                      width: 2,
                      opacity: 1
                  }
              }
          },
          xAxis: {
              type: 'category',
              data: this.klineDates,
              axisLine: { lineStyle: { color: '#8392A5' } }
          },
          yAxis: {
              scale: true,
              axisLine: { lineStyle: { color: '#8392A5' } },
              splitLine: { show: false }
          },
          grid: {
              bottom: 80
          },
          dataZoom: [{
              textStyle: {
                  color: '#8392A5'
              },
              handleIcon: 'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
              dataBackground: {
                  areaStyle: {
                      color: '#8392A5'
                  },
                  lineStyle: {
                      opacity: 0.8,
                      color: '#8392A5'
                  }
              },
              brushSelect: true
          }, {
              type: 'inside'
          }],
          series: [
              {
                type: 'candlestick',
                name: '日K',
                data: this.klineArray,
                itemStyle: {
                    color: '#FD1050',
                    color0: '#0CF49B',
                    borderColor: '#FD1050',
                    borderColor0: '#0CF49B'
                }
              },
              {
                name: 'MA5',
                type: 'line',
                data: calculateMA(5, this.klineArray),
                smooth: true,
                showSymbol: false,
                lineStyle: {
                    width: 1
                }
              },
              {
                name: 'MA10',
                type: 'line',
                data: calculateMA(10, this.klineArray),
                smooth: true,
                showSymbol: false,
                lineStyle: {
                    width: 1
                }
              },
              {
                name: 'MA20',
                type: 'line',
                data: calculateMA(20, this.klineArray),
                smooth: true,
                showSymbol: false,
                lineStyle: {
                    width: 1
                }
              },
              {
                name: 'MA30',
                type: 'line',
                data: calculateMA(30, this.klineArray),
                smooth: true,
                showSymbol: false,
                lineStyle: {
                    width: 1
                }
              }
          ]
        })
      }, 
      (msg) => {
        this.errMsg = msg
      });

      this.roeChart.setOption({  //动画的配置
          title: {
            text: 'ROE',
            left: 'center',
            align: 'right'
          },
          series: [
          {
            smooth: true,
            type: 'bar',
            barWidth: '20%',
            data: stkInfoData.keyIndexData.map((d) => d.roe.toFixed(2)).reverse()
          }],
          tooltip: {
            trigger: "axis"
          },
          yAxis: {
            type: "value"
          },
          xAxis: [{
            data: stkInfoData.keyIndexData.map((data) => {
              return data.reportDate
            }).reverse()
          }]
        });

        this.netProfitChart.setOption({
          title: {
            text: '净利润',
            left: 'center',
            align: 'right'
          },
          series: [
          {
            smooth: true,
            type: 'bar',
            barWidth: '20%',
            data: stkInfoData.keyIndexData.map((d) => d.netProfit.toFixed(2)).reverse()
          }],
          tooltip: {
            trigger: "axis"
          },
          yAxis: {
            type: "value"
          },
          xAxis: [{
            data: stkInfoData.keyIndexData.map((data) => {
              return data.reportDate
            }).reverse()
          }]
        })
        this.operationCashChart.setOption({
          title: {
            text: '经营现金流',
            left: 'center',
            align: 'right'
          },
          series: [
          {
            smooth: true,
            type: 'bar',
            barWidth: '20%',
            data: stkInfoData.operationCashFlowData.map((d) => d.netCashflow).reverse()
          }],
          tooltip: {
            trigger: "axis"
          },
          yAxis: {
            type: "value"
          },
          xAxis: [{
            data: stkInfoData.operationCashFlowData.map((data) => {
              return data.reportDate
            }).reverse()
          }]
        })
        this.netGrossProfitChart.setOption({
          title: {
            text: '毛利率',
            left: 'center',
            align: 'right'
          },
          series: [
          {
            smooth: true,
            type: 'bar',
            barWidth: '20%',
            data: stkInfoData.keyIndexData.map((d) => d.grossProfit).reverse()
          }],
          tooltip: {
            trigger: "axis"
          },
          yAxis: {
            type: "value"
          },
          xAxis: [{
            data: stkInfoData.keyIndexData.map((data) => {
              return data.reportDate
            }).reverse()
          }]
        })
        window.onresize = function() {
          this.roeChart.resize();
          this.netProfitChart.resize();
          this.operationCashChart.resize();
          this.stockPriceChart.resize();
        };
    },

  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.el-input {
  display: inline;
}

.el-button {
  margin-top: 20px;
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
  margin-left: 15px;
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
</style>