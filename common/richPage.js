// common/richPage.js
var app = getApp();
var host = app.globalData.host;
var mta = app.mta;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    texts: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var obj = wx.getStorageSync("richText");
    wx.removeStorageSync("richText");
    wx.setNavigationBarTitle({
      title: obj.title
    });
    obj.texts = obj.texts.replace(/\n/g, "<br>");
    this.setData(obj);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})