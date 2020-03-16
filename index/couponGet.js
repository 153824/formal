// index/couponGet.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "新用户大礼包"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var title = "新用户大礼包";
    if (!app.isTodayTeam || app.couponGet) {
      title = "幸运大礼包";
    }
    var sys = wx.getSystemInfoSync();
    this.setData({
      title: title,
      type: options.type || 1,
      statusBarHeight: sys.statusBarHeight
    });
    app.doAjax({
      url: "couponGet",
      method: "post",
      data: {},
      error: function(ret) {
        app.toast(ret.msg);
        setTimeout(function() {
          wx.navigateBack();
        }, 1500);
      },
      success: function(ret) {
        app.getUserInfo(); //更新用户信息
        ret.forEach(function(node) {
          var column = node.column;
          var paper = node.paper;
          node.endTime = node.endTime ? app.changeDate(node.endTime, "yyyy-MM-dd") : "";
          if (column) {
            node.name = column.name;
            node.name1 = node.name + "的测评";
          }
          if (paper) {
            node.name = paper.name;
            node.name1 = node.name;
          }
        });
        that.setData({
          list: ret
        });
      }
    });
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

  },
  /**
   * 返回上一页
   */
  pageBack: function() {
    wx.navigateBack();
  },
  /**
   * 切换页面
   */
  changePage: function(e) {
    var list = this.data.list;
    var index = e.currentTarget.dataset.i;
    var obj = list[index];
    if (!obj) return;
    var url = "";
    if (obj.paper) { //测评详情
      url = "../store/detail?id=" + obj.paper.id;
    } else if (obj.column) { //栏目详情
      // url = "../store/category?id=" + obj.column.id;
      return wx.switchTab({
        url: '../store/store'
      });
    }
    app.changePage(url);
  }
})