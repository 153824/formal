// index/manage/manage.js
var app = getApp();
var paperId = "";
let page = 1;
Page({
  data: {
    order: 0,
    orderArr: ["按时间排序", "按姓名排序"],

    teamRole: app.teamRole,
    hasNewReoprt: false,
    mpImg: "../img/mpImg.png",
    vip: false,
    showPage: false,
    showDlg: false,
    dati: false
  },
  onLoad: function(options) {

  },
  onShow: function() {
    wx.setNavigationBarTitle({
      title: app.teamName || ""
    });
    if (app.teamRole == 1) {
      this.setData({
        teamRole: app.teamRole
      });
      this.getList();
      return;
    }
    var showDlg = wx.getStorageSync("showDlg");
    wx.removeStorageSync("showDlg");
    if (wx.getStorageSync("hasShowDlg_manage")) {
      showDlg = false;
    }
    wx.setStorageSync("hasShowDlg_manage", true);
    this.setData({
      vip: wx.getStorageSync("isvip1"),
      showDlg: showDlg || false
    });
    var that = this;
    app.getUserInfo(function() {
      app.doAjax({
        url: "sharePaperList",
        method: "get",
        noLoading: true,
        data: {
          type: 1,
          page: page,
          pageSize: 1000
        },
        success: function(res) {
          res.data.forEach(function(node) {
            node.createdAt = app.changeDate(node.createdAt, 'yyyy-MM-dd hh:mm');
          });
          var userData = app.globalData.userInfo || wx.getStorageSync("userInfo");
          that.setData({
            teamRole: app.teamRole,
            showPage: true,
            paperList: res.data.slice(0, 10),
            userData: userData
          });
          setTimeout(function() {
            that.setData({
              paperList: res.data
            })
          });
        }
      });
    });
    that.checkReoprtList();
  },
  /**
   * 检查是否有新报告
   */
  checkReoprtList: function() {
    var that = this;
    app.doAjax({
      url: "getReportList",
      method: "get",
      data: {
        isRead: false,
        page: page,
        pageSize: 12
      },
      success: function(ret) {
        var hasNewReoprt = false;
        if (ret.data.length) {
          hasNewReoprt = true;
        }
        that.setData({
          showPage: true,
          hasNewReoprt: hasNewReoprt
        });
      }
    });
  },
  sticktop: function(e) {
    var that = this;
    app.doAjax({
      url: "changePaperTop",
      method: "post",
      data: {
        id: e.currentTarget.dataset.id,
      },
      success: function(res) {
        console.log(res)
        that.onShow()
      }
    })
  },

  gotodati: function(e) {
    // console.log(e)
    // var that = this;
    // paperId = e.target.dataset.id;
    // app.doAjax({
    //   url: 'toSharePaper',
    //   method: 'post',
    //   data: {
    //     id: e.target.dataset.id,
    //   },
    //   success: function(res) {
    //     console.log(res)
    //     that.setData({
    //       pictureUrl: res.img,
    //       dati: true
    //     })
    //     that.onShow()
    //   }
    // })
    wx.aldstat.sendEvent('测评管理页点击发测评', {
      '触发点击': '点击数'
    });
    var d = e.currentTarget.dataset;
    var url = d.url;
    wx.navigateTo({
      url: url,
    });
  },
  closedati: function(e) {
    console.log(JSON.stringify(e))
    this.setData({
      dati: false
    })
    wx.redirectTo({
      url: '../store/sendlog?id=' + paperId
    })
  },
  changePage: function(e) {
    //页面跳转
    var d = e.currentTarget.dataset;
    var child = e.target.dataset.child;
    var child1 = e.currentTarget.dataset.child;
    if (child && !child1) return;
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
    this.hideDlg();
  },
  /**
   * 用户授权
   */
  getUserInfo: function(e) {
    var that = this;
    var userInfo = e.detail.userInfo;
    if (!userInfo) return;
    userInfo["openid"] = wx.getStorageSync("openId") || app.globalData.userMsg.openid;
    userInfo["unionid"] = wx.getStorageSync("unionId") || app.globalData.userMsg.unionid;
    app.doAjax({
      url: "updateUserMsg",
      method: "post",
      data: {
        data: JSON.stringify({
          wxUserInfo: userInfo,
          userCompany: {
            name: userInfo.nickName + "的团队"
          }
        }),
      },
      success: function(res) {
        that.onShow();
        app.globalData.userInfo.nickname = userInfo.nickName;
        app.addNewTeam();
      }
    });
  },
  /**
   * 隐藏弹窗
   */
  hideDlg: function(e) {
    this.setData({
      showDlg: false
    });
  },
  /**报告部分接口 */
  /**
   * 获取报告列表
   */
  getList: function() {
    var that = this;
    app.doAjax({
      url: "getReportList",
      method: "get",
      data: {
        isMember: true,
        page: 1,
        pageSize: 12
      },
      success: function(ret) {
        ret.data.forEach(function(node) {
          node.report = node.report || {};
          if (node.report.finishTime) {
            node.finishTime = node.report.finishTime;
            node.report.finishTime = app.changeDate(node.report.finishTime, "yyyy-MM-dd hh:mm");
            node.report.finishTime = node.report.finishTime.substring(2);
          }
        });
        ret.data.sort(function(n1, n2) {
          //创建时间倒序
          var it1 = new Date(n1.finishTime).getTime();
          var it2 = new Date(n2.finishTime).getTime();
          return it2 - it1;
        });
        that.setData({
          list: ret.data
        });
      }
    });
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var that = this;
    console.log("onPullDownRefresh")
    setTimeout(function(ope) {
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    }, 1500)
    // wx.request({
    //   url: 'https://xxx/?page=0',
    //   method: "GET",
    //   header: {
    //     'content-type': 'application/text'
    //   },
    //   success: function (res) {
    //     that.setData({
    //       moment: res.data.data
    //     });
    //     console.log(that.data.moment);
    //    
    //   }
    // })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    // 显示加载图标
    console.log("onReachBottom")
    wx.showLoading({
      title: '正在加载中...',
    })

    // // 页数+1
    // page = page + 1;
    // wx.request({
    //   url: 'https://xxx/?page=' + page,
    //   method: "GET",
    //   // 请求头部
    //   header: {
    //     'content-type': 'application/text'
    //   },
    //   success: function (res) {
    //     // 回调函数
    //     var moment_list = that.data.moment;
    //     const oldData = that.data.moment;
    //     that.setData({
    //       moment: oldData.concat(res.data.data)
    //     })
    //     // 隐藏加载框
    //     wx.hideLoading();
    //   }
    // })
    app.doAjax({
      url: "getReportList",
      method: "get",
      data: {
        isMember: true,
        page: page,
        pageSize: 12
      },
      success: function(ret) {
        // 隐藏加载框
        wx.hideLoading();
        ret.data.forEach(function(node) {
          node.report = node.report || {};
          if (node.report.finishTime) {
            node.finishTime = node.report.finishTime;
            node.report.finishTime = app.changeDate(node.report.finishTime, "yyyy-MM-dd hh:mm");
            node.report.finishTime = node.report.finishTime.substring(2);
          }
        });
        ret.data.sort(function(n1, n2) {
          //创建时间倒序
          var it1 = new Date(n1.finishTime).getTime();
          var it2 = new Date(n2.finishTime).getTime();
          return it2 - it1;
        });
        that.setData({
          list: list.push(ret.data)
        });

      }
    });
  },
  /**
   * 进入报告详情
   */
  toDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var obj = this.data.list[index];
    wx.navigateTo({
      url: '../report/detail?id=' + obj.id + "&name=" + obj.paper.name
    });
  },
  /**
   * 切换排序
   */
  changeOrder: function(e) {
    var value = e.detail.value;
    var list = this.data.list || [];
    list.sort(function(n1, n2) {
      if (value == 1) {
        //名字顺序排序
        var it1 = n1.people.name.substring(0, 1).charCodeAt();
        var it2 = n2.people.name.substring(0, 1).charCodeAt();
        return it2 - it1;
      } else {
        //创建时间倒序
        var it1 = new Date(n1.finishTime).getTime();
        var it2 = new Date(n2.finishTime).getTime();
        return it2 - it1;
      }
    });
    this.setData({
      list: list,
      order: +value
    });
  }
})