// user/teamInvite.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPage: false,
    inviteId: "",
    name: "",
    canIUseGetUserProfile: !!wx.getUserProfile ? true : false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    if(!options.inviteId){
      app.toast('缺少团队邀请码');
      return;
    }
    this.setData({
      inviteId: options.inviteId,
      showPage: true,
    })
  },

  onShow() {
    this.getInviteInfo()
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

  getInviteInfo() {
    const that = this;
    const {inviteId} = this.data;
    const shareKey = `teamMsg_${inviteId}_${2}`;
    app.doAjax({
      url: "getTeamInvite",
      data: {
        key: shareKey
      },
      success: function(res) {
        that.setData({
          name: res.name
        })
      }
    });
  },

  join() {
    const {inviteId} = this.data;
    app.doAjax({
      url: "../wework/collaborators",
      method: 'POST',
      data: {
        teamId: inviteId
      },
      success(res) {
        app.toast('加入成功')
        wx.clearStorage();
        setTimeout(()=>{
          wx.reLaunch({
            url: '/pages/home/home'
          });
        },500)
      },
    })
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
})
