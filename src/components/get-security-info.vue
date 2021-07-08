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
    </div>
    <el-button type="primary" v-on:click="getKeyIndex()">获取股票关键指标</el-button>
    <span id="err">{{ errMsg }}</span>
    <div id="output">
      <el-tag effect="dark">{{ reportDate }}</el-tag>
      <div id="content">
        <el-descriptions title="核心指标" border>
          <el-descriptions-item label="总市值">{{ totalMktValue }}</el-descriptions-item>
          <el-descriptions-item label="资产负债率"> {{ debtRatio }}</el-descriptions-item>
          <el-descriptions-item label="质押比例">{{ pledgeRatio }}</el-descriptions-item>
          <el-descriptions-item label="商誉/净资产">{{ goodWillRatio }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="资产负债相关" border style="margin-top: 30px;">
          <el-descriptions-item label="短期借款">{{ shortLoan }}</el-descriptions-item>
          <el-descriptions-item label="长期借款">{{ longLoan }}</el-descriptions-item>
          <el-descriptions-item label="应付债券">{{ boundPayable }}</el-descriptions-item>

          <el-descriptions-item label="货币资金">{{ cash }}</el-descriptions-item>
          <el-descriptions-item label="应收账款"> 待获取 </el-descriptions-item>
          <el-descriptions-item label="预付款项"> 待获取 </el-descriptions-item>
          <el-descriptions-item label="净利润">{{ netProfit }}</el-descriptions-item>
        </el-descriptions>

        <div id="roe-chart" style="width: 100%; height: 340px; margin-top: 30px"/>
      </div>
    </div>
  </div>
</template>

<script>
import "../../public/prism.css";
import { aliyunGet } from "../service/http";
import { numberFormat } from "../utils/format";
import * as echarts from "echarts";
// import beautify from "js-beautify";
// import prism from "prismjs";
// import { dorequest } from '../utils/ftservice';

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
      this.reportDate = stkInfoData.finalComposedData[0].reportDate;
      this.shortLoan = numberFormat(stkInfoData.finalComposedData[0].shortLoan);
      this.longLoan = numberFormat(stkInfoData.finalComposedData[0].longLoan);
      this.boundPayable = numberFormat(stkInfoData.finalComposedData[0].boundPayable);

      this.roeChart.setOption({  //动画的配置
          title: {
            text: 'ROE变化表',
            left: 'center',
            align: 'right'
          },
          series: [
          {
            smooth: true,
            type: 'bar',
            barWidth: '60%',
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

        window.onresize = function() {
          this.roeChart.resize();
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