// index/mySharePapers.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    var that = this;
    wx.setNavigationBarTitle({
      title: app.teamName || ""
    });
    app.doAjax({
      url: "sharePaperList",
      method: "get",
      data: {
        type: 1,
        page: 1,
        pageSize: 1000
      },
      success: function(res) {
        var now = new Date().getFullYear();
        res.data.forEach(function(node) {
          var createdAt = node.lastShareTime || node.createdAt;
          node.lastShareTime = new Date(createdAt).getTime();
          var year = new Date(createdAt).getFullYear();
          if (year == now) {
            node.createdAt = app.changeDate(createdAt, 'MM月dd日');
          } else {
            node.createdAt = app.changeDate(createdAt, 'yyyy年MM月dd日');
          }
        });
        res.data.sort(function(n1, n2) {
          //最后一次发放测评时间倒序
          var it1 = new Date(n1.lastShareTime).getTime();
          var it2 = new Date(n2.lastShareTime).getTime();
          return it2 - it1;
        });
        that.setData({
          list: res.data
        })
      }
    })
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

  },
  changePage: function(e) {
    //页面跳转
    var d = e.currentTarget.dataset;
    var url = d.url;
    var tab = d.tab;
    //console.log("changePage url", url, tab);
    if (url) {
      wx.navigateTo({
        url: url
      });
    }
    if (tab) {
      wx.switchTab({
        url: tab
      });
    }
  }
})