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
    navigationSet: [],
    teamEvaluation: [],
    isIos: app.isIos,
    loading1: true,
    loading2: true,
    mobile: "18559297592",
    wechat: "LIN_7890"
  },
  onLoad: function(options) {
    this.setData({
      loading1: true,
      loading2: true,
    });
    var that = this;
    var skipFreeTicket = wx.getStorageSync("skipFreeTicket");
    firstLoad = true;
    console.log("app.globalData: ",app.globalData);
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

        var homePagesPromiseList = [],
            teamEvaluationPromiseList = [];
        const homePagesPromise = new Promise(function (resolve,reject) {
          app.doAjax({
            url: "../haola/homePages",
            method: "get",
            success: function(res){
              resolve( res.resultObject );
            },
            fail: function (err) {
              reject( err )
            }
          });
        });
        homePagesPromise.then(res=>{
          that.setData(res);
          homePagesPromiseList = res.column.map((v,k)=>{
            return new Promise((resolve, reject) => {
              app.doAjax({
                url: `../haola/homePages/columns/${ v.column_id }/evaluations`,
                method: "get",
                success: function (res) {
                  resolve({ columnId: v.column_id, data: res.data});
                },
                fail: function (err) {
                  reject(err);
                }
              });
            })
          });
          return Promise.all(homePagesPromiseList)
        }).then(res=>{
          const { column } = that.data;
          var targetColumn = column;
          for( let i = 0; i < res.length;i++ ){
            for( let j = 0; j < column.length;j++ ){
              if( res[i].columnId === targetColumn[j].column_id ){
                targetColumn[j]["data"] = res[i].data || [];
                // break;
              }
            }
          };
          that.setData({
            column: targetColumn
          });
        }).finally(()=>{
          that.setData({
            loading1: false
          })
        });

        const teamEvaluationPromise = new Promise(function (resolve,reject) {
          app.doAjax({
            url: `../haola/homePages/userPagers?teamId=${app.teamId}`,
            method: "get",
            success: function (res) {
              resolve(res.data);
            },
            fail: function (err) {
              reject(err);
            }
          });
        });
        teamEvaluationPromise.then(res=>{
          teamEvaluationPromiseList = res.map((v,k)=>{
            return(new Promise((resolve, reject) => {
              app.doAjax({
                url: `../hola/paperDetail?id=${v.paper.objectId}&userId=${app.globalData.userInfo.userId}`,
                method: "get",
                success: function (res) {
                  resolve( res );
                },
                fail: function (err) {
                  reject(err);
                }
              });
            }))
          });
          return Promise.all(teamEvaluationPromiseList);
        }).then(res=>{
          console.log(res);
          that.setData({
            teamEvaluation: res
          })
        }).catch(err=>{
        }).finally(()=>{
          that.setData({
            loading2: false
          })
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
  },
  onShow: function() {
    console.log("app.globalData: ",app.globalData);
    this.title = this.selectComponent("#title");
    app.getUserInfo(this.title.loadUserMsg.call(this.title._this()));
    var that = this;
    app.freeTickId = "";
    if (!app.isLogin) {
      app.checkUser = function() {
        that.onShow();
        app.checkUser = null;
      };
      return;
    };
    var homePagesPromiseList = [],
        teamEvaluationPromiseList = [];
    const homePagesPromise = new Promise(function (resolve,reject) {
      app.doAjax({
        url: "../haola/homePages",
        method: "get",
        success: function(res){
          resolve( res.resultObject );
        },
        fail: function (err) {
          reject( err )
        }
      });
    });
    homePagesPromise.then(res=>{
      that.setData(res);
      homePagesPromiseList = res.column.map((v,k)=>{
        return new Promise((resolve, reject) => {
          app.doAjax({
            url: `../haola/homePages/columns/${ v.column_id }/evaluations`,
            method: "get",
            success: function (res) {
              resolve({ columnId: v.column_id, data: res.data});
            },
            fail: function (err) {
              reject(err);
            }
          });
        })
      });
      return Promise.all(homePagesPromiseList)
    }).then(res=>{
      const { column } = that.data;
      var targetColumn = column;
      for( let i = 0; i < res.length;i++ ){
        for( let j = 0; j < column.length;j++ ){
          if( res[i].columnId === targetColumn[j].column_id ){
            targetColumn[j]["data"] = res[i].data || [];
            // break;
          }
        }
      };
      that.setData({
        column: targetColumn
      });
    }).finally(()=>{
      that.setData({
        loading1: false
      })
    });

    const teamEvaluationPromise = new Promise(function (resolve,reject) {
      app.doAjax({
        url: `../haola/homePages/userPagers?teamId=${app.teamId}`,
        method: "get",
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err);
        }
      });
    });
    teamEvaluationPromise.then(res=>{
      teamEvaluationPromiseList = res.map((v,k)=>{
        return(new Promise((resolve, reject) => {
          app.doAjax({
            url: `../hola/paperDetail?id=${v.paper.objectId}&userId=${app.globalData.userInfo.userId}`,
            method: "get",
            success: function (res) {
              resolve( res );
            },
            fail: function (err) {
              reject(err);
            }
          });
        }))
      });
      return Promise.all(teamEvaluationPromiseList);
    }).then(res=>{
      console.log(res);
      that.setData({
        teamEvaluation: res
      })
    }).catch(err=>{
    }).finally(()=>{
      that.setData({
        loading2: false
      })
    });
  },
  onHide: function () {

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
    wx.aldstat.sendEvent('首页点击推荐阅读', {
            '文章名称': '名称：' + url
    });
  },
  changePage: function(e) {
    //页面跳转
    var d = e.currentTarget.dataset;
    var { name } = e.currentTarget.dataset;
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
        wx.aldstat.sendEvent('首页进入测评详情', {
                '测评名称': '名称：' + name
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

    if( id.startsWith("http") ){
      wx.setStorageSync("webView_Url", id);
      wx.navigateTo({
        url: '../common/webView',
      });
      wx.aldstat.sendEvent('查看Banner详情', {
              'Banner名称': 'id' + id
            });
      return;
    }
    wx.navigateTo({
      url: `../station/detail?id=${ id }`,
      success: function(){
        wx.aldstat.sendEvent('查看Banner详情', {
                'Banner名称': 'id' + id
              });
      }
    });

  },
  gotoMore: function (e) {
    const { id,name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../station/more?id=${ id }&title=${name}`,
      success: ()=>{
        wx.aldstat.sendEvent('导航点击', {
                '导航名称': '名称：' + name
              });
      }
    });
  },
  callServing: function (e) {
    this.setData({
      showServing: true
    });
  },
  hideServing: function (e) {
    this.setData({
      showServing: false
    });
  },
  copyIt: function() {
    var { wechat } = this.data;
    wx.setClipboardData({
      data: wechat,
      success(res) {

      }
    });
  },
  hideDlg: function() {
    this.setData({
      showServing: false
    });
  }
});
