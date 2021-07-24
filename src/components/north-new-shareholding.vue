<template>
  <div id="main">
    <div id="input">
      <el-date-picker
        v-model="date"
        type="month">
      </el-date-picker>

      <el-button id="submitBtn" type="primary" v-on:click="getData()">获取该月建仓/清仓数据</el-button>
    </div>
    <div id="err">{{ errMsg }}</div>
    <el-space wrap>
      <div id="output">
        <el-table
          :data="tableData"
          v-loading.fullscreen.lock="fullscreenLoading"
          border
          height="768"
          :row-class-name="tableRowClassName"
          style="width: 620px;"
          @row-click="onRowClicked">
          <el-table-column
            prop="securityCCassCode"
            label="CCASS Code"
            width="200" />
          <el-table-column
            prop="securityCode"
            label="Security Code"
            width="180">
          </el-table-column>
          <el-table-column
            prop="securityName"
            label="Security Name"
            width="180">
          </el-table-column>
          <el-table-column
            prop="securityMktShowValue"
            label="Market">
          </el-table-column>
        </el-table>
        <el-pagination
          layout="total"
          :total="totalCount" />
      </div>
      <div>
        <NorthHoldingQuota :showInput = "false" :type="1" :passedData="passedData"/>
      </div>
    </el-space>
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
  name: "northNewShareHolding",
  components: {NorthHoldingQuota},
  data() {
    return {
      errMsg: "",
      tableData: [],
      get_message: null,
      date: dayjs().subtract(1, 'month').format("YYYY-MM"),
      chartTitlePlate: '所属板块',
      chartTitleStock: '',
      klineDates: [],
      klineArray: [],
      fullscreenLoading: false,
      totalCount: 0,
      passedData: null,
      renderComponent: true
    };
  },
  methods: {
    getData: async function() {
      this.fullscreenLoading = true;
      this.renderComponent = false;
      this.passedData = {};
      this.$nextTick(() => {
        this.renderComponent = true
      })

      const getDiffDataResult = await aliyunGet(`/northreport/monthly/diff`, {
        d: this.date
      });

      this.totalCount = getDiffDataResult.count;
      const dataResult = getDiffDataResult.decreaseResult.concat(getDiffDataResult.increaseResult)
      this.tableData = dataResult.map((item) => {
        return {
          ...item, 
          securityMktShowValue: item.securityMkt === '22' ? '深市' : '沪市'
        }
      })
      this.fullscreenLoading = false;
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

  .el-range-editor {
    margin-left: 0px;
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

:deep(.el-table .warning-row) {
  background: oldlace;
}

:deep(.el-table .success-row) {
  background: #f0f9eb;
}
</style>]
