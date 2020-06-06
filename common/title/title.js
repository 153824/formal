// common/title/title.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    statusbarHeight: app.globalData.statusbarHeight,
    titleHeight: app.globalData.titleHeight,
    showDlg: false,
    isIos: false,
    showLogin: false,
    vip0: false,
    vip1: false,
    vip2: false,
    vip3: false,
    vip4: false,
    showAddNewTeam: false,
    userInfo: app.globalData.userInfo,
    teamNames: app.globalData.teamNames,
    selTeam: app.globalData.selTeam || 0,
    teamName: app.teamName,
    teamId: app.teamId,
    teamRole: app.teamRole,
    nowTeam: app.globalData.team,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    loadUserMsg: function() {
      var userData = app.globalData.userInfo || wx.getStorageSync("userInfo");
      var teamData = app.globalData.team || userData;
      this.setData({
        userInfo: userData
      });
      this.getMyTeamList();
    },
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
          nowTeam: app.globalData.team,
          teamList: list,
          selTeam: app.globalData.selTeam || 0,
          teamNames: teamNames
        });

      });
    },
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

      app.globalData.teamId = nowTeam.objectId;
      app.globalData.teamName = nowTeam.name;
      app.globalData.teamRole = nowTeam.role;
      app.globalData.selTeam = val;

      wx.setStorageSync("myTeamId", app.teamId);

      this.setData({
        nowTeam: nowTeam,
        selTeam: val,
        teamId: app.teamId,
        teamRole: app.teamRole,
      });
      this.loadUserMsg();
    },
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
  },

  lifetimes: {
    created: function () {
      wx.getSystemInfoSync({
          success:res=>{
            this.setData({
              statusbarHeight: res.statusBarHeight
            });
          }
      });

    },
    attached() {
      var that = this;
      app.getUserInfo(that.loadUserMsg.call(that));
    }
  }
});
