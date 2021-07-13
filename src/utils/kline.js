import { calculateMA, fetchHistoryKline } from './ftservice';
import dayjs from "dayjs";
import { aliyunGet } from '../service/http';

const setup = async function(security, securityLineRaw, title, klineChart, titleClickFunc) {
  const klineArray = []
  const klineDates = []
  securityLineRaw.map((data) => {
    klineDates.push(dayjs(data.time).format("YYYY/MM/DD"));
    klineArray.push([data.openPrice, data.closePrice, data.lowPrice, data.highPrice])
  })
  klineChart.setOption({
  title: {
    text: title,
    left: 'left',
    align: 'right',
    triggerEvent: titleClickFunc != null? true : false,
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
      data: klineDates,
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
        data: klineArray,
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
        data: calculateMA(5, klineArray),
        smooth: true,
        showSymbol: false,
        lineStyle: {
            width: 1
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: calculateMA(10, klineArray),
        smooth: true,
        showSymbol: false,
        lineStyle: {
            width: 1
        }
      },
      {
        name: 'MA20',
        type: 'line',
        data: calculateMA(20, klineArray),
        smooth: true,
        showSymbol: false,
        lineStyle: {
            width: 1
        }
      },
      {
        name: 'MA30',
        type: 'line',
        data: calculateMA(30, klineArray),
        smooth: true,
        showSymbol: false,
        lineStyle: {
            width: 1
        }
      }
    ]
  })
  if (titleClickFunc) {
    klineChart.on('click', params => {
        if (params.componentType === 'title') {
            titleClickFunc(security)
        }
    })
  }
  return security.code;
}


const setupKlineCharts = async function(websocket, title, klineChart, security, startDate, endDate, titleClickFunc) {
    const securityLineRaw = await fetchHistoryKline(websocket, security, startDate, endDate)
    return setup(security, securityLineRaw, title, klineChart, titleClickFunc)
}

const setupKlineCharts2 = async function(title, klineChart, security, startDate, endDate, titleClickFunc) {
    const securityLineRaw = await aliyunGet('/hq/kline', {
        "code": (security.market == 21? 1 : 0)+ "." + security.code,
        'startdate': startDate,
        'enddate': endDate
    })
    console.log(securityLineRaw);
    return setup(security, securityLineRaw.data.rows, title, klineChart, titleClickFunc)
}

export { setupKlineCharts, setupKlineCharts2 };