// common/title/title.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    statusbarHeight: app.globalData.statusbarHeight,
    titleHeight: app.globalData.titleHeight,
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
    userInfo: app.globalData.userInfo,
    teamNames: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    loadUserMsg: function() {
      var userData = app.globalData.userInfo || wx.getStorageSync("userInfo");
      var teamData = app.globalData.team || userData;
      console.log("teamData",teamData);
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
      console.log("changeTeam", val);
      var data = this.data;
      var teamList = data.teamList;
      var nowTeam = teamList[val];
      console.log("nowTeam: ",nowTeam);
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
      app.selTeam = app.globalData.selTeam || 0;

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
    attached: function () {
      var that = this;
      app.getUserInfo(that.loadUserMsg.call(that));
      console.log("app.getUserInfo(that.loadUserMsg.call(that))");
    }
  }
});
