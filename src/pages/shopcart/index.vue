<template>
  <div>
    <view class="empty-car" v-if="isEmpty">
      <img src="/static/img/kong.png">
      <text class="empty-car-tips">购物车还是空的</text>
      <text class="empty-car-tips extra">快去逛逛吧~</text>
    </view>
    <view v-else>
      <!-- 头部 -->
      <view class="shop-head">
        <view class="shop-head-info">
          <view class="iconfont icon-shop flex-center icon-dianpu"></view>
          <text class="shop-name">品优购生活馆</text>
        </view>
      </view>

      <!-- 列表 -->
      <block v-for="(item,index) in goodsList" :key="item.goods_id">
        <view class="goods-item">
          <!-- 左边选中的图标 -->
          <view
            @click="toggleSelect(item)"
            :class="['pubIcon',item.isSelect ? 'trueIcon' : 'falseIcon']"
          ></view>
          <!-- 中间的图片 -->
          <view class="goods-item-pic">
            <img :src="item.goods_small_logo">
          </view>
          <!-- 右边的商品信息 -->
          <view class="goods-item-info">
            <text class="goods-item-info-title">{{item.goods_name}}</text>
            <text class="goods-item-info-price">￥{{item.goods_price}}</text>
            <view class="goods-item-info-edit">
              <view class="outer">
                <view
                  :style="{'color':item.goods_number == 1 ? '#ccc' : 'black'}"
                  @click="substrict(item)"
                >-</view>
                <view class="value">
                  <input
                    style="font-size:12px;color:#999;"
                    v-model="item.goods_number"
                    @input="changeValue(item)"
                    type="number"
                  >
                </view>
                <view @click="add(item)" class="add">+</view>
              </view>
              <text @click="deleteGoods(item,index)">| 删除</text>
            </view>
          </view>
        </view>
      </block>
      <!-- 工具条 -->
      <view class="fixed-bar">
        <view @click="toggleAllSelect" class="allselect">
          <!-- 左边选中的图标 -->
          <view :class="['pubIcon',allSelected ? 'trueIcon' : 'falseIcon']"></view>
          <text style="margin-left:10rpx;color:#999;">全选</text>
        </view>
        <view class="statistics">
          <view>
            <text>合计：</text>
            <text style="color:#ff2d4a;font-size:30rpx;">￥{{totalPrice}}</text>
          </view>
          <view>
            <text>包含运费</text>
          </view>
        </view>
        <view @click="goToOrderAndPay" :class="['jiesuan',totalCount === 0 ? 'disabled':'']">
          <text>去结算 ({{totalCount}})</text>
        </view>
      </view>
    </view>
  </div>
</template>

