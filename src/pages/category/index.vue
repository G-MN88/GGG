<template>
  <div class="categories">
    <!-- 左边的scroll-view -->
    <scroll-view :style="{height:height+'px'}" scroll-y class="categories-left">
      <view @click="toggleSelect(index)" :class="['categories-left-item', index === currentIndex ? 'categories-left-active':'']"  v-for="(item,index) in categories" :key="item.cat_id">
        <text>{{item.cat_name}}</text>
      </view>
    </scroll-view>
    <!-- 右边的scroll-view -->
    <scroll-view :style="{height:height+'px'}" v-if="categories.length > 0" scroll-y class="categories-right">
      <view class="categories-right-item" v-for="item in categories[currentIndex].children" :key="item.cat_id">
        <view class="categories-right-item-title">{{item.cat_name}}</view>
        <view class="categories-right-item-body">
          <view class="right-body-item" v-for="(subitem,index2) in item.children" :key="subitem.cat_id">
            <image :src="subitem.cat_icon"/>
            <text class="right-body-item-title">{{subitem.cat_name}}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </div>
</template>

<script>
export default {
  data(){
    return {
      categories:[],
      height:0,//左右两个scroll-view的高度
      currentIndex:0 // 当前选中的样式
    }
  },
  onLoad(){
    this.getCategoiresData()

    // 获取系统信息，获取可使用高度（不包含window和tabBar）
    // const {windowHeight} = wx.getSystemInfoSync()
    wx.getSystemInfo({
  success: res=> {
    this.height = res.windowHeight - 10
  }
   })

    
  },
  methods:{
    async getCategoiresData(){
      const res = await this.$axios.get('categories')
    
      this.categories = res.data.message
    },
    // 切换一级分类
    toggleSelect(index){
      this.currentIndex = index
    }
  }
}
</script>

<style lang="less" scoped>
.categories {
  display: flex;
  margin-top: 10px;
  &-left {
    width: 200rpx;
    display: flex;
    flex-direction: column;
    // justify-content: center;
    align-items: center;
    background-color: #f4f4f4;
    &-item {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 200rpx;
      height: 100rpx;
      position: relative;
      color:#999;
    }
    &-active {
      background: #fff;
      color:#000;
      &::before {
        position: absolute;
        content: '';
        background-color: #ff2d4a;
        left: 0;
        top: 10rpx;
        width: 5px;
        height: 80rpx;
      }
    }
  }
  &-right {
    flex: 1;
    background-color: white;
    &-item {
      &-title {
        display: flex;
        justify-content: center;
        align-items: center;
        color:#666;
        font-size: 14px;
        &::before {
          content: '/';
          color: #eeeeee;
          margin-right: 20rpx;
        }

        &::after {
          content: '/';
          color: #eeeeee;
          margin-left: 20rpx;
        }
      }
      &-body {
        display: flex;
        flex-wrap: wrap;
      }
    }
  }
}
image {
  width: 100rpx;
  height: 80rpx;
}
.right-body-item {
  height: 200rpx;
  width: 33.33333%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &-title{
    margin-top:5rpx;
    color:#666;
    font-size: 14px;
  }
}
</style>