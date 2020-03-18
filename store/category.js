// index/store/unfold.js
//分类测评列表
var app = getApp();
Page({
  data: {
    listHeight: 500,
    activeIndex: 0,
    paperObj: {},
    phoneModel: ""
  },
  onLoad: function(options) {
    this.setData({
      isIos: app.isIos,
      aI: options.i != null ? options.i : null,
      id: options.id,
      phoneModel: app.isIPhoneX
    })
  },
  onShow: function() {
    var that = this;
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
        toNext(freeTickId, columnId_ticket);
      }
    });

    function toNext(freeTickId, columnId_ticket) {
      app.doAjax({
        url: "getColumnDetail",
        method: "get",
        data: {
          id: that.data.id
        },
        success: function(res) {
          var isChild = false;
          if (that.data.aI != null) {
            isChild = true;
            res["classify"] = [res["classify"][that.data.aI]];
          }
          that.setData({
            isChild: isChild,
            freeTickId: freeTickId || "",
            columnId_ticket: columnId_ticket || "",
            paperObj: res
          });
          const query = wx.createSelectorQuery();
          query.select('#headerView').boundingClientRect()
          query.selectViewport().scrollOffset()
          query.exec(function(res) {
            if (!res || !res[0]) return;
            var height = res[0].height;
            var sys = wx.getSystemInfoSync();
            var h = sys.windowHeight - height;
            that.setData({
              listHeight: h
            });
          });
        }
      });
    }
  },
  /**
   * 切换tab
   */
  changecard: function(e) {
    var i = e.detail.current;
    var i1 = e.currentTarget.dataset.i;
    if (i1 != null) {
      this.setData({
        activeIndex: i1
      });
    } else {
      this.setData({
        activeIndex: i
      });
    }
  },
  getUserInfo: function(e) {
    var that = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        app.userLogin(res.code);
        console.log(wx.getStorageSync("openId"))
        var userData = e.detail.userInfo
        userData.openid = wx.getStorageSync("openId") || app.globalData.userMsg.openid;
        console.log(userData)
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
            app.globalData.userInfo.nickname = userInfo.nickName;
            app.addNewTeam();

            var userData = res.data;
            if (0 == res.code) {
              wx.hideLoading();
              wx.setStorageSync("userInfo", userData);
              wx.setStorageSync("openId", userData.openid);
              wx.setStorageSync("unionId", userData.uid);
              wx.navigateTo({
                url: "./detail?id=" + that.data.id + "&name=" + that.data.name
              })
            } else wx.showModal({
              title: "登入失败！",
              content: "网络故障，请退出重新进入小程序。",
              showCancel: !1,
              confirmText: "确定",
              confirmColor: "#0099ff",
              success: function(e) {}
            });
          }
        })
      }
    })
  },
  /**
   * 跳转测评详情
   */
  toDetail: function(e) {
    var id = e.currentTarget.id;
    wx.navigateTo({
      url: "./detail?id=" + id
    });
  },
  onShareAppMessage(options) {
    return app.defaultShareObj;
  },
})