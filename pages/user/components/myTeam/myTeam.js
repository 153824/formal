// user/myTeam.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    adminNum: 1,
    memberNum: 2,
    adminUser: {},
    adminMemberMax: 1,
    members: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const {teamId} = wx.getStorageSync('userInfo')
    if (!teamId) return wx.navigateBack();
    this.loadAdminInfo()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    const teamId = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').teamId : '';
    return {
      title: "邀请加入团队",
      path: `pages/user/components/teamInvite/teamInvite?inviteId=${teamId}`,
      imageUrl: "http://ihola.luoke101.com/wxShareImg.png"
    };
  },
  /**
   * 邀请用户
   */
  inviteMember: function(e) {
    var d = e.currentTarget.dataset;
    var n = d.n;
    var num = d.num;
    if (n && num > 0) {
      app.toast("当前会员版本仅支持" + num + "位" + n + "，请升级或删除现有" + n);
    }
  },

  /**
   * 移除子管理员
   */
  remove(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    const obj = that.data.members[index];
    console.log(obj);
    wx.showModal({
      title: "移除成员",
      content: "确定将该成员从团队中移除吗?",
      success: function (res) {
        if(res.confirm){
          const postData = {
            id: wx.getStorageSync('userInfo').teamId,
            type: 3,
            teamUserId: obj.id
          };
          app.doAjax({
            url: "../wework/collaborators",
            method: 'DELETE',
            data: {
              userId: obj.id
            },
            success: function() {
              app.toast("操作成功");
              that.onShow();
            }
          });
        }
      }
    });
  },

  /**
   * 转让超级管理员
   */
  changeAdminUser: function(e) {
    const {members} = this.data;
    wx.setStorageSync("teamMembers", members);
    wx.navigateTo({
      url: '../selTeamAdmin/selTeamAdmin'
    });
  },


  loadAdminInfo() {
    const that = this;
    app.doAjax({
      url: '../wework/collaborators',
      method: 'GET',
      success(res) {
        const {adminUser, adminMemberMax, members} = res;
        that.setData({
          adminUser,
          adminMemberMax,
          members
        })
      },
    })
  }
});
