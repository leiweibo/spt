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
    <el-button type="primary" v-on:click="onClick()">获取股票快照</el-button>
    <div id="err">{{ errMsg }}</div>
    <div id="output">
      <el-tag effect="dark">快照数据</el-tag>
      <div id="content">
        <pre><code class="language-js" v-html="get_message"></code></pre>
      </div>


    </div>
    <Layout title="图表类型">
      <div id="chart-type-k-line" class="k-line-chart"/>
    </Layout>
  </div>
</template>

<script>
import "../../public/prism.css";
import ftWebsocket from "futu-api";
import beautify from "js-beautify";
import prism from "prismjs";
import dayjs from "dayjs";
import { init } from 'klinecharts'
import generatedKLineDataList from './generatedKLineDataList'
import Layout from "./Layout"

export default {
  name: "getSecurityPlate",
  data() {
    return {
      errMsg: "",
      market: 1,
      code: "00700",
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
    };
  },
  created() {},
  mounted: function () {
    this.kLineChart = init('chart-type-k-line')
    const data = generatedKLineDataList()
    console.log(data)
    this.kLineChart.applyNewData(data)
  },
  unmounted() {},
  components: {Layout},
  methods: {
    onClick() {
      this.errMsg = "";
      let websocket = new ftWebsocket();
      console.log(`the start date: ${this.date[0]} and the end date: ${this.date[1]}`)
      //参数1指定监听地址
      //参数2指定Websocket服务端口
      //参数3指定是否启用SSL，如果需要启用则需要在FutuOpenD配置相关选项
      //参数4指定连接的密钥，否则会连接超时，密钥在在FutuOpenD可配置，UI版本在不指定的情况下会随机指定
      websocket.start(
        this.$store.state.addr,
        this.$store.state.port,
        this.$store.state.enable_ssl,
        this.$store.state.key
      );

      websocket.onlogin = (ret, msg) => {
        if (ret) {
          const req = {
            c2s: {
              securityList: [
                {
                  market: this.market,
                  code: this.code,
                },
              ],
            },
          };
          websocket
            .GetSecuritySnapshot(req)
            .then((res) => {
              let code = beautify(JSON.stringify(res), {
                indent_size: 2,
                space_in_empty_paren: true,
              });
              this.get_message = prism.highlight(
                code,
                prism.languages.javascript,
                "javascript"
              );
            })
            .catch((error) => {
              this.errMsg = "error: " + msg;
              console.log("error:", error);
            });

          //关闭行情连接，连接不再使用之后，要关闭，否则占用不必要资源
          //同时OpenD也限制了最多128条连接
          //也可以一个页面或者一个项目维护一条连接，这里范例请求一次创建一条连接
          websocket.stop();
        } else {
          this.errMsg = "error: 请检查是否有设置store.js中key字段";
          console.log("error:", msg);
        }
      };
    },
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