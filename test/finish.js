// test/finish.js
var app = getApp();
Page({
  data: {

  },
  onLoad: function(options) {
    var id = options.id;
    this.setData({
      id: id
    });
  },
  onShow: function() {

  },
  /**
   * 进入测评管理页面
   */
  toManage: function(e) {
    wx.setStorageSync("showDlg", true);
    wx.switchTab({
      url: '../index/manage'
    });
  }
})