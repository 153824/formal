// common/dialog/dialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "批量转发报告为付费功能"
    },
    subtitle: {
      type: String,
      value: ""
    },
    /*单位默认为rpx*/
    height: {
      type: String,
      value: 108
    },
    color: {
      type: String,
      value: "#FFFFFFFF"
    },
    bgColor:{
      type: String,
      value: "#353EE8FF"
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
    eventListener: function (e) {
      wx.navigateTo({
        url: '../common/dialog/dialog'
      })
    },
    back: function (e) {
      wx.navigateBack()
    }
  }
})
