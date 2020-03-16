// store/vipdetail.js
//根据用户当前的会员版本，显示不同的权益信息
var app = getApp();
Page({

  data: {
    isIos: false,
  },
  onLoad: function(options) {
    var type = options.type;
    var userData = app.globalData.userInfo;
    var teamData = app.globalData.team || userData;
    var vipEndTime = teamData.vipEndTime;
    var vip2EndTime = teamData.vip2EndTime;
    var now = new Date().getTime();
    if (vipEndTime) {
      vipEndTime = new Date(vipEndTime).getTime();
      userData.vipEndTime = app.changeDate(vipEndTime, "yyyy.MM.dd");
    }
    if (vip2EndTime) {
      vip2EndTime = new Date(vip2EndTime).getTime();
      userData.vip2EndTime = app.changeDate(vip2EndTime, "yyyy.MM.dd");
    }
    this.setData({
      isIos: app.isIos,
      type: type,
      userInfo: userData
    });
  },

  onShow: function() {

  },
  changePage: function(e) { //页面跳转
    var d = e.currentTarget.dataset;
    app.changePage(d.url, d.tab);
  },
})