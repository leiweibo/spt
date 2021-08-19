<template>
  <div id="main">
    <div id="input">
      <el-form :inline=true>
        <el-form-item label="起始日期">
          <el-date-picker
            id="startdate"
            v-model="startdate"
            type="date">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="最近">
          <el-input id="days" v-model="days" placeholder="" />
          <span class="el-form-item__label" style="margin-left:5px;"> 天</span>
        </el-form-item>
        <el-form-item label="持仓增幅 >=">
          <el-input id="increase" v-model="increase" placeholder="" />
          <span class="el-form-item__label" style="margin-left:5px;"> %</span>
        </el-form-item>

        <el-form-item label="或                     持仓降幅 &lt;=">
          <el-input id="decrease" v-model="decrease" placeholder="" />
          <span class="el-form-item__label" style="margin-left:5px;"> %</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div id="err">{{ errMsg }}</div>
      <el-row>
        <el-col :span="16">
          <div id="output">
            <div style="margin-bottom:20px;">
              <span>{{showedDatatime}}</span>
            </div>
            <el-table
              :data="tableData.slice((currentPage - 1)*pageSize, currentPage * pageSize)"
              v-loading.fullscreen.lock="fullscreenLoading"
              border
              height="768"
              :empty-text="emptyText"
              :row-class-name="tableRowClassName"
              :cell-style="cellStyle"
              @row-click="onRowClicked">
              <el-table-column
                prop="securityCCassCode"
                width="80"
                label="CCASS"/>
              <el-table-column
                prop="securityCode"
                width="80"
                label="代码">
              </el-table-column>
              <el-table-column
                prop="securityName"
                label="名称">
              </el-table-column>
              <el-table-column
                prop="securityMkt"
                width="60"
                :formatter="securityMktFormatter"
                label="市场">
              </el-table-column>
              <el-table-column
                prop="holdingAmt"
                label="最新持仓">
              </el-table-column>

              <el-table-column
                prop="closePrice"
                :cell-style="cellStyle"
                label="最新股价">
              </el-table-column>

               <el-table-column
                prop="priceChangeRatio"
                :formatter="priceFormatter"
                :cell-style="cellStyle"
                label='股价变化'>
              </el-table-column>

              <el-table-column
                prop="preTradeDate"
                label='N天日期'
                :formatter="dateFormatter">
              </el-table-column>

              <el-table-column
                prop="preClosePrice"
                label='N天前股价'>
              </el-table-column>
              <el-table-column
                prop="preHoldingAmt"
                label='N天前持仓'>
              </el-table-column>

              <el-table-column
                prop="changeVal"
                sortable
                label='持仓变化'>
              </el-table-column>

              <el-table-column
                prop="changeRatio"
                sortable
                :formatter="formatter"
                label='持仓变化率'>
              </el-table-column>
            </el-table>
            <el-pagination
              :hide-on-single-page="value"
              :total="totalCount"
              :page-size="pageSize"
              @current-change="currentPageChange"
              @next-click="clickNext"
              layout="prev, next" />
          </div>
        </el-col>

        <el-col class="line" :span="1"></el-col>

        <el-col :span="7">
          <div>
            <NorthHoldingQuota :showInput = "false" :type="1" :passedData="passedData"/>
          </div>
        </el-col>
      </el-row>
      
      
  </div>
</template>
<script>
import "../../public/prism.css";
import * as echarts from "echarts";
import { onUnmounted, onMounted } from 'vue';
import dayjs from "dayjs";
import { aliyunGet } from "../service/http";
import NorthHoldingQuota from "./north-holding-quota"

