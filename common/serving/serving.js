// common/serving/serving.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    image: {
      type: String,
      value: "../../img/index/serving.png"
    },
    mobile: {
      type: String,
      value: ""
    },
    wechat: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showServing: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    callServing: function (e) {
      this.setData({
        showServing: true
      });
    },
    hideServing: function (e) {
      this.setData({
        showServing: false
      });
    },
    copyIt: function() {
      var wechat = this.properties.wechat;
      wx.setClipboardData({
        data: wechat,
        success(res) {

        }
      });
    },
    hideDlg: function() {
      this.setData({
        showServing: false
      });
    }
  }
});
