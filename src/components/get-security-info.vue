<template>
  <div id="main">
    <PlateStockListDialog  v-if="renderComponent" :show="dialogShow" :title="dialogTitle" :security="security"/>
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
      <el-button type="primary" 
        style="margin-left: 30px;"
        v-loading.fullscreen.lock="fullscreenLoading"
        v-on:click="getKeyIndex()">获取股票关键指标</el-button>
    </div>
    <span id="err">{{ errMsg }}</span>
    <div id="output">
      <el-tag effect="dark">{{ reportDate }}</el-tag>
      <div id="content">
        <el-row>
          <el-col :span="11">
            <el-descriptions title="核心指标" border>
              <el-descriptions-item label="总市值">{{ totalMktValue }}</el-descriptions-item>
              <el-descriptions-item label="资产负债率"> {{ debtRatio }}  ({{ debtRatioRank||'-'}})</el-descriptions-item>
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
          <el-col>
            <div :id="kline_chars_box" style="width: 100%; height: 540px; margin-top: 30px;" />
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <div :id="northholding_charts_box" style="width: 100%; height: 540px; margin-top: 30px;" />
          </el-col>
        </el-row>
        <el-row>
           <el-col>
            <div :id="plate_kline_chars_box" style="width: 100%; height: 540px; margin-top: 30px;" />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <div :id="roe_chart" style="width: 100%; height: 340px; margin-top: 30px"/>
          </el-col>
          <el-col class="line" :span="2"></el-col>
          <el-col :span="6">
            <div :id="netprofit_chart" style="width: 100%; height: 340px; margin-top: 30px"/>
          </el-col>
          <el-col class="line" :span="2"></el-col>
          <el-col :span="6">
            <div :id="total_asset_chart" style="width: 100%; height: 340px; margin-top: 30px"/>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="6">
            <div :id="operation_cash_chart" style="width: 100%; height: 340px; margin-top: 30px"/>
          </el-col>

          <el-col class="line" :span="2"></el-col>
          <el-col :span="6">
            <div :id="divided_chart" style="width: 100%; height: 340px; margin-top: 30px"/>
          </el-col>
          <el-col class="line" :span="2"></el-col>
          <el-col :span="6">
            <div :id="netgrossprofit_chart" style="width: 100%; height: 340px; margin-top: 30px"/>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="line" :span="2"></el-col>
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
import { dorequest, getOwnerPlate } from '../utils/ftservice';
import dayjs from "dayjs";
import { setupKlineCharts, setupKlineCharts3 } from '../utils/kline'
import PlateStockListDialog from './plate-stocklist-dialog'

