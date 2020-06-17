// index/store/charge/be come vip.js
var app = getApp();
Page({
  data: {
    kefuWX: "haola72",
    kefuMobile: "18559297592",
    buyVipType: 1,
    isIos: false,
    noBuy: true,
    showDlg: false,
  },
  onLoad: function(options) {
    var teamData = app.globalData.team || app.globalData.userInfo;
    var noBuy = (teamData || {}).vip0EndTime ? false : true;
    var hasBuy1 = (teamData || {}).vip2EndTime ? true : false;
    var isvip0 = wx.getStorageSync("isvip0");
    var isvip2 = wx.getStorageSync("isvip2");
    this.setData({
      isvip0: isvip0,
      isvip2: isvip2,
      teamRole: app.teamRole,
      isIos: app.isIos,
      noBuy: noBuy,
      hasBuy1: hasBuy1
    });
  },
  onShow: function() {
    var that = this;
    app.doAjax({
      url: "getHomeSetting",
      method: "GET",
      success: function(ret) {
        var otherSetting = ret.otherSetting || {};
        that.setData({
          kefuWX: otherSetting.kefuWX || "haola72",
          kefuMobile: otherSetting.kefuMobile || "18559297592",
        });
      }
    });
  },
  changePage: function(e) {
    return;
    var d = e.currentTarget.dataset;
    app.changePage(d.url, d.tab);
  },
  formal: function() {
    var that = this;
    app.doAjax({
      url: "buyVip",
      method: "post",
      data: {
        type: 2,
        openid: wx.getStorageSync("openId") || app.globalData.userMsg.openid
      },
      success: function(res) {
        if (!res.payObj) {
          wx.showToast({
            title: res,
            duration: 1200
          });
          return;
        }
        wx.requestPayment({
          'appId': res.payObj.appId,
          'timeStamp': res.payObj.timeStamp,
          'nonceStr': res.payObj.nonceStr,
          'package': res.payObj.package,
          'signType': 'MD5',
          'paySign': res.payObj.paySign,
          'success': function(res) {
            wx.showToast({
              title: '购买成功',
              duration: 1200
            });
            wx.setStorageSync("isvip2", true);
            setTimeout(function() {
              wx.navigateBack();
            }, 1500);
            //这里完成跳转
          },
          'fail': function(res) {
            if (res.errMsg == "requestPayment:fail cancel") {
              wx.showToast({
                title: '支付取消',
                icon: 'none',
                duration: 1200
              })
            } else {
              wx.showToast({
                title: '支付失败',
                icon: 'none',
                duration: 1200
              })
            }
            //支付失败
            console.log(res);
          },
          'complete': function(res) {}
        })
      }
    });
  },
  experience: function() {
    var that = this;
    app.doAjax({
      url: "buyVip",
      method: "post",
      data: {
        type: 0,
        openid: wx.getStorageSync("openId")
      },
      success: function(res) {
        console.log(res)
        wx.requestPayment({
          'appId': res.payObj.appId,
          'timeStamp': res.payObj.timeStamp,
          'nonceStr': res.payObj.nonceStr,
          'package': res.payObj.package,
          'signType': 'MD5',
          'paySign': res.payObj.paySign,
          'success': function(res) {
            wx.showToast({
              title: '购买成功',
              duration: 1200
            })
            wx.setStorageSync("isvip0", true)
            setTimeout(function() {
              wx.navigateBack();
            }, 1500);
            //这里完成跳转
          },
          'fail': function(res) {
            if (res.errMsg == "requestPayment:fail cancel") {
              wx.showToast({
                title: '支付取消',
                icon: 'none',
                duration: 1200
              })
            } else {
              wx.showToast({
                title: '支付失败',
                icon: 'none',
                duration: 1200
              })
            }
            //支付失败
            console.log(res);
          },
          'complete': function(res) {}
        })
      }
    });
  },
  /**切换购买VIP类型 */
  changeBuyType: function(e) {
    var current = e.detail.current;
    this.setData({
      buyVipType: current + 1
    });
  },
  /**
   * 拨打电话
   */
  callIt: function() {
    var phoneNumber = this.data.kefuMobile;
    wx.makePhoneCall({
      phoneNumber: phoneNumber //仅为示例，并非真实的电话号码
    })
  },
  //复制微信号
  copyIt: function() {
    var kefuWX = this.data.kefuWX;
    wx.setClipboardData({
      data: kefuWX,
      success(res) {

      }
    });
  },
  toShowDlg: function() {
    this.setData({
      showDlg: true
    });
  },
  hideDlg: function() {
    this.setData({
      showDlg: false
    });
  }
})