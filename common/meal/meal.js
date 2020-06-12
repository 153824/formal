// common/meal/meal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    changePage: function () {
      console.log("../../user/index");
      // wx.navigateTo({
      //   url: "../user/index"
      // })
      wx.switchTab({
        url: "../user/index"
      })
    }
  }
})
