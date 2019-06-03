import Vue from 'vue'
import axios from 'axios'
// 设置基地址
axios.defaults.baseURL = 'http://127.0.0.1:8899/api/public/v1/'
// 拦截器
axios.interceptors.request.use(function (config) {
  //设置请求头带上token
  if(wx.getStorageSync('token')){
    config.headers.Authorization = wx.getStorageSync('token')
  }
  return config
})

// 适配器
axios.defaults.adapter = function (config) {
  return new Promise((resolve, reject) => {
    //网络延迟,显示加载
    wx.showLoading({
      title: '加载中',
    })
    
    wx.request({
      url: config.url,
      data: config.data,
      method: config.method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // todo:
      header: config.headers, // 设置请求的 header
      success: res => {
        resolve(res)
        
      },
      fail: err => {
        // fail
        reject(err)
      },
      //数据请求完毕,隐藏加载
       complete(){
       wx.hideLoading()
    }
    })
    
  })
}
// 挂载到原型上
Vue.prototype.$axios = axios
