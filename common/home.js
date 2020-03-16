// common/home/home.js
var app = getApp(),
  host = app.globalData.host;
var shareObj = {};
var mta = app.mta;
Page({
  data: {
    h: "",
    isBind: false,
    homeBgImg: "../img/loading_img.png"
  },
  onLoad: function(options) {
    mta.Page.init();
    var that = this;
    var userMsg = app.globalData.userMsg;
    var sysInfo = wx.getSystemInfoSync();
    const rate = sysInfo.windowWidth / 750;
    var h = (sysInfo.windowHeight / rate - 150);
    var info = userMsg.info;
    if (info.isPay) {
      //已付款
      app.globalData.isExperience = false;
    }
    wx.request({
      url: host + '/api/wxmessage/getAppShare',
      data: {
        appid: app.globalData.appid
      },
      method: "POST",
      "content-type": "application/json;charset=UTF-8",
      success: function(res) {
        var data = res.data;
        shareObj = {
          shareTicket: true,
          title: data.title,
          path: 'common/home?e=' + data.tj_event,
          imageUrl: data.img
        };
        var homeBgImg = (data.androidHome || {}).url || "";
        if (!homeBgImg) {
          homeBgImg = that.data.homeBgImg;
        }
        that.setData({
          h: h,
          homeBgImg: homeBgImg
        });
        wx.setStorageSync("shareObj", shareObj);
        var userInfo = wx.getStorageSync("userInfo");
        if (!userInfo || userInfo.nickname.indexOf("mini-") == 0) return;
        if (info.isPay || wx.getStorageSync("isShare")) {
          //已付款或已分享过
          wx.switchTab({
            url: '/home/category/home'
          });
          return;
        }
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return shareObj;
  },
  showShare: function() {
    app.aldstat.sendEvent('点击首页免费试用');
    app.globalData.isExperience = true;
    wx.setStorageSync("isShare", true);
    wx.switchTab({
      url: '/home/category/home'
    });
    return;
    mta.Event.stat('share', {
      'openid': app.globalData.userMsg.openid
    });
    //分享到微信群
    wx.showShareMenu({
      withShareTicket: true,
      success: function(res) {
        // 转发成功
        app.globalData.isExperience = true;
        wx.setStorageSync("isShare", true);
        setTimeout(function() {
          wx.switchTab({
            url: '/home/category/home'
          });
        }, 1000);
      }
    });
  },
  toPay: function() {
    app.aldstat.sendEvent('用户购买题库');
    //支付25元  
    app.wxPay(function() {
      app.globalData.userMsg.info.isPay = true;
      app.globalData.isExperience = false;
      wx.switchTab({
        url: '/home/category/home'
      });
    });
  },
  tiku_updataUserInfo: function(e) {
    var that = this;
    var type = e.target.dataset.t;
    if (e.detail.rawData) {
      var wxUserInfo = e.detail.rawData,
        openId = wx.getStorageSync("openId") || app.globalData.userMsg.openid,
        unionId = wx.getStorageSync("unionId") || app.globalData.userMsg.unionid;
      wx.request({
        url: host + "/api/wechat/mini_info",
        method: "POST",
        data: {
          id: app.globalData.userMsg.id,
          openId: openId,
          unionId: unionId,
          wxUserInfo: wxUserInfo
        },
        success: function(ret) {
          if (wx.hideLoading(), 0 == ret.data.errno) {
            var d = ret.data.data;
            wx.setStorageSync("userInfo", JSON.stringify(d));
            app.globalData.userMsg = d;
            // app.globalData.userInfo = JSON.stringify(d);
            if (type == "free") {
              that.showShare();
            }
            if (type == "pay") {
              that.toPay();
            }
          } else wx.showModal({
            title: "操作失败！",
            content: JSON.stringify(a.data.errmsg),
            showCancel: !1,
            confirmText: "确定",
            confirmColor: "#0099ff",
            success: function(a) {}
          });
        },
        fail: function(err) {
          console.error(err);
          wx.showModal({
            title: "操作失败！",
            content: "获取用户信息请求失败",
            showCancel: !1,
            confirmText: "确定",
            confirmColor: "#0099ff",
            success: function(a) {}
          });
        }
      });
    }
  }
})