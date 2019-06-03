<template>
  <div>
    <!-- 1. 轮播图 -->
    <swiper v-if="goods_detail" indicator-dots autoplay circular indicator-active-color="#fff">
      <block v-for="item in goods_detail.pics" :key="item.pics_id">
        <swiper-item>
          <img @click="preview(item.pics_mid)" mode="aspectFill" :src="item.pics_mid">
        </swiper-item>
      </block>
    </swiper>
    <!-- 2.0 商品的基本信息 -->
    <view v-if="goods_detail" class="product-info">
      <view class="product-head">
        <text class="price">￥{{goods_detail.goods_price}}</text>
      </view>
      <view class="product-body">
        <view class="product-name">{{goods_detail.goods_name}}</view>
        <view class="product-like">
          <view class="iconfont icon-shoucang"></view>
          <view>
            <text>收藏</text>
          </view>
        </view>
      </view>
      <view class="product-foot">
        <text>快递：免运费</text>
      </view>
    </view>
    <!-- 3.0 促销信息 -->
    <view class="part">
      <view class="part-item part-line">
        <text class="note">促销</text>
        <text class="color-main description">满300减30元</text>
      </view>
      <view class="part-item">
        <text class="note">已选</text>
        <text class="description">黑色/S/1件</text>
      </view>
    </view>
    <!-- 4.0 收获地址 -->
    <view class="part" @click="chooseAddress">
      <view class="part-item">
        <text class="note">送至</text>
        <view v-if="address">
          <!-- 授权保存后的地址 -->
          {{address.provinceName}} {{address.cityName}} {{address.countyName}}
        </view>
        <view v-else>
          <text>请选择收货地址</text>
        </view>
        <view style="float:right;" class="iconfont icon-jiantouyou"></view>
      </view>
    </view>
    <!-- 5.0 tabs栏目的展示 -->
    <view class="tabs">
      <view class="tabs-head">
        <view
          @click="tabSelect(index)"
          :class="[currentTabIndex===index ? 'active':'','tabs-item']"
          v-for="(item,index) in tabs"
          :key="index"
        >
          <text>{{item}}</text>
        </view>
      </view>
      <view class="tabs-body">
        <!-- 图文介绍 -->
        <view v-show="currentTabIndex === 0">
          <div v-html="goods_detail.goods_introduce"></div>
        </view>
        <view v-show="currentTabIndex === 1">
          <view v-for="(item,index) in goods_detail.attrs" :key="item .attr_id" class="param-item">
            <text
              :class="['note',index === goods_detail.attrs.length-1?'param-item-last':'']"
            >{{item.attr_name}}</text>
            <text
              :class="['description',index === goods_detail.attrs.length-1?'param-item-last':'']"
            >{{item.attr_vals}}</text>
          </view>
        </view>
      </view>
      <!-- 6.0 底部菜单条 -->
      <view class="fixed-bar">
        <view class="item">
          <button class="contact-btn" open-type="contact"></button>
          <view class="iconfont icon-kefu"></view>
          <text class="note">联系客服</text>
        </view>
        <view @click="goToShopCart" class="item">
          <view class="iconfont icon-gouwuche"></view>
          <text class="note">购物车</text>
        </view>
        <view class="btn-group">
          <view @click="addToShopCart" class="btn yellow-btn">加入购物车</view>
          <view class="btn red-btn">立即购买</view>
        </view>
      </view>
    </view>
  </div>
</template>

<script>
//按需导入
import {addGoods} from "../../common/card"
//导入选择地址
import chooseAddress from "../../mixin/ChooseAddress"
export default {
  mixins: [chooseAddress],
  data() {
    return {
      goods_detail: {}, // 轮播图数据
      address: null, // 地址
      tabs: ['商品详情', '规格参数'],
      currentTabIndex: 0
    }
  },
  onLoad(options) {
    // console.log('sa',options)
    //轮播图
    this.getDetailSlide(options.goods_id)

    // 去本地取我们的地址信息，如果有，则赋值给address
    if (wx.getStorageSync('address')) {
      this.address = wx.getStorageSync('address')
    }
  },
  methods: {
    //轮播图请求
    async getDetailSlide(goods_id) {
      const res = await this.$axios.get(`goods/detail?goods_id=${goods_id}`)
      // console.log(res.data)
      this.goods_detail = res.data.message
    },
    //图片预览
    preview(pics_mid) {
      wx.previewImage({
        current: pics_mid, // 当前显示图片的http链接
        urls: this.goods_detail.pics.map(item => item.pics_mid) // 需要预览的图片http链接列表
      })
    },
    // 选择收获地址
    
    // chooseAddress() {
    //   wx.chooseAddress({
    //     // 当用户授权同意，并且选择了一个收获地址
    //     success: res => {
    //       // 额外再增加一个属性
    //       res.detailAddress = `${res.provinceName}${res.cityName}${
    //         res.countyName
    //       }${res.detailInfo}`

    //       // 更新视图
    //       this.address = res

    //       // 保存到本地
    //       wx.setStorageSync('address', res)
    //     },
    //     fail: err => {
    //       console.log(err)
    //       if (err.errMsg == 'chooseAddress:fail auth deny') {
    //         wx.showModal({
    //           title: '提示', //提示的标题,
    //           content: '请去我的页面打开授权', //提示的内容,
    //           showCancel: false, //是否显示取消按钮,
    //           cancelText: '取消', //取消按钮的文字，默认为取消，最多 4 个字符,
    //           cancelColor: '#000000', //取消按钮的文字颜色,
    //           confirmText: '确定', //确定按钮的文字，默认为取消，最多 4 个字符,
    //           confirmColor: '#ff2d4a', //确定按钮的文字颜色,
    //           success: res => {
    //             if (res.confirm) {
    //               console.log('用户点击确定')
    //               //去我的页面
    //               wx.switchTab({ url: '/pages/mine/main' })
    //             } else if (res.cancel) {
    //               console.log('用户点击取消')
    //             }
    //           }
    //         })
    //       }
    //     }
    //   })
    // },
    //tab切换
    tabSelect(index) {
      this.currentTabIndex = index
    },
    //点击购物车
    goToShopCart(){
        //跳转到购物车页面
        wx.switchTab({
            url: '/pages/shopcart/main',
            
        })
        
    },
    //加入购物车
    addToShopCart(){
      wx.showToast({
          title: '加入购物车成功', //提示的内容,
          icon: 'success', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
          success: res => {

          }
        });
        addGoods({
          goods_id:this.goods_detail.goods_id,
          goods_number:1
        })
    }
  }
}
</script>

