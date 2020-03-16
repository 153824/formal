// common/webView.js
Page({
  data: {
    url: ""
  },
  onLoad: function(options) {
    var url = wx.getStorageSync("webView_Url");
    wx.removeStorageSync("webView_Url");
    this.setData({
      url: url
    })
  },
  onReady: function() {

  }
})