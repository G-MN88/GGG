/* 
这是一个抽取的模块,用于操作购物车的数据
新增,修改,删除

保存对象:
goods { goods_id , goods_number}
保存到本地的时候用{id:num}格式
*/
//声明存本地的属性名
const key = "key"
//声明一个方法,返回本地数据
const getLocalGoods = () => {
    //没有添加购物车的时候要设一个空对象,否则会报错
    return wx.getStorageSync(key) || {};
}
//新增
const addGoods = goods => {
    //得到加入购物车后的数据
    // console.log(goods);
    //1. 取出本地存储的商品信息
    const localGoods = getLocalGoods();
    //2.新增我们的商品信息 -- 添加过的就加数量
    //判断之前有没有这个商品id
    if (localGoods[goods.goods_id]) {
        //动态不能用点语法,用[],存起来的对象就是localGoods{id:num},
        //如果有这个id了,num++,没有就动态添加id:num
        localGoods[goods.goods_id] += goods.goods_number
    } else {
        //没有之前的id,就新增进去
        localGoods[goods.goods_id] = goods.goods_number
    }
    // 3、保存回去本地
    wx.setStorageSync(key, localGoods)
}
//修改
const updateGoods = goods => {
    // console.log('u',goods);
    //1. 取出本地存储的商品信息
    const localGoods = getLocalGoods();
    //2. 修改
    localGoods[goods.goods_id] = goods.goods_number
     // 3、保存回去本地
     wx.setStorageSync(key, localGoods)
}
//删除
//修改
const deleteGoods = goods_id => {
    // console.log('u',goods);
    //1. 取出本地存储的商品信息
    const localGoods = getLocalGoods();
    //2. 删除
    delete localGoods[goods_id]
     // 3、保存回去本地
     wx.setStorageSync(key, localGoods)
}
//按需导出
export {
    addGoods,
    getLocalGoods,
    updateGoods,
    deleteGoods
}

