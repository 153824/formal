// user/index.js
var app = getApp();
Page({
  data: {
    showDlg: false,
    teamId: "",
    isIos: false,
    showLogin: false,
    vip0: false,
    vip1: false,
    vip2: false,
    vip3: false,
    vip4: false,
    showAddNewTeam: false,
    statusbarHeight: app.globalData.statusbarHeight,
    titleHeight: app.globalData.titleHeight,
  },
  onLoad: function(options) {
    this.setData({
      isIos: app.isIos
    });
  },
  onShow: function() {
    var that = this;
    // that.loadUserMsg();
    app.getUserInfo(that.loadUserMsg);
  },
  loadUserMsg: function() {
    var userData = app.globalData.userInfo || wx.getStorageSync("userInfo");
    var teamData = app.globalData.team || userData;
    var vip0EndTime = teamData.vip0EndTime;
    var vipEndTime = teamData.vipEndTime;
    var vip2EndTime = teamData.vip2EndTime;
    var vip3EndTime = teamData.vip3EndTime;
    var vip4EndTime = teamData.vip4EndTime;
    var now = new Date().getTime();
    var vip0 = false;
    var vip1 = false;
    var vip2 = false;
    var vip3 = false;
    var vip4 = false;
    if (vip0EndTime) {
      vip0EndTime = new Date(vip0EndTime).getTime();
      userData.vip0EndTime = app.changeDate(vip0EndTime, "yyyy.MM.dd");
    }
    if (vipEndTime) {
      vipEndTime = new Date(vipEndTime).getTime();
      userData.vipEndTime = app.changeDate(vipEndTime, "yyyy.MM.dd");
    }
    if (vip2EndTime) {
      vip2EndTime = new Date(vip2EndTime).getTime();
      userData.vip2EndTime = app.changeDate(vip2EndTime, "yyyy.MM.dd");
    }
    if (vip3EndTime) {
      vip3EndTime = new Date(vip3EndTime).getTime();
      userData.vip3EndTime = app.changeDate(vip3EndTime, "yyyy.MM.dd");
    }
    if (vip4EndTime) {
      vip4EndTime = new Date(vip4EndTime).getTime();
      userData.vip4EndTime = app.changeDate(vip4EndTime, "yyyy.MM.dd");
    }
    if (vip0EndTime && vip0EndTime > now) {
      vip0 = true;
    }
    if (vipEndTime && vipEndTime > now) {
      vip1 = true;
    }
    if (vip2EndTime && vip2EndTime > now) {
      vip2 = true;
    }
    if (vip3EndTime && vip3EndTime > now) {
      vip3 = true;
    }
    if (vip4EndTime && vip4EndTime > now) {
      vip4 = true;
    }
    if (vip1 && vip2 && vip2EndTime >= vipEndTime) {
      vip1 = false;
    } else if (vip1 && vip2 && vip2EndTime <= vipEndTime) {
      vip2 = false;
    } else if (vip1 && vip3 && vip3EndTime <= vipEndTime) {
      vip3 = false;
    } else if (vip1 && vip4 && vip4EndTime <= vipEndTime) {
      vip4 = false;
    }
    this.setData({
      vip0: vip0,
      vip1: vip1,
      vip2: vip2,
      vip3: vip3,
      vip4: vip4,
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
      // teamNames.push("创建新团队");
      that.setData({
        teamId: app.teamId,
        teamRole: app.teamRole,
        nowTeam: list[0],
        teamList: list,
        selTeam: 0,
        teamNames: teamNames
      });
    });
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
    wx.setStorageSync("myTeamId", app.teamId);
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
      showDlg: true
    });
  },
  /**
   * 隐藏权限说明弹窗
   */
  hideDlg: function() {
    this.setData({
      showDlg: false
    });
  }
});
