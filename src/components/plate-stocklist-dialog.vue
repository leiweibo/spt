
<template>
  <el-dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    width="50%"
    :before-close="handleClose">
    <span>
      <el-table
        :data="tableData"
        :cell-style="cellStyle"
        v-loading.lock="fullscreenLoading"
        border>
          <el-table-column
            prop="securityCode"
            label="代码">
          </el-table-column>
          <el-table-column
            prop="securityName"
            label="名称">
          </el-table-column>
          <el-table-column
            label="收盘价"
            prop="todayShowVlaue">
          </el-table-column>
          <el-table-column
            label="涨跌幅"
            prop="todayChangeRate">
          </el-table-column>
          <el-table-column
            label="过去5天"
            prop="kline5Growth">
          </el-table-column>
          <el-table-column
            label="过去15天"
            prop="kline15Growth">
          </el-table-column>
          <el-table-column
            label="过去30天"
            prop="kline30Growth">
          </el-table-column>
          <el-table-column
            label="过去60天"
            prop="kline60Growth">
          </el-table-column>
          <el-table-column
            label="过去90天"
            prop="kline90Growth">
          </el-table-column>
        </el-table>
        <el-pagination
          layout="total"
          :total="totalCount" />
    </span>
    <template #footer>
      <span class="dialog-footer">
        <!-- <el-button @click="dialogVisible = false">Cancel</el-button> -->
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
  import dayjs from 'dayjs';
  import { dateFormat } from "../utils/format";
  import { dorequest, getPlateSecurity, fetchHistoryKline } from '../utils/ftservice';
  export default {
    name: 'PlateStockListDialog',
    props: [
      'show',
      'title',
      'security'
    ],
    data() {
      return {
        dialogVisible: false,
        dialogTitle: '',
        tableData: [],
        fullscreenLoading: false,
        totalCount: 0,
      };
    },
    methods: {
      handleClose() {
        this.dialogVisible = false
      },

      getGrowth(kList, day) {
        const res = kList.length < day? "-" : (((kList[0].closePrice - kList[day - 1].closePrice)/kList[day - 1].closePrice)*100).toFixed(2) + "%"
        return res;
      },

      getStockListInfo: async function(security) {
        this.fullscreenLoading = true;
        const klineEndDate = dateFormat(dayjs())
        const klineStartDate = dateFormat(dayjs().subtract(5, 'month'))
        this.websocket = dorequest(this.$store, async (msg) => {
          console.log(msg)
          let plateStockList = await getPlateSecurity(this.websocket, security)
          plateStockList = plateStockList.slice(0, plateStockList.length >= 50 ? 50 : plateStockList.length)
          this.tableData = plateStockList.map(async (item) => {
            let klineRes = await fetchHistoryKline(this.websocket, item.basic.security, klineStartDate, klineEndDate)
            if (!klineRes) {
              console.log(`the security code is ${security}`)
            }
            klineRes = klineRes.reverse();
            const kline5Growth  = this.getGrowth(klineRes, 5)
            const kline15Growth = this.getGrowth(klineRes, 15)
            const kline30Growth = this.getGrowth(klineRes, 30);
            const kline60Growth = this.getGrowth(klineRes, 60);
            const kline90Growth = this.getGrowth(klineRes, 90);
            const result = {
              securityCode: item.basic.security.code,
              securityName: item.basic.name,
              todayShowVlaue: `${klineRes[0].closePrice}`,
              todayChangeRate: ` ${klineRes[0].changeRate}`,
              kline5Growth: kline5Growth,
              kline15Growth: kline15Growth,
              kline30Growth: kline30Growth,
              kline60Growth: kline60Growth,
              kline90Growth: kline90Growth,
            }
            this.tableData.push(result)
            return result;
          });

          this.totalCount = this.tableData.length
          this.fullscreenLoading = false;
          this.tableData = [];
        });
      },
      cellStyle({row, column, columnIndex }){
        if (columnIndex > 2) {
          if (row[column.property].indexOf('-') >= 0) {
            return 'color:green'
          } else {
            return 'color:red'
          }
        } else if (columnIndex == 2) {
            if (row.todayChangeRate.indexOf('-') >= 0) {
              return 'color:green'
            } else {
              return 'color:red'
            }
        } else {
          return ''
        }
      }
    },
    setup(props) {
      return { 
        dialogShow: props.show,
        passedTitle: props.title,
        passedSecurity: props.security,
      };
    },

    mounted: function () {
      this.dialogVisible = this.dialogShow;
      this.dialogTitle = this.passedTitle;
      this.getStockListInfo(this.passedSecurity);
    }
  };
</script>

<style>

</style>
