export default {
  data(){
    return {
      token:null, // 登录成功之后，返回的token的值
      code:null // 获取的登录的临时凭证
    }
  },
  onLoad(){
    mpvue.login({
      success: ({code}) => {
        this.code = code
      }
    })

    // 如果已经登录，则显示微信支付
    if (mpvue.getStorageSync('token')){
      this.token = mpvue.getStorageSync('token')
    }
  },
  methods: {
    // 登录
    async wxLogin(e,callback) {
      // 判断是否拒绝授权
      if (e.mp.detail.errMsg === 'getUserInfo:fail auth deny') return

      callback && callback()

      // 把获取到的用户信息保存起来，方便在我的页面中去使用
      mpvue.setStorageSync('userInfo', e.mp.detail.userInfo)

      // 进行微信登录
      const res = await this.$axios.post('users/wxlogin', {
        code: this.code,
        encryptedData: e.mp.detail.encryptedData,
        iv: e.mp.detail.iv,
        rawData: e.mp.detail.rawData,
        signature: e.mp.detail.signature
      })

      if (res.data.meta.status === 200) {
        // 给当前的模型赋值
        this.token = res.data.message.token
        // 把token保存起来，以方便后续使用
        mpvue.setStorageSync('token', res.data.message.token)
      }
    }
  }
}
