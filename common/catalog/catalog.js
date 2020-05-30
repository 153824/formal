// common/catalog/catalog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    range: {
      type: Array,
      value:["全部测评"]
    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    index: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    pickerChange: function (e) {
      this.setData({
        index: e.detail.value
      })
    }
  }
});
