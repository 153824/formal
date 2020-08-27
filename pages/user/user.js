const app = getApp();
Page({
  data: {
    showDlg: false,
    teamId: "",
    isIos: false,
    showLogin: false,
    showAddNewTeam: false,
    statusbarHeight: app.globalData.statusbarHeight,
    titleHeight: app.globalData.titleHeight,
    showDlg2: false,
    showServing: false,
    mobile: "18559297592",
    wechat: "haola72"
  },
  onLoad: function(options) {
    var that = this;
    app.getUserInfo(that.loadUserMsg);
    this.setData({
      isIos: app.isIos
    });
    wx.setNavigationBarTitle({
      title: ""
    })
  },
  onShow: function() {
    var that = this;
    app.getUserInfo(that.loadUserMsg);
  },
  loadUserMsg: function() {
    const userData = app.globalData.userInfo || wx.getStorageSync("userInfo");
    this.setData({
      userInfo: userData
    });
    this.getMyTeamList();
  },

  changePage: function(e) { //页面跳转
    var d = e.currentTarget.dataset;
    if (d.n && d.n == "teams") {
      //企业认证
      wx.setStorageSync("oldTeamMsg", this.data.nowTeam.certConfig);
    }
    app.changePage(d.url, d.tab);
  },
  /**
   * 获取微信用户信息
   */
  getUserInfo: function(e) {
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
      success: function(res) {
        that.hideLoginDlg();
        app.globalData.userInfo.nickname = userInfo.nickName;
        app.addNewTeam(that.onShow);
      }
    });
  },
  /**
   * 显示登陆弹窗
   */
  showLoginDlg: function(e) {
    this.setData({
      showLogin: true
    });
  },
  /**
   * 隐藏登陆弹窗
   */
  hideLoginDlg: function(e) {
    this.setData({
      showLogin: false
    });
  },
  /**
   * 获取团队列表
   */
  getMyTeamList: function(e) {
    var that = this;
    app.getMyTeamList(function(list) {
      var teamNames = [];
      list.forEach(function(node) {
        teamNames.push(node.name);
      });
      that.setData({
        teamId: app.teamId,
        teamRole: app.teamRole,
        nowTeam: list[0],
        teamList: list,
        selTeam: 0,
        teamNames: teamNames
      });
    },false);
  },
  /**
   * 切换团队
   */
  changeTeam: function(e) {
    var val = e.detail.value;
    var data = this.data;
    var teamList = data.teamList;
    var nowTeam = teamList[val];
    if (!nowTeam) {
      //创建新团队
      this.setData({
        showAddNewTeam: true
      });
      return;
    }
    app.teamId = nowTeam.objectId;
    app.teamName = nowTeam.name;
    app.teamRole = nowTeam.role;
    app.globalData.team = nowTeam;
    wx.setStorageSync("MY_TEAM_ID", app.teamId);
    this.setData({
      nowTeam: nowTeam,
      selTeam: val,
      teamId: app.teamId,
      teamRole: app.teamRole,
    });
    this.loadUserMsg();
  },
  /**
   * 退出团队
   */
  outTeam: function() {
    var that = this;
    wx.showModal({
      title: '退出团队提醒',
      content: '确认退出该团队？',
      success: function(ret) {
        if (ret.confirm) {
          app.doAjax({
            url: "updateTeamMember",
            data: {
              id: app.teamId,
              type: 7
            },
            method: "POST",
            success: function() {
              that.onShow();
            }
          });
        }
      }
    });
  },
  /**
   * 显示权限说明弹窗
   */
  toShowDlg: function() {
    this.setData({
      showDlg2: true
    });
  },
  /**
   * 隐藏权限说明弹窗
   */
  hideDlg: function() {
    this.setData({
      showDlg2: false
    });
  },

  buyTicket: function (e) {
    const { type } = e.currentTarget.dataset,
          { userId,teamId } = app,
          openid = wx.getStorageSync("openId") || app.globalData.userMsg.openid;
    app.doAjax({
      url: "buyTickets",
      method: "post",
      data: {
        userId,
        teamId,
        type,
        openid,
        mp_openid: ""
      },
      success: function (res) {
        wx.requestPayment(res);
      }
    })
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
    var wechat = this.properties.wechat;
    wx.setClipboardData({
      data: wechat,
      success(res) {

      }
    });
  },
  callIt: function() {
    var phoneNumber = this.properties.mobile;
    wx.makePhoneCall({
      phoneNumber: phoneNumber //仅为示例，并非真实的电话号码
    })
  },
  hideDlg: function() {
    this.setData({
      showServing: false
    });
  }
});
