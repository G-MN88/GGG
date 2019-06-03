<template>
  <div>
    <!-- 1.收获地址选择 -->
    <view @click="chooseAddress" class="address">
      <view v-if="address" class="address-info">
         <view class="address-info-name-phone">
          <view>
            <text style="font-size:12px;">收货人：{{address.userName}}</text>
          </view>
          <view style="display:flex;align-items: center;">
            <text style="margin-right:36rpx;font-size:12px;">{{address.telNumber}}</text>
            <view class="iconfont-tap icon-jiantouyou"></view>
          </view>
        </view>
        <view class="address-info-detail-info">
          <text style="font-size:12px;">收货地址：{{address.detailAddress}}</text>
        </view>
      </view>
      <view v-else class="address-add">
          <text style="font-size:12px;">+ 新增地址</text>
      </view>
      <view class="address-pic">
        <image src="/static/img/cart_border@2x.png" />
      </view>
    </view>
     <!-- 2.0 购买的商品列表 -->
    <view class="order-list">
      <block
        v-for="item in goodsList"
        :key="item.goods_id"
      >
        <view class="product-item">
          <navigator class="product-left">
            <image :src="item.goods_small_logo" />
          </navigator>
          <view class="product-right">
            <navigator class="product-name">
              {{item.goods_name}}
            </navigator>
            <view class="product-right-price">
              <text class="product-right-price-symbol">￥</text>
              <text class="product-right-price-integer">{{item.goods_price}}</text>
              <text class="product-right-price-decimal">.00</text>
            </view>
            <view class="product-right-num">x{{item.goods_number}}</view>
          </view>
        </view>
      </block>
    </view>
    <!-- 3.0 金额统计 -->
    <view class="order-total">
      <view class="order-total-item">
        <text>商品金额</text>
        <text class="order-total-item-price">￥{{totalAmount}}</text>
      </view>
      <view class="order-total-item">
        <text>运 费</text>
        <text class="order-total-item-price">￥+0.00</text>
      </view>
    </view>
    <block v-if="token">
        <view @click="goOrderAndPay" class="wxPay">微信支付</view>
      </block>
      <block v-else>
        <button @getuserinfo="wxLogin" open-type="getUserInfo" class="wxLogin">登录后下单支付</button>
      </block>
    
  </div>
</template>

<script>

// 按需导入getLocalGoods
import {getLocalGoods} from '../../common/card'
// 导入混入式地址
import ChooseAddress from "../../mixin/ChooseAddress"
export default {
  mixins:[ChooseAddress],
  data(){
    return {
      //地址
      address:null,
      goodsList:[], //商品列表
      totalAmount:0, //商品总金额
      token:null // 判断有没有token
    }
  },
  onLoad(options){
    // console.log(options);
    //判断有没有授权,授权就有本地地址
    if(wx.getStorageSync('address')){
      this.address = wx.getStorageSync('address')
    }
    //判断本地有没有token,有就直接获取token
    if(wx.getStorageSync('token')){
      //赋值给data里面的token
      this.token = wx.getStorageSync('token')
    }
    //获取页面传过来的ids
      const ids = options.ids
      //渲染页面函数
      this.getGoodsListData(ids)
  },
   methods:{
    // 选择收获地址【后续优化】
    // chooseAddress(){
    //   wx.chooseAddress({
    //     success: res => {
    //       // 动态增加一个属性 detailAddress
    //       res.detailAddress = `${res.provinceName}${res.cityName}${res.countyName}${res.detailInfo}`

    //       // 赋值给address
    //       this.address = res

    //       // 保存到本地
    //       wx.setStorageSync('address',this.address)
    //     },
    //     fail:({errMsg}) => {
    //       // 用户拒绝了
    //       if (errMsg === 'chooseAddress:fail auth deny'){
    //         wx.showModal({
    //           title: '提示', //提示的标题,
    //           content: '请去我的页面打开授权', //提示的内容,
    //           showCancel: false, //是否显示取消按钮
    //           confirmText: '确定', //确定按钮的文字，默认为取消，最多 4 个字符,
    //           confirmColor: '#ff2d4a', //确定按钮的文字颜色,
    //           success: res => {
    //             if (res.confirm) {
    //               wx.switchTab({ url: '/pages/main/main' })
    //             }
    //           }
    //         })
    //       }
    //     }
    //   });
    // },
    // 加载商品列表，渲染出来
    async getGoodsListData(ids){
      //预防第一次点结算totalAmount就有值了,第二次再点不清零就会叠加,所以每次渲染先清零,再计算当前的总额渲染
      this.totalAmount = 0
      const localGoods = getLocalGoods()

      const res = await this.$axios.get(`goods/goodslist?goods_ids=${ids}`)

      res.data.message.forEach(item=>{
        item.goods_number = localGoods[item.goods_id]
        this.totalAmount += item.goods_number * item.goods_price
      })

      this.goodsList = res.data.message
    },
    //登录
    wxLogin(e){
      console.log(e);//授权后里面有发请求需要的encryptedData/iv/rawData/signature
      //判断是否授权
      if(e.mp.detail.errMsg=="getUserInfo:fail auth deny") return
      //授权成功,可以获取个人信息
      //把个人信息保存到本地,方便后续调用
      wx.setStorageSync('userIfon',e.mp.detail.userInfo)
     
      wx.login({
        success: async callBack=>{
          console.log(callBack);
          //获取请求需要的参数.code....
          //发送post请求
          const res = await this.$axios.post('users/wxlogin',{
            code:callBack.code,
            encryptedData:e.mp.detail.encryptedData,
            iv:e.mp.detail.iv,
            rawData:e.mp.detail.rawData,
            signature:e.mp.detail.signature
          })
          console.log(res);
          //判断是否登录成功
          if(res.data.meta.status==200){
            //登录成功把token存到本地
            wx.setStorageSync('token', res.data.message.token)
            //赋值给data里面的token
            this.token = wx.getStorageSync('token')
          }

        }
      })
      
      // 获取完整用户信息密文
      // wx.getUserInfo({
      //   //是否带上登录态信息。当 withCredentials 为 true 时，
      //   // 要求此前有调用过 wx.login 且登录态尚未过期，此时返回的数据
      //   // 会包含 encryptedData, iv 等敏感信息；当 withCredentials 为 false 时，
      //   // 不要求有登录态，返回的数据不包含 encryptedData, iv 等敏感信息。
      //   withCredentials: true,
      //   success: res => {
      //     console.log(res);
      //   },
      //   fail: () => {},
      //   complete: () => {}
      // });
    },
    //下单和支付
      async goOrderAndPay(){
        if(!this.address){
          //提醒用户选择地址
          wx.showToast({
            title: '请选择收货地址', //提示的内容,
            image: '/static/img/error.png', //图标,
            duration: 2000, //延迟时间,
            mask: true, //显示透明蒙层，防止触摸穿透,
            success: res => {}
          });
          return
        }
        //需要的参数
        const params = {
          //总额
          order_price:this.totalAmount,
          //下单地址
          consignee_addr:this.address.detailAddress,
          //goods数组.用map遍历,返回需要的数组
          goods:this.goodsList.map(item=>{
            return {
              goods_id:item.goods_id,
              goods_number:item.goods_number,
              goods_price:item.goods_price
            }
          })
        }
        // console.log(params);
        //发请求
        const res = await this.$axios.post('my/orders/create',params)
        //这样直接打印数据会出现无效token,应该去请求头添加设置
        console.log(res);
      }
    
    
  }
  
}
</script>

