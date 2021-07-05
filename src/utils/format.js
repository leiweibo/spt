import dayjs from "dayjs";

export const dateFormat = (date) => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const dateFormat2 = (date) => {
  return dayjs(date).format("YYYYMMDD");
};

export const numberFormat = (value) => {
  if (!value) {
    return "-"
  }
  var param = {};
  var k = 10000, sizes = ['', '万', '亿', '万亿'], i;
  if(value < k){
      param.value =value
      param.unit=''
  } else{
      i = Math.floor(Math.log(value) / Math.log(k)); 

      param.value = ((value / Math.pow(k, i))).toFixed(2);
      param.unit = sizes[i];
  }
  return param.value + param.unit;
}