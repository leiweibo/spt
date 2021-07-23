import axios from 'axios';

let baseURL = "http://push2.eastmoney.com/api"
let aliyunBaseURL = "http://47.95.230.67:3000/api/"
// let aliyunBaseURL = "http://localhost:3000/api/"

const eastmoneyAxios = axios.create({
  baseURL,
})

const aliyunAxios = axios.create({
  baseURL: aliyunBaseURL
})

export const get = (url, params) => {
  params = params || {};
  return new Promise((resolve, reject) => {
    eastmoneyAxios.get(url, {
      params,
    }).then((res => {
      if (res.data.rc == 0) {
        resolve(res.data)
      } else {
        reject(res)
        alert(`获取${url}数据失败，请稍后重试`)
      }
    })).catch(error => {
      console.log(error);
    })
  })
}

export const post = (url,params)=>{
  params = params || {};
  return new Promise((resolve, reject)=>{
    eastmoneyAxios.post(url,params).then(res=>{
          if(res.data.code===0){
              resolve(res.data);
          }else{
            reject(res)
              alert(`Post${url}请求失败，请稍后重试`);
          }
      }).catch(error=>{
          console.log(error);
      })
  })
}

export const aliyunGet = (url, params) => {
  params = params || {};
  return new Promise((resolve, reject) => {
    aliyunAxios.get(url, {
      params,
    }).then((res => {
      console.log(res);
      if (res.data) {
        resolve(res.data)
      } else {
        reject(res)
        alert(`获取${url}数据失败，请稍后重试`)
      }
    })).catch(error => {
      console.log(error);
    })
  })
}