<script>
//按需导入本地商品信息
import { getLocalGoods,updateGoods,deleteGoods } from '../../common/card'
export default {
  data() {
    return {
      isEmpty: true, //购物车是否有数据
      goodsList: [], //商品数据
      allSelected:true //是否全选
    }
  },
  // 计算属性
  computed: {
    // 总价钱
    totalPrice(){
      //声明总价钱为0
      let sumPrice = 0
      //遍历数组
      this.goodsList.forEach(item=>{
        // 看是否勾选,勾选才计算
        if(item.isSelect){
          //总价钱等于商品价格乘以数量,数组多个计算,别忘记+号
          sumPrice += item.goods_price*item.goods_number
        }
      })
      //返回总价钱
      return sumPrice
    },
    //总数量
    totalCount(){
      //声明总数量
      let sumNuber = 0
      // 遍历数组
      this.goodsList.forEach(item=>{
        //选中才计算
        if(item.isSelect){
          //总数等于各个商品数量相加
          sumNuber += item.goods_number
        }
      })
      //返回商品总数
      return sumNuber
    }
  },
  //这里用onLoad的话,在第一次加载页面时触发,后面再添加购物车时,就不会触发,所以没有显示出来,需要刷新再显示
  //所以选择用onShow,页面显示时就调用
  onShow() {
    //获取商品列表数据
    this.getGoodsListData()
  },
  //方法
  methods: {
    //获取商品列表数据
    async getGoodsListData() {
      //拿到本地商品信息
      const localGoods = getLocalGoods()
      //获取本地商品所有id,通过Object.keys()放在一个数组中,再通过join(',')转成字符串
      const ids = Object.keys(localGoods)
      if (ids.length === 0) {
        this.isEmpty = true
        return
      }
      this.isEmpty = false
      //发送请求
      const res = await this.$axios.get(
        `goods/goodslist?goods_ids=${ids.join(',')}`
      )
      console.log(res)

      res.data.message.forEach(item => {
        //动态添加本地的数量到goodList数组中,方便渲染
        item.goods_number = localGoods[item.goods_id]
        //给返回的数组动态添加一个选择框的属性,选中为true
        item.isSelect = true
      })
      console.log(res.data.message)
      //赋值
      this.goodsList = res.data.message
    },
    // 全选产品事件
    toggleAllSelect(){
      //自身取反
      this.allSelected = !this.allSelected
      //让购物车商品跟我的选择一样,goodsList中isSelect跟全选框状态一致
      this.goodsList.forEach(item=>{
        item.isSelect = this.allSelected
      })
    },
    // 单一选中产品事件
    //点谁谁就反选,所以需要传点击那个的参数
    toggleSelect(item){
       //自身取反
      item.isSelect = !item.isSelect
      // 有一个没被选中,全选框都不会被选中,用some遍历数组,节省性能,找到一个没有选中的就不会往下找了
      //some遍历,有一个满足没选中就返回true
      const isChecked = this.goodsList.some(item=>{
        return item.isSelect==false
      })
      // console.log(isChecked);//true就是有不选中的
      // 有不选中的allSelected为false,就是!isChecked
      this.allSelected = !isChecked
    },
    // 减购物车商品数量
    substrict(item) {
      if (item.goods_number <=1) return
      item.goods_number--
       //同步修改本地存储的
      updateGoods(item)
    },
    // 加购物车商品数量
    add(item){
      item.goods_number++
      //同步修改本地存储的
      updateGoods(item)
    },
    // 输入商品购物车数量
    changeValue(item){
      //输入框输入的数字不为0
      if (item.goods_number){
        //把输入的内容转化为数字,进行计算,不然就是字符串拼接了
        item.goods_number = +(item.goods_number)
        //如果输入为0的话就自动显示为1
        if(item.goods_number<=0){
        //如果输入为0或其他的话就自动显示为1
        item.goods_number = 1
         
      }
      //用下面这段代码,无论输入什么都会带上1
      // }else if(item.goods_number<=0){
      //   //如果输入为0或其他的话就自动显示为1
      //   item.goods_number = 1
      }
      //同步修改本地存储的
         updateGoods(item)
    },
    
    // 删除购物车商品事件
    deleteGoods(item,index){
      //弹出框
      wx.showModal({
        title: '提示', //提示的标题,
        content: "你确定要删掉这个商品吗", //提示的内容,
        showCancel: true, //是否显示取消按钮,
        cancelText: '取消', //取消按钮的文字，默认为取消，最多 4 个字符,
        cancelColor: '#000000', //取消按钮的文字颜色,
        confirmText: '确定', //确定按钮的文字，默认为取消，最多 4 个字符,
        confirmColor: '#3CC51F', //确定按钮的文字颜色,
        success: res => {
          if (res.confirm) {
            console.log('用户点击确定')
            //用户点击了确定,就要在goodsList数组中删除点击对应的id

            //如果没传下标,可以采用下面的方法

            //findIndex遍历数组,返回对应的下标
            // const deleteIndex = this.goodsList.findIndex(val=>{
            //   //这里写需要的判断条件
            //   return val.goods_id==item.goods_id;
            // })
            //删除对应的数据
            // this.goodsList.splice(deleteIndex,1)


            this.goodsList.splice(index,1)
            //删除本地的数据
            deleteGoods(item.goods_id)
             // 判断本地是否还有数据,没有的话显示没有的那个页面isEmpty为true
            this.isEmpty = this.goodsList.length === 0
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      });
    },
    // 去结算事件
    goToOrderAndPay(){
      // 选中的商品的id携带到支付页面
      //声明个数组存选中的id
      const ids = []
      // 遍历数组,选择选中的id,存入数组中
      this.goodsList.forEach(item=>{
        if(item.isSelect){
          ids.push(item.goods_id)
        }
      })
      // 判断数组是否为空,为空提示用户
      if(ids.length==0){
        wx.showToast({
          title: '请选择商品', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
          success: res => {}
        });
      }else {
        //编程式导航跳转到支付页面
        wx.navigateTo({
          url: '/pages/pay/main?ids='+ids.join(','),
          
        })
      }
    },

  }
}
</script>

<style lang="less" scoped>
@PADDING-LEFT: 20rpx;
.empty-car {
  display: flex;
  flex-direction: column;
  height: 500rpx;
  justify-content: center;
  align-items: center;
  img {
    width: 125rpx;
    height: 124rpx;
  }
  &-tips {
    margin-top: 30rpx;
    font-size: 28rpx;
    color: #666;
  }
}
.extra {
  font-size: 24rpx;
  color: #999;
}
.shop-head {
  background-color: #fff;
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 @PADDING-LEFT;
  border-bottom: 1px solid #ddd;
  &-info {
    display: flex;
    align-items: center;
    .shop-name {
      margin-left: 10rpx;
    }
  }
}
.goods-item {
  height: 220rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding-left: @PADDING-LEFT;
  border-bottom: 1px solid #eee;
  &-pic {
    width: 160rpx;
    height: 160rpx;
    margin-left: 10rpx;
    border: 1px solid #ddd;
    padding: 10rpx;
    border-radius: 5rpx;
    img {
      width: 100%;
      height: 100%;
    }
  }
  &-info {
    flex: 1;
    height: 180rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0rpx @PADDING-LEFT;
    &-title {
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    &-price {
      color: #ff2d4a;
      font-size: 30rpx;
    }
    &-edit {
      display: flex;
      justify-content: space-between;
      .outer {
        border: 1px solid #ddd;
        display: flex;
        align-items: center;
        border-radius: 5rpx;
        view {
          height: 50rpx;
          width: 50rpx;
          line-height: 50rpx;
          text-align: center;
        }
        .value {
          width: 65rpx;
          border-left: 1px solid #ddd;
        }
        .add {
          border-left: 1px solid #ddd;
        }
      }
    }
  }
}
.pubIcon {
  background: url(https://mcart.jiuxian.com/statics/images/cart/catIcon.png)
    no-repeat 0 0;
  background-size: 300rpx 300rpx;
  width: 55rpx;
  height: 55rpx;
}
.trueIcon {
  background-position: 0 -225rpx;
}
.falseIcon {
  background-position: -50rpx -225rpx;
}
.fixed-bar {
  display: flex;
  height: 98rpx;
  width: 750rpx;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  .allselect {
    padding-left: @PADDING-LEFT;
    width: 200rpx;
    height: 98rpx;
    display: flex;
    align-items: center;
  }
  .statistics {
    flex: 1;
    display: flex;
    // align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  .jiesuan {
    width: 200rpx;
    height: 98rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ff2d4a;
    text {
      color: #fff;
    }
  }

  .disabled {
    background-color: #ddd;
  }
}
</style>


