<template>
  <div id="main">
    <div id="input">
      <el-form inline=true>
        <el-form-item label="最近">
          <el-input id="days" v-model="days" placeholder="" />
        </el-form-item>
        <el-form-item label="持仓增幅 >=">
          <el-input id="increase" v-model="increase" placeholder="" />
        </el-form-item>

        <el-form-item label="持仓降幅 &lt;=">
          <el-input id="decrease" v-model="decrease" placeholder="" />
        </el-form-item>
      </el-form>
    </div>
    <div id="err">{{ errMsg }}</div>
      <el-row>
        <el-col :span="11">
          <div id="output">
            <el-table
              :data="tableData"
              v-loading.fullscreen.lock="fullscreenLoading"
              border
              height="768"
              :row-class-name="tableRowClassName"
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
            </el-table>
            <el-pagination
              layout="total"
              :total="totalCount" />
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
      this.passedData = null;
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
