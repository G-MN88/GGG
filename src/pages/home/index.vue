<template>
  <div>
    <!-- 1. 轮播图 -->
    <swiper indicator-dots autoplay circular indicator-active-color="#fff">
      <block v-for="item in swiperdata" :key="item.id">
        <navigator
          :url="item.navigator_url"
          >
        
         <swiper-item>
          <img mode="aspectFill" :src="item.image_src">
         </swiper-item>
        </navigator>
      </block>
    </swiper>
    <!-- 2. 分类 -->
    <div class="categories">
      <div class="category-item" v-for="item in categories" :key="item.name">
        <img :src="item.image_src">
        
      </div>
    </div>
    <!-- 3. 楼层数据 -->
    <div class="floor" v-for="item in floordata" :key="item.floor_title.name">
      <!-- 头部 -->
      <div class="floor-head">
        <img :src="item.floor_title.image_src">
      </div>
      <!-- 内容 -->
      <div class="floor-body">
        <div class="floor-body-left">
          <img :src="item.product_list[0].image_src">
        </div>
        <div class="floor-body-right">
          <div v-for="(subitem,index2) in item.product_list" :key="subitem.name" v-if="index2 > 0">
            <img
              :style="{width:subitem.image_width+'rpx'}"
              class="floor-body-right-img"
              :src="subitem.image_src"
              alt
            >
          </div>
        </div>
      </div>
    </div>
    <!-- 4. 底部 -->
    <div class="end-tips">
      <span class="iconfont icon-xiao"></span>
      <span class="bottomline">我也是有底线的</span>
    </div>
    <!-- 5. 回到顶部 -->
    <!-- 经常触发,用v-show -->
    <div v-show="isShow">
      <div @click="goToTop" class="to-top">
        <img src="/static/img/arrow_top@2x.png">
        <text>顶部</text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      swiperdata: [], // 轮播图数据
      categories: [], // 分类菜单
      floordata: [], // 楼层数据
      isShow: true // 是否显示回到顶部
    }
  },
  onLoad() {
    //获取首页轮播图
    this.getSwiperData()
    //分类菜单
    this.getCategory()
    //楼层数据
    this.getFloor()
  },
  //回到顶部
  // 页面滚动触发事件的处理函数
  // onPageScroll(Object object)   scrollTop	Number	页面在垂直方向已滚动的距离（单位px）
  onPageScroll({ scrollTop }) {
    // console.log(scrollTop)//打印触发距离
    if(scrollTop>80){
      //防止消耗性能,,这里当isShow为true时,不执行下面代码
      if(this.isShow) return
      this.isShow = true;
    }else {
      //防止消耗性能,,这里当isShow为false时,不执行下面代码
       if(!this.isShow) return
       this.isShow = false;
    }
  },
  //方法
  methods: {
    //首页轮播图
    async getSwiperData() {
      const res = await this.$axios.get('home/swiperdata')
      console.log(res.data)
      this.swiperdata = res.data.message
    },
    //分类菜单
    async getCategory() {
      const res = await this.$axios.get('home/catitems')
      console.log(res.data)
      this.categories = res.data.message
    },
    //楼层数据
    async getFloor() {
      const res = await this.$axios.get('home/floordata')
      console.log(res.data)
      this.floordata = res.data.message
    },
    //是否回到顶部的方法
    goToTop() {
      wx.pageScrollTo({
        scrollTop:80, //滚动的目标位置,滚动多少出现回到顶部图标
        duration: 300 // 回到顶部的时间
      })
    }
  }
}
</script>

<style lang = 'less'>
swiper {
  width: 750rpx;
  height: 400rpx;
}
swiper img {
  width: 100%;
  height: 100%;
}
.categories {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: #ffffff;
  height: 150rpx;
  .category-item {
    width: 120rpx;
    height: 120rpx;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
.floor {
  margin-top: 20rpx;
  background-color: white;
  &-head {
    width: 750rpx;
    height: 59rpx;
    img {
      margin: 10rpx 0rpx 0rpx 10rpx;
      width: 100%;
      height: 100%;
    }
  }
  &-body {
    display: flex;
    padding: 20rpx 16rpx 10rpx 16rpx;
    &-left {
      width: 232rpx;
      height: 386rpx;
      img {
        width: 100%;
        height: 100%;
      }
    }
    &-right {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      &-img {
        height: 188rpx;
        margin: 0 0 10rpx 10rpx;
      }
    }
  }
}
.end-tips {
  display: flex;
  height: 100rpx;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #888;
  .bottomline {
    margin-left: 5rpx;
  }
}
.to-top {
  width: 90rpx;
  height: 90rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  position: fixed;
  right: 40rpx;
  bottom: 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img {
    width: 24rpx;
    height: 14rpx;
  }
  text {
    margin-top: 20rpx;
    color: #999;
  }
}
</style>
