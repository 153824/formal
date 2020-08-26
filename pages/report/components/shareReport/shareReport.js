// report/shareReport.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checked: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var id = options.id;
    var paperName = options.paperName;
    var username = options.username;
    this.setData({
      paperName: paperName,
      username: username,
      reportId: id
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
    var teamRole = app.teamRole;
    var that = this;
    app.doAjax({
      url: "myTeamDetail",
      method: "get",
      data: {
        id: app.teamId
      },
      success: function(ret) {
        if (!ret) return;
        var members = ret.members || [];
        var memberRole = ret.memberRole || {};
        var adminMember = []; //管理员
        var member = []; //普通成员
        members.forEach(function(node) {
          if (node) {
            var id = node.objectId;
            var role = memberRole[id] || 1;
            if (role == 2) {
              adminMember.push(node);
            } else {
              member.push(node);
            }
          }
        });
        ret["adminMember"] = adminMember;
        ret["member"] = member;
        ret["teamRole"] = teamRole;
        that.setData(ret);
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
    var t = e.target.dataset.t;
    var reportId = this.data.reportId;
    var userName = app.globalData.userInfo.nickname || "";
    var shareKey = "teamMsg_" + app.teamId + "_1";
    var path = 'pages/report/report?id=' + reportId;
    var paperName = this.data.paperName;
    var username = this.data.username;
    var title = userName + "邀请你查看" + username + "的" + paperName + "报告";
    if (t == 2) {
      //邀请入团
      path = "pages/user/components/teamInvite/teamInvite?key=" + shareKey;
      if (this.data.checked) {
        //同时分享报告
        path = 'pages/report/report?id=' + reportId + "&key=" + shareKey;
      } else {
        title = userName + "邀请你加入团队";
      }
      app.doAjax({
        url: "getTeamInvite",
        data: {
          id: app.teamId,
          role: 1
        },
        success: function(ret) {}
      });
    }
    return {
      title: title,
      path: path,
      imageUrl: "http://ihola.luoke101.com/wxShareImg.png"
    };
  },
  /**
   * 切换分享报告勾选
   */
  checkIt: function() {
    this.setData({
      checked: !this.data.checked
    });
  }
})
