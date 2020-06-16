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
  toReportDetail: function(e) {
    const { id } = this.data;
    wx.setStorageSync("showDlg", true);
    wx.navigateTo({
      url: `../report/detail?id=${ id }`,
    });
  }
})
