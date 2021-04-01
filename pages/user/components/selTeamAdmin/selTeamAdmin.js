// user/selTeamAdmin.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selUser: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var teamMembers = wx.getStorageSync("teamMembers");
    wx.removeStorageSync("teamMembers");
    this.setData({
      list: teamMembers
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
  onShow: function() {

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
   * 选中该成员
   */
  selIt: function(e) {
    var index = e.currentTarget.dataset.index;
    var obj = this.data.list[index];
    this.setData({
      selUser: obj.id,
      selUserName: obj.nickName || obj.realName
    });
  },
  /**
   * 确认移交超级管理员权限
   */
  sure: function() {
    var that = this;
    var id = that.data.selUser;
    if (!id) return;
    wx.showModal({
      title: '移交超级管理员',
      content: '您将移交超级管理员权限给\n “' + that.data.selUserName + '”',
      success: function(ret) {
        if (ret.confirm) {
          app.doAjax({
            url: "updateTeamMember",
            data: {
              id: app.teamId,
              type: 5,
              teamUserId: id
            },
            success: function() {
              app.toast("操作成功");
              wx.switchTab({
                url: '../../../station/station'
              });
            }
          });
        }
      }
    })
  }
})
