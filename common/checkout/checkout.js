const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "测评简介"
    },
    subtitle: {
      type: String,
      value: ""
    },
    type: {
      type: String,
      value: "introduction"
    },
    info: {
      type: String,
      value: ""
    },
    list: {
      type: Array,
      value: []
    },
    isShow: {
      type: Boolean,
      value: true
    },
    data: {
      type: Object,
      value: {}
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isIos: app.isIos
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changePage: function (e) {
      const { id,subtitle } = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/pages/report/report?receiveRecordId=${ id }&command=close`
      });
    }
  }
});