export default {
  name: "northfinanceExplore",
  components: {NorthHoldingQuota},
  data() {
    return {
      days: "",
      increase: "",
      decrease: "",
      value: false,

      // reserve
      errMsg: "",
      tableData: [],
      date: dayjs().subtract(1, 'month').format("YYYY-MM"),
      startdate: null,
      klineDates: [],
      klineArray: [],
      fullscreenLoading: false,
      totalCount: 0,
      passedData: null,
      pageSize: 13,
      currentPage: 1,
      ccode: '',
      emptyText: 'No Data',
      loading: 'Loading',
      showedDatatime: null,
      colorProperties: ['changeVal', 'changeRatio', 'priceChangeRatio', 'closePrice']
    };
  },
  methods: {
    setupData: async function(ccode, page) {
      this.emptyText = 'Loading...'
      const sktPerformanceDta = await aliyunGet(`/explore/getStkPerformance`, {
        startdate: dayjs(this.startdate).format('YYYY-MM-DD'),
        duration: this.days,
        inc: (this.increase / 100).toFixed(2),
        dec: (this.decrease / 100).toFixed(2),
        ccasscode: ccode,
        ps: this.pageSize,
      });
      this.fullscreenLoading = false;
      if (page === 1) {
        this.tableData = [];
        this.currentPage = 1;
      }
      console.log(sktPerformanceDta);
      // this.totalCount = getDiffDataResult.count;
      const dataResult = sktPerformanceDta.data.finalResult;
      const klineArray = sktPerformanceDta.data.klines;
      this.showedDatatime = `最新数据: ${dayjs(dataResult[dataResult.length - 1].trade_date).format('YYYY-MM-DD')}`
      
      this.tableData = this.tableData.concat(dataResult.map((item) => {
        console.log(`------!!!!-------${dayjs(item.trade_date).format('YYYY-MM-DD')}`)
        const klines = klineArray.find((k) => k.code === item.security_code)
        const kline = klines.kline.find((k) => k.time === dayjs(item.trade_date).format('YYYY-MM-DD'))
        const result = {
          securityCCassCode: item.security_ccass_code,
          securityCode: item.security_code,
          securityName: item.security_name,
          securityMkt: item.security_mkt,
          holdingAmt: item.holding_amt,
          preTradeDate: item.targetDays.prev_trade_date,
          preHoldingAmt: item.targetDays.prev_holding_amt,
          changeVal: item.targetDays.offsetVal,
          changeRatio: item.targetDays.changeRatio,
          preClosePrice: klines.kline[0].closePrice,
          priceChangeRatio: (((kline.closePrice - klines.kline[0].closePrice)/klines.kline[0].closePrice) * 100).toFixed(2),
          closePrice: `${kline.closePrice}(${kline.changeRate.toFixed(2)}%)`,
        }
        return result;
      }));
      this.emptyText = this.tableData.length == 0 ? 'No Data.' : 'Loading...';
      
      this.totalCount = (page - 1) * this.pageSize + dataResult.length;
      if (dataResult.length === this.pageSize) {
        this.totalCount = this.totalCount + 1;
      }
      this.currentPage = page;
      console.log(`totalCount--> ${this.totalCount}, ${this.currentPage}`)
    },
    onSubmit: async function() {
      this.fullscreenLoading = true;
      this.passedData = {};
      this.ccode = '';
      await this.setupData(this.ccode, 1);
    },
    clickNext(value) {
      console.log(`--1111---> ${value}, ${this.tableData.slice(-1)[0].securityCCassCode}`)
      if (value * this.pageSize <= this.tableData.length) {
        this.currentPage = value;
      } else {
        this.ccode = this.tableData.slice(-1)[0].securityCCassCode
        this.setupData(this.ccode, value)
      }
    },
    currentPageChange(value) {
      this.currentPage = value;
    },
    onRowClicked(row) {
      // 北向资金数据从12-01开始，所以这个地方传的日期为固定
      const d0 = dayjs('2020-12-01')
      const d1 = dayjs().format('YYYY-MM-DD')
      this.passedData = {
        ccasscode: row.securityCCassCode,
        code: row.securityCode,
        market: row.securityMkt,
        date0: d0,
        date1: d1
      }
    },
    tableRowClassName({row}) {
      if (row.securityCode === '') {
        return 'warning-row';
      }
      return '';
    },
    formatter(row) {
      return `${(row.changeRatio * 100).toFixed(0)}%`
    },
    dateFormatter(row) {
      return dayjs(row['preTradeDate']).format('YYYY-MM-DD');
    },
    securityMktFormatter(row) {
       return row['securityMkt'] === '22' ? '深市' : '沪市'
    },
    priceFormatter(row) {
      return `${row.priceChangeRatio}%`
    },
    cellStyle({row, column}){
      if (this.colorProperties.includes(column.property )) {
        if (row[column.property].toString().indexOf('-') >= 0) {
          return 'color:green';
        } else if (row[column.property].toString().indexOf('-') < 0) {
          return 'color:red';
        }
      }
      
      return '';
    }
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
  .el-input {
    display: inline;
  }

  :deep(.inputfields) {
    margin-bottom: 20px;
  }

  :deep(#days) {
    width: 100px;
    margin-left: 5px;
  }
  :deep(#increase) {
    width: 100px;
    margin-left: 5px;
  }

  :deep(#decrease) {
    width: 100px;
    margin-left: 5px;
  }

</style>]
