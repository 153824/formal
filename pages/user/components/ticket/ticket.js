// user/ticket.js
var app = getApp();
Page({
  data: {
    hasMobile: false,
    list: []
  },
  onLoad: function(options) {

  },

  onShow: function() {
    var that = this;
    var phone = app.globalData.userInfo.phone;
    that.setData({
      hasMobile: phone ? true : false
    });
    app.doAjax({
      url: "getMyticket",
      method: "get",
      data: {
        page: 1,
        pageSize: 12
      },
      success: function(ret) {
        that.setData({
          list: ret
        });
      }
    });
  },
  /**
   * 页面跳转
   */
  changePage: function(e) {
    var list = this.data.list;
    var index = e.currentTarget.dataset.i;
    var obj = list[index];
    if (!obj) return;
    var url = "";
    if (obj.paper) { //测评详情
      url = "../../../station/component/detail/detail?id=" + obj.paper.id;
    } else if (obj.column) { //栏目详情
      return wx.switchTab({
        url: '../../../station/station'
      });
    }
    app.changePage(url);
  },
  /**
   * 用户手机号授权
   */
  checkUserMobile: function(e) {
    var that = this;
    var detail = e.detail;
    var iv = detail.iv;
    var encryptedData = detail.encryptedData;
    if (encryptedData) {
      //用户授权手机号
      var userMsg = app.globalData.userMsg || {};
      userMsg["iv"] = iv;
      userMsg["encryptedData"] = encryptedData;
      app.doAjax({
        url: "updatedUserMobile",
        data: userMsg,
        success: function(ret) {
          that.setData({
            hasMobile: true
          });
        }
      });
    }
  }
})
