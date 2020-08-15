//index.js
var app = getApp();
Page({
  data: {
    teamRole: app.teamRole,
    showTopGift: false,
    showGiftDlg: false,
    statusbarHeight: app.globalData.statusbarHeight,
    titleHeight: app.globalData.titleHeight,
    navigationSet: [],
    teamEvaluation: [],
    isIos: app.isIos,
    loading: true,
    loading2: true,
    mobile: "18559297592",
    wechat: "haola72",
    active: 0,
  },
  onLoad: function(options) {
    wx.hideTabBar({
      animation: true
    });
    var that = this;
    var homePagesPromiseList = [],
        teamEvaluationPromiseList = [];
    const homePagesPromise = new Promise(function (resolve,reject) {
      app.doAjax({
        url: "homePages",
        method: "get",
        noLoading: true,
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
            url: `homePages/columns/${ v.column_id }/evaluations`,
            method: "get",
            noLoading: true,
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
        column: targetColumn,
        loading: false
      });
      setTimeout(()=>{
        wx.showTabBar({
          animation: true
        });
      },500);
    }).catch(err=>{
      setTimeout(()=>{
        wx.showTabBar();
      },500);
      that.setData({
        loading: false
      })
    });
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
    };
    /**
     * @Description: 专属测评
     * @author: WE!D
     * @args:
     * @return: Promise Array
     * @date: 2020/6/17
    */
    // const teamEvaluationPromise = new Promise(function (resolve,reject) {
    //   app.doAjax({
    //     url: `../haola/homePages/userPagers?teamId=${app.teamId}`,
    //     method: "get",
    //     success: function (res) {
    //       resolve(res.data);
    //     },
    //     fail: function (err) {
    //       reject(err);
    //     }
    //   });
    // });
    // teamEvaluationPromise.then(res=>{
    //   teamEvaluationPromiseList = res.map((v,k)=>{
    //     return(new Promise((resolve, reject) => {
    //       app.doAjax({
    //         url: `../hola/paperDetail?id=${v.paper.objectId}&userId=${app.globalData.userInfo.userId}`,
    //         method: "get",
    //         success: function (res) {
    //           resolve( res );
    //         },
    //         fail: function (err) {
    //           reject(err);
    //         }
    //       });
    //     }))
    //   });
    //   return Promise.all(teamEvaluationPromiseList);
    // }).then(res=>{
    //   that.setData({
    //     teamEvaluation: res
    //   })
    // }).catch(err=>{
    // }).finally(()=>{
    //   that.setData({
    //     loading2: false
    //   })
    // });
    this.title = this.selectComponent("#title");
    app.getUserInfo(this.title.loadUserMsg.call(this.title._this()));
  },
  onHide: function () {},
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
              noLoading: true,
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
