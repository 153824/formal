//index.js
//获取应用实例
var app = getApp();
var firstLoad = true;
Page({
  data: {
    teamRole: app.teamRole,
    showTopGift: false,
    showGiftDlg: false
  },
  onLoad: function(options) {
    wx.switchTab({
      url: '/store/store',
    });
    firstLoad = true;
  },
  onShow: function() {
    wx.switchTab({
      url: '/store/store',
    });
    var that = this;
    var skipFreeTicket = wx.getStorageSync("skipFreeTicket");
    app.freeTickId = "";
    if (!app.isLogin) {
      app.checkUser = function() {
        that.onShow();
        app.checkUser = null;
      };
      return;
    }
    app.doAjax({
      url: "getMyticket",
      method: "get",
      noLoading: true,
      data: {
        page: 1,
        pageSize: 12,
        type: 2
      },
      success: function(ret) {
        var hasFreeTick = false;
        ret.forEach(function(n) {
          if (n.type == 1) {
            hasFreeTick = true;
          }
        });
        if (!hasFreeTick && app.teamRole == 3) {
          if (!skipFreeTicket) {
            // wx.navigateTo({
            //   url: './getFreeTicket'
            // });
          }
        }
        that.setData({
          skipFreeTicket: skipFreeTicket,
          hasFreeTick: hasFreeTick,
          teamRole: app.teamRole
        });
        var couponGet = (app.globalData.userInfo || {}).couponGet || false;
        var hideLastTestMind = wx.getStorageSync("hideLastTestMind");
        app.doAjax({
          url: "getHomeSetting",
          method: "GET",
          success: function(ret) {
            ret["couponGet"] = couponGet;
            that.setData(ret);
            that.setData({
              oldShareInfo: ""
            });
            if (!hideLastTestMind) {
              app.doAjax({
                url: 'toSharePaper',
                method: 'post',
                data: {
                  type: "self",
                  isCheckOld: true
                },
                success: function(res) {
                  if (res && res.isOld && res.id) {
                    that.setData({
                      oldShareInfo: res
                    });
                  }
                }
              });
            }
            if (!couponGet && firstLoad && app.teamRole == 3) {
              firstLoad = false;
              setTimeout(function() {
                that.setData({
                  showGiftDlg: true
                });
              }, 2000);
            }
          }
        });
      }
    });
  },
  onShareAppMessage(options) {
    return app.defaultShareObj;
  },

  navWebView: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.setStorageSync("webView_Url", url);
    wx.navigateTo({
      url: '../common/webView',
    })
  },
  changePage: function(e) {
    //页面跳转
    var d = e.currentTarget.dataset;
    var url = d.url;
    var tab = d.tab;
    var n = d.n;
    //console.log("changePage url", url, tab);
    if (url) {
      if (url.indexOf('http') != -1) {
        wx.setStorageSync("webView_Url", url);
        wx.navigateTo({
          url: '../common/webView',
        });
      } else {
        var detail = e.detail;
        if ((!detail || !detail.encryptedData) && n == "getPhoneNumber") return;
        if (detail && detail.encryptedData) {
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
                app.getUserInfo();
              }
            });
          }
        }
        wx.navigateTo({
          url: url
        });
      }
    }
    if (tab) {
      wx.switchTab({
        url: tab
      });
    }
    this.setData({
      showTopGift: true,
      showGiftDlg: false
    });
  },
  //显示领券弹窗
  toFetGift: function(e) {
    this.setData({
      showGiftDlg: true
    });
  },
  //隐藏领券弹窗
  closeGiftDlg: function(e) {
    this.setData({
      showTopGift: true,
      showGiftDlg: false
    });
  },
  /**继续体验 */
  continueTest: function(e) {
    var t = e.target.dataset.t;
    if (t == 2) {
      wx.setStorageSync("hideLastTestMind", true);
      this.setData({
        oldShareInfo: ""
      });
      return;
    }
    var id = this.data.oldShareInfo.id;
    wx.navigateTo({
      url: '../test/guide?id=' + id
    });
  }
})