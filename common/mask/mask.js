const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: {
      type: Boolean,
      value: true
    },
    backgroundColor: {
      type: String,
      value: "white"
    },
    top: {
      type: Number,
      value: 0
    },
    height: {
      type: String,
      value: "100%"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    titleHeight: app.globalData.titleHeight,
    statusbarHeight: app.globalData.statusbarHeight,
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
});
