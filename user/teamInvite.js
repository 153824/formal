// user/teamInvite.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPage: false,
    id: "",
    name: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var key = options.key;
    if (options.q) {
      options.q = decodeURIComponent(options.q);
      key = options.q.split("?")[1].replace("key=", "");
    }
    var reportId = options.reportId || "";
    if (!key) {
      this.setData({
        showPage: true
      });
      return;
    }
    var that = this;

    function toCkeck() {
      app.doAjax({
        url: "getTeamInvite",
        data: {
          key: key
        },
        success: function(ret) {
          ret = ret || {};
          ret["reportId"] = reportId;
          ret["showPage"] = true;
          that.setData(ret);
          that.checkTeamMember();
        }
      });
    }
    if (app.isLogin) {
      toCkeck();
      return;
    }
    app.checkUser = function() {
      toCkeck();
      app.checkUser = null;
    };
    // var that = this;
    //查看是否授权
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          console.log("用户授权了");
        } else {
          //用户没有授权
          console.log("用户没有授权");
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
  onShow: function () {
    var that = this;
    console.log("jio222n...")
    // that.loadUserMsg();
    app.getUserInfo(that.loadUserMsg);
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
   * 返回首页
   */
  back: function() {
    // wx.switchTab({
    //   url: '../index/index'
    // });
    wx.switchTab({
      url: '../store/store'
    });
  },
  /**
    * 获取微信用户信息
    */
  getUserInfo: function (e) {
    var that = this;
    var userInfo = e.detail.userInfo;
    if (!userInfo) {
      console.error("获取用户资料失败", e);
      return;
    }
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
      success: function (res) {
        that.hideLoginDlg();
        app.globalData.userInfo.nickname = userInfo.nickName;
        app.addNewTeam(that.onShow);
      }
    });
  },
  join: function() {
    console.log("jion...")
    // //加入团队
    var that = this;
    var id = that.data.id;
    var role = +that.data.role;
    app.doAjax({
      url: "updateTeamMember",
      data: {
        id: id,
        type: 1,
        role: role
      },
      success: function () {
        app.teamId = id;
        app.teamName = that.data.name;
        app.getUserInfo();
        app.toast("操作成功");
        setTimeout(function () {
          if (that.data.reportId) {
            //进入报告详情
            wx.reLaunch({
              url: '../report/detail?id=' + that.data.reportId
            });
            return;
          }
          // wx.switchTab({
          //   url: '../index/index'
          // });
          wx.switchTab({
            url: '../store/store'
          });
        }, 1000);
      }
    });
  },
  bindGetUserInfo: function(res) {
    if (res.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
    //  }
  },
  /**检查当前用户是否为团队成员 */
  checkTeamMember: function() {
    var that = this;
    app.doAjax({
      url: "checkTeamMember",
      data: {
        id: that.data.id
      },
      success: function(ret) {
        if (ret.isMember) {
          wx.showModal({
            title: '温馨提示',
            content: '您已是该团队成员',
            showCancel: false,
            success: function() {
              if (that.data.reportId) {
                //进入报告详情
                wx.reLaunch({
                  url: '../report/detail?id=' + that.data.reportId
                });
                return;
              }
              // wx.switchTab({
              //   url: '../index/index'
              // });
              wx.switchTab({
                url: '../store/store'
              });
            }
          })
        }
      }
    })
  }
})