<style lang="less">
swiper {
  width: 750rpx;
  height: 400rpx;
  img {
    width: 750rpx;
    height: 400rpx;
  }
}
.product-info {
  display: flex;
  flex-direction: column;
  height: 300rpx;
  background-color: #fff;
  padding: 0 16rpx;
}

.product-head {
  height: 38rpx;
  padding: 40rpx 0;
}

.product-head .price {
  color: #ff2d4a;
  font-size: 50rpx;
  // margin-left: 10rpx;
}

.product-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-body .product-name {
  font-size: 34rpx;
  width: 546rpx;
  height: 88rpx;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-body .product-like {
  width: 50rpx;
  height: 78rpx;
  border-left: 1rpx solid #ddd;
  padding-left: 46rpx;
  margin-right: 30rpx;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.product-foot {
  font-size: 30rpx;
  color: #999;
  margin-top: 34rpx;
}

.part {
  background-color: #fff;
  margin: 20rpx 0;
  font-size: 32rpx;
  color: #999;
  &-line:after {
    content: '';
    height: 1rpx;
    width: 734rpx;
    background-color: #ddd;
    display: block;
    position: absolute;
    bottom: -1rpx;
  }
  &-item {
    display: flex;
    padding: 28rpx 16rpx;
    position: relative;
    align-items: center;
    // justify-content: space-between;
  }
}
.part .note {
  color: #333;
  margin-right: 40rpx;
}

.part .description {
  width: 490rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
}
.part .color-main {
  color: #ff2d4a;
}

.tabs {
  &-head {
    height: 100rpx;
    background-color: #fff;
    display: flex;
    .active {
      color: #ff2d4a;
      font-weight: 400;
      &:after {
        content: '';
        height: 12rpx;
        width: 100%;
        background-color: #ff2d4a;
        position: absolute;
        left: 0;
        bottom: 0;
      }
    }
  }
  &-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    position: relative;
  }
  &-body {
    background-color: #fff;
    padding: 16rpx;
    margin-bottom: 100rpx;
  }
}
.param-item {
  display: flex;
  height: 100rpx;
  line-height: 100rpx;
  border-top: 1px solid rgba(92, 92, 92, 0.3);
  border-right: 1px solid rgba(92, 92, 92, 0.3);
  border-left: 1px solid rgba(92, 92, 92, 0.3);
}
.param-item .note {
  padding-left: 30rpx;
  width: 300rpx;
  border-right: 1px solid rgba(92, 92, 92, 0.3);
}

.param-item-last {
  border-bottom: 1px solid rgba(92, 92, 92, 0.3);
}

.param-item .description {
  padding-left: 30rpx;
  width: 400rpx;
}
.fixed-bar {
  width: 750rpx;
  height: 98rpx;
  background-color: #fff;
  position: fixed;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .btn-group {
    display: flex;
  }
  .btn {
    width: 213rpx;
    height: 98rpx;
    line-height: 98rpx;
    text-align: center;
    font-size: 30rpx;
    color: #fff;
  }
  .yellow-btn {
    background-color: #ffb400;
  }
  .red-btn {
    background-color: #ff2d4a;
  }
  .item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    .contact-btn {
      opacity: 0;
      position: absolute;
      width: 100%;
      height: 100%;
    }
    .iconfont {
      width: 40rpx;
      height: 40rpx;
      font-size: 40rpx;
    }
    .note {
      margin-top: 10rpx;
      font-size: 22rpx;
      color: #666;
    }
  }
}
.iconfont .icon-shoucang {
  font-size: 50px;
  color: '#ff2d4a' !important;
}

.iconfont .icon-shoucang-fill {
  font-size: 50px;
  color: '#ff2d4a' !important;
}
</style>
