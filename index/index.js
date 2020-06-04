//index.js
//获取应用实例
var app = getApp();
var firstLoad = true;
Page({
  data: {
    teamRole: app.teamRole,
    showTopGift: false,
    showGiftDlg: false,
    functionSet: [
      {
        text: "免费专区",
        src: "../img/index/free_base@2x.png"
      },
      {
        text: "销售技能",
        src: "../img/index/sale_test@2x.png"
      },
      {
        text: "测程序员",
        src: "../img/index/test_developer@2x.png"
      },
      {
        text: "经典测试",
        src: "../img/index/classic_test@2x.png"
      },
    ],
    statusbarHeight: app.globalData.statusbarHeight,
    titleHeight: app.globalData.titleHeight,
    navigationSet: []
  },
  onLoad: function(options) {
    wx.switchTab({
      url: '/store/store',
    });
    firstLoad = true;
  },
  onShow: function() {
    wx.switchTab({
      url: '/index/index',
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
            // that.setData(ret);
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
    app.doAjax({
      url: "../haola/homePages",
      method: "get",
      success: function(res){
        const testData = {
          "code": 0,
          "msg": "success",
          "resultObject": {
            "navigation": {
              "name": "导航",
              "type": 1,
              "isShow": 1,
              "data": [
                {
                  "id": "5ec631a9d5529d0009410139",
                  "name": "经典测试",
                  "picture": "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJ7IibHdlO45pMJLDYI0WDibHuuKMrxNzrdzuf8pBib8MzbiaIxrl0icTD7u9eadm8zuYElF9JlBMYZbog/132",
                  "columnId": "5ec63174d5529d0009410132",
                  "columnName": "经典测试",
                  "order": 1
                },
                {
                  "id": "5ec63174d5529d0009410132",
                  "name": "测程序员",
                  "picture": "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJ7IibHdlO45pMJLDYI0WDibHuuKMrxNzrdzuf8pBib8MzbiaIxrl0icTD7u9eadm8zuYElF9JlBMYZbog/132",
                  "columnId": "5ec6313fd5529d000941012e",
                  "columnName": "测程序员",
                  "order": 1
                },
                {
                  "id": "5ec6313fd5529d000941012e",
                  "name": "销售技能",
                  "picture": "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJ7IibHdlO45pMJLDYI0WDibHuuKMrxNzrdzuf8pBib8MzbiaIxrl0icTD7u9eadm8zuYElF9JlBMYZbog/132",
                  "columnId": "5ec630f0d5529d0009410127",
                  "columnName": "销售技能",
                  "order": 1
                },
                {
                  "id": "5ec630f0d5529d0009410127",
                  "name": "免费专区",
                  "picture": "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJ7IibHdlO45pMJLDYI0WDibHuuKMrxNzrdzuf8pBib8MzbiaIxrl0icTD7u9eadm8zuYElF9JlBMYZbog/132",
                  "columnId": "5e8fdee05c385800081a09f0",
                  "columnName": "免费专区",
                  "order": 1
                }
              ]
            },
            "recommend": {
              "name": "推荐阅读",
              "type": 2,
              "isShow": 0,
              "data": []
            },
            "new": {
              "name": "最新上架",
              "type": 3,
              "isShow": 1,
              "data": [
                {
                  "is_show": 0,
                  "column_id": "5e709a187796d90076273f46",
                  "name": "收费专区",
                  "type": 3,
                  "picture": "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJ7IibHdlO45pMJLDYI0WDibHuuKMrxNzrdzuf8pBib8MzbiaIxrl0icTD7u9eadm8zuYElF9JlBMYZbog/132",
                  "order": 1,
                  "column_name": "程序员技能",
                  "enabled": 1,
                  "objectId": "5e8fedd3158a7a0006be18cf",
                  "createdAt": "2020-04-10T03:53:55.858Z",
                  "updatedAt": "2020-05-23T03:31:52.716Z"
                },
                {
                  "is_show": 0,
                  "column_id": "5e709a187796d90076273f46",
                  "name": "收费专区",
                  "type": 3,
                  "picture": "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJ7IibHdlO45pMJLDYI0WDibHuuKMrxNzrdzuf8pBib8MzbiaIxrl0icTD7u9eadm8zuYElF9JlBMYZbog/132",
                  "order": 1,
                  "column_name": "程序员技能",
                  "enabled": 1,
                  "objectId": "5e8fedd3158a7a0006be18cf",
                  "createdAt": "2020-04-10T03:53:55.858Z",
                  "updatedAt": "2020-05-23T03:31:52.716Z"
                },
              ]
            },
            "hot": {
              "name": "本周热门",
              "type": 4,
              "isShow": 1,
              "data": []
            },
            "banner": {
              "name": "轮播图",
              "type": 0,
              "isShow": 1,
              "data": [
                {
                  "id": "5e9424346b3a57000970cc6e",
                  "picture": "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJ7IibHdlO45pMJLDYI0WDibHuuKMrxNzrdzuf8pBib8MzbiaIxrl0icTD7u9eadm8zuYElF9JlBMYZbog/132",
                  "order": 1,
                  "type": 1,
                  "linkId": "5e8fdee05c385800081a09f0"
                },
                {
                  "id": "5e9424816b3a57000970cd15",
                  "picture": "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJ7IibHdlO45pMJLDYI0WDibHuuKMrxNzrdzuf8pBib8MzbiaIxrl0icTD7u9eadm8zuYElF9JlBMYZbog/132",
                  "order": 1,
                  "type": 1,
                  "linkId": "5e8fdee05c385800081a09f0"
                }
              ]
            }
          }
        }
        // that.setData(res.resultObject);
        console.log("res.resultObject", res.resultObject)
        that.setData(res.resultObject);
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
  },
  gotoDetail: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../station/detail?id=${id}`
    })
  }
});
