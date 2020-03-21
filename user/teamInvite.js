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
  onLoad: function (options) {
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
        success: function (ret) {
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
    app.checkUser = function () {
      toCkeck();
      app.checkUser = null;
    };
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 返回首页
   */
  back: function () {
    // wx.switchTab({
    //   url: '../index/index'
    // });
    wx.switchTab({
      url: '../store/store'
    });
  },
  join: function () {
    //加入团队
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
  /**检查当前用户是否为团队成员 */
  checkTeamMember: function () {
    var that = this;
    app.doAjax({
      url: "checkTeamMember",
      data: {
        id: that.data.id
      },
      success: function (ret) {
        if (ret.isMember) {
          wx.showModal({
            title: '温馨提示',
            content: '您已是该团队成员',
            showCancel: false,
            success: function () {
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