export default {
  name: "getSecurityInfo",
  components: {PlateStockListDialog},
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
      debtRatioRank: null,
      pledgeRatio: '--',
      goodWillRatio: '--',
      cash: '--',
      netProfit: '--',
      reportDate: '数据日期',
      shortLoan: '--',
      longLoan: '--',
      boundPayable: '---',
      dialogShow: false,
      renderComponent: false,
      dialogTitle: '',
      fullscreenLoading: false,
      roe_chart: this.newDate() + 1,
      netprofit_chart: this.newDate() + 2,
      operation_cash_chart: this.newDate() + 3,
      netgrossprofit_chart: this.newDate() + 4,
      kline_chars_box: this.newDate() + 5,
      plate_kline_chars_box: this.newDate() + 6,
      divided_chart: this.newDate() + 7,
      total_asset_chart: this.newDate() + 8,
      northholding_charts_box: this.newDate() + 9,
    };
  },
  created() {},
  mounted() {
    this.roeChart = echarts.init(document.getElementById(this.roe_chart))
    this.netProfitChart = echarts.init(document.getElementById(this.netprofit_chart))
    this.operationCashChart = echarts.init(document.getElementById(this.operation_cash_chart))
    this.netGrossProfitChart = echarts.init(document.getElementById(this.netgrossprofit_chart))
    this.klineChart = echarts.init(document.getElementById(this.kline_chars_box))
    this.plateKlineChart = echarts.init(document.getElementById(this.plate_kline_chars_box))
    this.dividedChart = echarts.init(document.getElementById(this.divided_chart))
    this.totalAssetChart = echarts.init(document.getElementById(this.total_asset_chart))
    this.northHoldingChart = echarts.init(document.getElementById(this.northholding_charts_box))
  },
  unmounted() {},
  methods: {
    newDate: function() {
      return dayjs().millisecond;
    },
    getKeyIndex: async function() {
      this.fullscreenLoading = true;
      const securityCode = `${this.$refs.mkt.selectedLabel}${this.code}`
      const stkIndustryRankRes = await aliyunGet(`/industryrank/${this.code}`)
      this.debtRatioRank = stkIndustryRankRes.debtRatioRank
      const stkInfoResp = await aliyunGet(`/stockinfo/important`, {
        code: securityCode
      });
      this.fullscreenLoading = false;
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

      const currentDate = dayjs();
      const startDateYears = currentDate.subtract(5, "year");


      const northholding = await aliyunGet(`/northholding/${this.code}`, {
        startDate: '2020-12-01',
        endDate: currentDate.format('YYYY-MM-DD'),
        type: '0',
      })

      const holdingMap = new Map();
      // this.setupKline(securityLineRaw, this.stKLineChart)
      northholding.data.rows.map((data) => {
        holdingMap.set(dayjs(data.trade_date).format('YYYYMMDD'), data.holding_amt);
      })

      const holdingData = Array.from(holdingMap.values());


      this.northHoldingChart.setOption({  //动画的配置
        title: {
          text: '北上资金持仓历史',
          left: 'left',
          align: 'right',
        },
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
      
      const startDate = startDateYears.set('month', 0).set('date', 1).format('YYYY-MM-DD')
      const endDate = currentDate.format('YYYY-MM-DD')
      
      const bonusData = await setupKlineCharts3("过去5年K线", this.klineChart, {"code": this.code, "market": this.market}, startDate, endDate)
      console.log(`the data1 is------> ${bonusData.bonusRatioData}`)
      console.log(`the data2 is------> ${bonusData.dates}`)
      this.dividedChart.setOption({
        title: {
          text: '股息分红(每10股)',
          left: 'center',
          align: 'right'
        },
        series: [
        {
          smooth: true,
          type: 'line',
          barWidth: '20%',
          data: bonusData.bonusRatioData,
        }],
        tooltip: {
          trigger: "axis"
        },
        yAxis: {
          type: "value"
        },
        xAxis: [{
          data: bonusData.dates,
        }]
      })

      this.websocket = dorequest(this.$store, async (msg) => {
        console.log(`the msg: ${msg}`)

        

        const ownerPlates = await getOwnerPlate(this.websocket, {"code": this.code, "market": this.market})
        const plate = ownerPlates.s2c.ownerPlateList[0].plateInfoList[0].plate;
        setupKlineCharts(this.websocket, `${ownerPlates.s2c.ownerPlateList[0].plateInfoList[0].name} 板块走势`, this.plateKlineChart, plate, startDate, endDate, (security) => {
          this.renderComponent = false;
          this.dialogShow = true;
          this.dialogTitle = `${ownerPlates.s2c.ownerPlateList[0].plateInfoList[0].name}板块股票情况(按照涨跌幅排序，最多显示50条)`
          this.security = security
          this.$nextTick(() => {
            this.renderComponent = true
          })
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
            left: 'left',
            align: 'right'
          },
          legend: {
            data: ['净利润', '净利润增长率%']
          },
          series: [
            { 
              name: '净利润',
              smooth: true,
              type: 'bar',
              barWidth: '20%',
              data: stkInfoData.keyIndexData.map((d) => d.netProfit.toFixed(2)).reverse()
            },
            {
              name: '净利润增长率%',
              type: 'line',
              yAxisIndex: 1,
              data: stkInfoData.keyIndexData.map((d) => d.netProfiltRatio).reverse()
            },
          ],
          tooltip: {
            trigger: "axis"
          },
          grid: {
            show: false,
          },
          yAxis: [
            {
              name: "净利润",
              type: "value"
            },
            {
              name: "净利润增长率%",
              type: "value",
            }
          ],
          xAxis: [{
            data: stkInfoData.keyIndexData.map((data) => {
              return data.reportDate
            }).reverse()
          }]
        })
        this.totalAssetChart.setOption({
          title: {
            text: '总资产',
            left: 'center',
            align: 'right'
          },
          series: [
          {
            smooth: true,
            type: 'bar',
            barWidth: '20%',
            data: stkInfoData.finalComposedData.map((d) => d.totalAsset).reverse()
          }],
          tooltip: {
            trigger: "axis"
          },
          yAxis: {
            type: "value"
          },
          xAxis: [{
            data: stkInfoData.finalComposedData.map((data) => {
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
          this.plateKlineChart?.resize();
          this.klineChart?.resize();
          this.roeChart?.resize();
          this.netProfitChart?.resize();
          this.operationCashChart?.resize();
          this.stockPriceChart?.resize();
          this.dividedChart?.resize();
          this.totalAssetChart?.resize();
          this.northHoldingChart?.resize();
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