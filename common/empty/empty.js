// common/empty/empty.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "暂时没有人完成测评"
    },
    type: {
      type: String,
      value: "default"
    },
    paperId: {
      type: String,
      value: ""
    },
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
    revocation: function(e) {
      var that = this;
      wx.showModal({
        title: '提示',
        content: '确认撤销该分享？',
        success: function(ret) {
          if (ret.confirm) {
            app.doAjax({
              url: 'cancelSharePaper',
              method: 'post',
              data: {
                id: e.target.dataset.id
              },
              success: function(res) {
                app.toast('撤回成功，测评已返还');
                setTimeout(that.onShow, 1500);
                that.setData({
                  isCancel: true
                })
              }
            });
          }
        }
      });
    },
  }
})
