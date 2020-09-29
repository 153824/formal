// user/myTeam.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    adminNum: 1,
    memberNum: 2
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
    if (!app.teamId) return wx.navigateBack();
    var isvip0 = wx.getStorageSync("isvip0");
    var isvip1 = wx.getStorageSync("isvip1");
    var isvip2 = wx.getStorageSync("isvip2");
    var isvip3 = wx.getStorageSync("isvip3");
    var isvip4 = wx.getStorageSync("isvip4");
    var adminNum = 1;
    var memberNum = -1;
    if (isvip0) {
      adminNum = 2;
      memberNum = -1;
    }
    if (isvip1) {
      adminNum = -1;
      memberNum = -1;
    }
    if (isvip2) {
      adminNum = 4;
      memberNum = -1;
    }
    if (isvip3) {
      adminNum = 6;
      memberNum = -1;
    }
    if (isvip4) {
      adminNum = 8;
      memberNum = -1;
    }
    var that = this;
    app.doAjax({
      url: "myTeamDetail",
      method: "get",
      data: {
        id: app.teamId
      },
      success: function(res) {
        adminNum = res.adminMemberMax || adminNum;
        let members = res.members || [];
        let memberRole = res.memberRole || {};
        let adminMember = []; //管理员
        let member = []; //普通成员
        members.forEach(function(node) {
          if (node) {
            let id = node.objectId;
            let role = memberRole[id] || 1;
            if (role === 2) {
              adminMember.push(node);
            } else {
              member.push(node);
            }
          }
        });
        res["adminNum"] = adminNum;
        res["adminMember"] = adminMember;
        res["member"] = member;
        that.setData(res);
      }
    });
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
    var role = e.target.dataset.role;
    var shareKey = "teamMsg_" + app.teamId + "_" + role;
    return {
      title: "邀请加入团队",
      path: "pages/user/components/teamInvite/teamInvite?key=" + shareKey,
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
      return;
    }
    var role = +d.role || 1;
    app.doAjax({
      url: "getTeamInvite",
      data: {
        id: app.teamId,
        role: role
      },
      success: function(res) {}
    });
  },
  /**
   * 移除子管理员权限
   */
  delMember: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var obj = that.data.adminMember[index];
    wx.showModal({
      title: '取消子管理员权限',
      content: '确定将该成员降为普通成员吗',
      success: function(ret) {
        if (ret.confirm) {
          app.doAjax({
            url: "updateTeamMember",
            data: {
              id: app.teamId,
              type: 2,
              role: 1,
              teamUserId: obj.objectId
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
   * 编辑子管理员
   */
  showEditMenu1: function(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    const obj = that.data.adminMember[index];
    wx.showModal({
      title: "移除成员",
      content: "确定将该成员从团队中移除吗?",
      success: function (res) {
        if(res.confirm){
          const postData = {
            id: app.teamId,
            type: 3,
            teamUserId: obj.objectId
          };
          app.doAjax({
            url: "updateTeamMember",
            data: postData,
            success: function() {
              app.toast("操作成功");
              that.onShow();
            }
          });
        }
      }
    });
    // wx.showActionSheet({
    //   itemList: ['移除成员', '降为普通成员'],
    //   success(res) {
    //     var tapIndex = res.tapIndex;
    //     var t = "移除成员";
    //     var txt = "确定将该成员从团队中移除吗";
    //     var postData = {
    //       id: app.teamId,
    //       type: 3,
    //       teamUserId: obj.objectId
    //     };
    //     if (tapIndex == 1) {
    //       //降为普通成员
    //       t = "降为普通成员";
    //       txt = "确定将该成员降为普通成员吗";
    //       postData = {
    //         id: app.teamId,
    //         type: 2,
    //         role: 1,
    //         teamUserId: obj.objectId
    //       };
    //     }
    //     wx.showModal({
    //       title: t,
    //       content: txt,
    //       success: function(ret) {
    //         if (ret.confirm) {
    //           app.doAjax({
    //             url: "updateTeamMember",
    //             data: postData,
    //             success: function() {
    //               app.toast("操作成功");
    //               that.onShow();
    //             }
    //           });
    //         }
    //       }
    //     });
    //   },
    //   fail(res) {
    //     console.log(res.errMsg)
    //   }
    // });
  },
  /**
   * 编辑普通成员
   */
  showEditMenu: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var obj = that.data.member[index];
    wx.showActionSheet({
      itemList: ['移除成员', '升级为子管理员'],
      success(res) {
        var tapIndex = res.tapIndex;
        var t = "移除成员";
        var txt = "确定将该成员从团队中移除吗";
        var postData = {
          id: app.teamId,
          type: 3,
          teamUserId: obj.objectId
        };
        if (tapIndex == 1) {
          //升级为子管理员
          t = "升级为子管理员";
          txt = "确定将该成员升级为子管理员吗";
          postData = {
            id: app.teamId,
            type: 2,
            role: 2,
            teamUserId: obj.objectId
          };
        }
        wx.showModal({
          title: t,
          content: txt,
          success: function(ret) {
            if (ret.confirm) {
              app.doAjax({
                url: "updateTeamMember",
                data: postData,
                success: function() {
                  app.toast("操作成功");
                  that.onShow();
                }
              });
            }
          }
        });
      },
      fail(res) {
        console.error(res.errMsg)
      }
    });
  },
  /**
   * 转让超级管理员
   */
  changeAdminUser: function(e) {
    var data = this.data;
    var list = data.adminMember.concat(data.member);
    wx.setStorageSync("teamMembers", list);
    wx.navigateTo({
      url: '../selTeamAdmin/selTeamAdmin'
    });
  }
})
