// index/store/store.js
var app = getApp();
var firstLoad = false;
Page({
  data: {
    columnList: {},
    free: true,
    showTopGift: false,
    showGiftDlg: false,
    id: '',
    boxScrollTop: 0
  },
  onLoad: function() {
    firstLoad = true;
  },
  onShow: function() {
    var that = this;
    app.freeTickId = "";
    if (!app.isLogin) {
      app.checkUser = function() {
        that.onShow();
        app.checkUser = null;
      };
      return;
    }
    var couponGet0 = app.couponGet0 || false;
    var couponGet = app.couponGet || false;
    var couponGet1 = app.couponGet1 || false;
    var isTodayTeam = app.isTodayTeam || false;
    var isGetTick = wx.getStorageSync("getTick");
    var skipFreeTicket = wx.getStorageSync("skipFreeTicket");
    var hideLastTestMind = wx.getStorageSync("hideLastTestMind");
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
    wx.removeStorageSync("getTick");
    that.setData({
      isGetTick: isGetTick
    });
    var wxInfo = app.globalData.userInfo.info;
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
        var freeTickId = "";
        var columnId_ticket = "";
        ret.forEach(function(n) {
          if (n.type == 1) {
            freeTickId = n.id;
            if (n.count) {
              app.freeTickId = freeTickId;
              columnId_ticket = n.column.id;
            }
          }
        });
        if (!freeTickId && app.teamRole == 3 && !skipFreeTicket) {
          // wx.navigateTo({
          //   url: '../index/getFreeTicket'
          // });
        }
        toNext(freeTickId, columnId_ticket);
      }
    });

    function toNext(freeTickId, columnId_ticket) {
      app.doAjax({
        url: "getColumnList",
        method: "get",
        data: {
          page: 1,
          pageSize: 12
        },
        success: function(res) {
          that.setData({
            userInfo: app.globalData.userInfo,
            skipFreeTicket: skipFreeTicket,
            freeTickId: freeTickId || "",
            columnId_ticket: columnId_ticket || "",
            isIos: app.isIos,
            wxInfo: wxInfo,
            columnList: res.data
          });
          app.columnId_ticket = "";
          if (!columnId_ticket) return;
          const query = wx.createSelectorQuery()
          query.select('#I' + columnId_ticket).boundingClientRect()
          query.selectViewport().scrollOffset()
          query.exec(function(res) {
            if (!res || !res[0] || that.data.boxScrollTop) return;
            var top = res[0].top;
            that.setData({
              boxScrollTop: top
            });
          });
        }
      });
      app.doAjax({
        url: "getMyticket",
        method: "get",
        noLoading: true,
        data: {
          page: 1,
          pageSize: 12,
          type: 5
        },
        success: function(ret) {
          var hasOldFreeTicks = false;
          if (ret && ret.length) {
            hasOldFreeTicks = true; //还有未使用完的礼包券--无法获取第二次的免费券
          }
          app.doAjax({
            url: "getHomeSetting",
            method: "GET",
            noLoading: true,
            success: function(ret) {
              var showGiftDlg = false;
              if (hasOldFreeTicks) {
                couponGet = true;
                couponGet1 = true;
              }
              if ((!couponGet || (!couponGet0 && isTodayTeam) || !couponGet1) && !hasOldFreeTicks && firstLoad && app.teamRole == 3) {
                firstLoad = false;
                showGiftDlg = true;
              }
              that.setData({
                teamRole: app.teamRole,
                showGiftDlg: showGiftDlg,
                couponGet0: couponGet0,
                couponGet: hasOldFreeTicks ? true : couponGet,
                couponGet1: hasOldFreeTicks ? true : couponGet1,
                isTodayTeam: isTodayTeam,
                hotPaper: ret.hotPaper || []
              });
            }
          });
        }
      });

    }
  },

  getUserInfo: function(e) {
    var that = this;
    var d = e.currentTarget.dataset;
    var userData = e.detail.userInfo
    userData.openid = wx.getStorageSync("openId") || app.globalData.userMsg.openid;
    app.doAjax({
      url: "updateUserMsg",
      method: "post",
      data: {
        data: JSON.stringify({
          wxUserInfo: userData,
          userCompany: {
            name: userData.nickName + "的团队"
          }
        }),
      },
      success: function(res) {
        var index = d.index;
        var i = d.i;
        var list = that.data.columnList;
        var data = list[i].papers[index];
        wx.navigateTo({
          url: "./detail?id=" + data.id
        });
        app.globalData.userInfo.nickname = userInfo.nickName;
        app.addNewTeam();
      }
    });
  },
  toDetail: function(e) {
    var d = e.currentTarget.dataset;
    var id = d.id;
    if (d.notick) {
      app.freeTickId = "";
    }
    wx.navigateTo({
      url: "./detail?id=" + id
    });
    wx.aldstat.sendEvent('从商城进入测评详情', {
      '测评名称': 'id' + id
    });
  },

  changepage: function(e) {
    console.log("e", e);
    wx.aldstat.sendEvent('首页点击免费领取新人券', {
      '触发点击': '点击数'
    });
    var d = e.currentTarget.dataset;
    var listid = e.currentTarget.id
    var i = d.i;
    var fullUrl = d.fullurl;
    if (fullUrl) {
      var detail = e.detail;
      if (detail && detail.errMsg && !detail.encryptedData) return;
      if (detail && detail.encryptedData) {
        var iv = detail.iv;
        var encryptedData = detail.encryptedData;
        if (encryptedData) {
          //用户授权手机号
          wx.aldstat.sendEvent('首页就授权了手机', {
            '触发点击': '点击数'
          });
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
        url: fullUrl
      });
      return;
    }
    var url = "./category?id=" + listid;
    if (i != null) {
      url = url + "&i=" + i;
    }
    wx.navigateTo({
      url: url
    });
    this.setData({
      showTopGift: true,
      showGiftDlg: false
    });
  },
  /**
   * 隐藏提示窗口
   */
  hideDlg: function(e) {
    this.setData({
      hideDlg: true
    });
  },
  onShareAppMessage(options) {
    return app.defaultShareObj;
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
  },
  //显示领券弹窗
  toFetGift: function(e) {
    wx.aldstat.sendEvent('首页点击了顶部领券', {
      '触发点击': '点击数'
    });
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
  realCloseGiftDlg: function (e) {
    wx.aldstat.sendEvent('首页关闭了领券弹窗', {
      '触发点击': '点击数'
    });
    this.setData({
      showTopGift: true,
      showGiftDlg: false
    });
  },
  onHide: function() {
    this.closeGiftDlg();
  }
})