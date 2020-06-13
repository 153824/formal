// common/catalog/catalog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    evaluations: {
      type: Array,
      value:[]
    },
    times: {
      type: Array,
      value: ["筛选时间","近七天","近三十天","更早"]
    },
    showEvaluation: {
      type: Boolean,
      value: true
    },
    showTime: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    checkedEvaluation: 0,
    checkedTime: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    evaluationChange: function (e) {
      var that = this,
          checkedEvaluation = +e.detail.value;
      this.setData({
        checkedEvaluation: checkedEvaluation
      });
      wx.setStorage({
        key: "pickEvaluation",
        data: that.properties.evaluations[checkedEvaluation]
      })
    },
    timeChange: function (e) {
      var that = this,
          checkedTime = +e.detail.value;
      this.setData({
        checkedTime: checkedTime
      });
      /*0近七天 1近三十天 2近三十天*/
      wx.setStorage({
        key: "pickTime",
        data: checkedTime - 1 < 0 ? 0 : checkedTime - 1
      });
    },
  }
});
