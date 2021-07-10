import ftWebsocket from "futu-api";
import { dateFormat } from "../utils/format";

const websocket = new ftWebsocket();

const dorequest = (store, dologinsuc, dologinfail)=> {
  websocket.start(
    store.state.addr,
    store.state.port,
    store.state.enable_ssl,
    store.state.key
  );

  websocket.onlogin = (ret, msg) => {
    if (ret) {
      dologinsuc(msg)
    } else {
      dologinfail("error: 请检查是否有设置store.js中key字段")
      console.log("error:", msg);
    }
  }
  
  return websocket
};

const fetchHistoryKline = function(websocket, security, beginDate, endDate) {
  // if (security.code.startsWith("BK")) {
  //   // 板块数据需要计算5日，或者15日涨跌幅，这里的数据多取一点。
  //   beginTime = dateFormat(dayjs(this.date[0]).subtract(30, "day"))
  // }
  return websocket
    .RequestHistoryKL({
      c2s: {
        rehabType: 1,
        klType: 2,
        security,
        beginTime: dateFormat(beginDate),
        endTime: dateFormat(endDate),
      },
    })
    .then((res) => {
      return res.s2c.klList.map((item) => {
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
};

const calculateMA = function(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data[i - j][1];
        }
        result.push((sum / dayCount).toFixed(2));
    }
    return result;
}

export {dorequest, calculateMA, fetchHistoryKline};
