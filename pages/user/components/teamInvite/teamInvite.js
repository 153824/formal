// user/teamInvite.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPage: false,
    id: "",
    name: "",
    canIUseGetUserProfile: !!wx.getUserProfile ? true : false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let key = options.key;
    if (options.q) {
      options.q = decodeURIComponent(options.q);
      key = options.q.split("?")[1].replace("key=", "");
    }
    const reportId = options.reportId || "";
    if (!key) {
      this.setData({
        showPage: true
      });
      return;
    }
    const that = this;

    function toCheck() {
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
    toCheck();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
    wx.switchTab({
      url: '../../../station/station'
    });
  },
  /**
    * 获取微信用户信息
    */
  getUserInfo: function (e) {
    app.updateUserInfo(e).then(res=>{}).catch(err=>{
      console.error(err);
    });
  },

  getUserProfile() {
    wx.getUserProfile({
      success(res) {
        app.updateUserInfo(res).then(res=>{}).catch(err=>{
          console.error(err);
        });
      }
    })
  },
  join: function() {
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
      success: function (res) {
        app.teamId = id;
        app.teamName = that.data.name;
        app.toast("操作成功");
        wx.clearStorage();
        wx.setStorageSync('TARGET_TEAM_ID',id);
        setTimeout(function () {
          if (that.data.reportId) {
            //进入报告详情
            wx.reLaunch({
              url: '/pages/report/report?id=' + that.data.reportId
            });
            return;
          }
          app.toast("正在为您跳转...");
          setTimeout(()=>{
            wx.reLaunch({
              url: '/pages/home/home'
            });
          },500)
        }, 500);
      }
    });
  },
  bindGetUserInfo: function(res) {
    if (res.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false
      });
    } else {
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
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
                  url: '../../../report/report?id=' + that.data.reportId
                });
                return;
              }
              wx.switchTab({
                url: '../../../station/station'
              });
            }
          })
        }
      }
    })
  }
})
