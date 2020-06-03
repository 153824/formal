// common/checkout/checkout.js
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
    changePage: function (e) {
      const { id } = e.currentTarget.dataset;
      console.log(id)
      wx.navigateTo({
        url: `../report/detail?id=${ "5ec6475bb9759800064519a6" }`
      })
    }
  }
});