<style scoped lang="less">
.address {
  height: 222rpx;
  background-color: #fff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  &-info {
    display: flex;
    height: 160rpx;
    flex: 1;
    flex-direction: column;
    justify-content: space-around;
    &-name-phone {
      display: flex;
      justify-content: space-between;
      padding: 0rpx 30rpx;
    }
    &-detail-info {
      padding: 0rpx 30rpx;
    }
  }
  &-add {
    width: 360rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    margin: 100px auto;
    color: #999;
    background-color: #f4f4f4;
  }
  &-pic {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 750rpx;
    height: 15rpx;
    image {
      width: 100%;
      height: 100%;
    }
  }
}
.iconfont-tap {
  font-family: 'iconfont' !important;
  font-size: 32rpx;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  min-width: 88rpx;
  min-height: 88rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.icon-jiantouyou {
  position: absolute;
  top: 32rpx;
  right: 0;
}
.icon-jiantouyou:before {
  font-size: 24rpx;
  color: #999;
  line-height: 1;
  width: 15rpx;
  height: 25rpx;
}
.order-list {
  background-color: #fff;
}
.product-item {
  display: flex;
  padding: 30rpx 20rpx;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    left: 20rpx;
    right: 0;
    bottom: 0;
    border-bottom: 1rpx solid #ddd;
  }
  .product-left {
    width: 200rpx;
    height: 200rpx;
    background-color: #eee;
    margin-right: 26rpx;
    image {
      width: 100%;
      height: 100%;
    }
  }
  .product-right {
    width: 480rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    .product-name {
      height: 84rpx;
      font-size: 30rpx;
      line-height: 1.4;
      /* 多行文字隐藏省略号 */
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    &-price {
      text {
        color: #ff2d4a;
      }
      &-symbol,
      &-decimal {
        font-size: 28rpx;
      }
      &-integer {
        font-size: 44rpx;
      }
    }
    &-num {
      position: absolute;
      right: 0;
      bottom: 0;
      letter-spacing: 2rpx;
      color: #999;
    }
  }
}
.order-total {
  background-color: #fff;
  margin-top: 20rpx;
  // height: 300rpx;
  &-item {
    height: 80rpx;
    display: flex;
    align-items: center;
    padding: 0rpx 30rpx;
    justify-content: space-between;
    &-price {
      color: #ff2d4a;
    }
  }
}
.wxLogin {
  margin-top: 10rpx;
  width: 720rpx;
}
.wxPay {
  margin-top: 10rpx;
  margin-left: 15rpx;
  width: 720rpx;
  background-color: #00c000;
  display: flex;
  height: 80rpx;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 32rpx;
  border-radius: 5rpx;
}
</style>

