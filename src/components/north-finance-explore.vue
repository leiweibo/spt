<template>
  <div id="main">
    <div id="input">
      <el-form :inline=true>
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
        <el-col :span="11">
          <div id="output">
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
                label="CCASS Code"/>
              <el-table-column
                prop="securityCode"
                label="Security Code">
              </el-table-column>
              <el-table-column
                prop="securityName"
                label="Security Name">
              </el-table-column>
              <el-table-column
                prop="securityMktShowValue"
                label="Market">
              </el-table-column>
              <el-table-column
                prop="holdingAmt"
                label="最新持仓">
              </el-table-column>

              <el-table-column
                prop="preHoldingAmt"
                label='N天前持仓'>
              </el-table-column>

              <el-table-column
                prop="changeVal"
                label='持仓变化'>
              </el-table-column>

              <el-table-column
                prop="changeRatio"
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

        <el-col class="line" :span="2"></el-col>

        <el-col :span="11">
          <div>
            <NorthHoldingQuota v-if="renderComponent" :showInput = "false" :type="1" :passedData="passedData"/>
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
      klineDates: [],
      klineArray: [],
      fullscreenLoading: false,
      totalCount: 0,
      passedData: null,
      renderComponent: true,
      pageSize: 20,
      currentPage: 1,
      ccode: '',
      emptyText: 'No Data',
      loading: 'Loading',
      colorProperties: ['changeVal', 'changeRatio']
    };
  },
  methods: {
    setupData: async function(ccode, page) {
      this.emptyText = 'Loading...'
      const sktPerformanceDta = await aliyunGet(`/explore/getStkPerformance`, {
        duration: this.days,
        inc: (this.increase / 100).toFixed(2),
        dec: (this.decrease / 100).toFixed(2),
        ccasscode: ccode,
        ps: this.pageSize,
      });
      if (page === 1) {
        this.tableData = [];
        this.currentPage = 1;
      }
      console.log(sktPerformanceDta);
      // this.totalCount = getDiffDataResult.count;
      const dataResult = sktPerformanceDta.data.finalResult;
      
      this.tableData = this.tableData.concat(dataResult.map((item) => {
        return {
          securityCCassCode: item.security_ccass_code,
          securityCode: '',
          securityName: item.security_name,
          securityMktShowValue: item.security_mkt === '22' ? '深市' : '沪市',
          holdingAmt: item.holding_amt,
          preHoldingAmt: item.targetDays.prev_holding_amt,
          changeVal: item.targetDays.offsetVal,
          changeRatio: `${(item.targetDays.changeRatio * 100).toFixed(0)}%`,
        }
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
      this.renderComponent = false;
      this.passedData = null;
      this.$nextTick(() => {
        this.renderComponent = true
      })
      this.ccode = '';
      await this.setupData(this.ccode, 1);
      this.fullscreenLoading = false;
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
      console.log(`the dateeeeeee is :${this.date}`)
      const d0 = dayjs(this.date).set('date', 1).format('YYYY-MM-DD')
      const d1 = dayjs().format('YYYY-MM-DD')
      console.log(`the dateeeeeee is :${this.date}, ${d0}, ${d1}`)
      this.renderComponent = false;
      this.passedData = {
        ccasscode: row.securityCCassCode,
        code: row.securityCode,
        market: row.securityMkt,
        date0: d0,
        date1: d1
      },
      this.$nextTick(() => {
        this.renderComponent = true
      })
    },
    tableRowClassName({row}) {
      if (row.securityCode === '') {
        return 'warning-row';
      }
      return '';
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
      // if (columnIndex >= 2) {
      //   
      //   if (row[column.property].indexOf('-') >= 0) {
      //     return 'color:green'
      //   } else {
      //     return 'color:red'
      //   }
      // } 
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
