export default {
  methods:{
    // 选择收获地址【后续优化】
    chooseAddress(){
      wx.chooseAddress({
        success: res => {
          // 动态增加一个属性 detailAddress
          res.detailAddress = `${res.provinceName}${res.cityName}${res.countyName}${res.detailInfo}`

          // 赋值给address
          this.address = res

          // 保存到本地
          wx.setStorageSync('address',this.address)
        },
        fail:({errMsg}) => {
          // 用户拒绝了
          if (errMsg === 'chooseAddress:fail auth deny'){
            wx.showModal({
              title: '提示', //提示的标题,
              content: '请去我的页面打开授权', //提示的内容,
              showCancel: false, //是否显示取消按钮
              confirmText: '确定', //确定按钮的文字，默认为取消，最多 4 个字符,
              confirmColor: '#ff2d4a', //确定按钮的文字颜色,
              success: res => {
                if (res.confirm) {
                  wx.switchTab({ url: '/pages/mine/main' })
                }
              }
            })
          }
        }
      });
    }
  }
}