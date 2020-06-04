//app.js
const ald = require('./utils/ald-stat.js')
var qiniuUpload = require("./utils/qiniuUpload");
qiniuUpload.init({
  region: 'SCN', // 是你注册bucket的时候选择的区域的代码
  domain: 'ihola.luoke101.com',
  uptokenURL: 'https://admin.luoke101.com/hola/getQiNiuToken', //
  shouldUseQiniuFileName: false // 如果是 true，则文件 key 由 qiniu 服务器分配 (全局去重)。默认是 false: 即使用微信产生的 filename
});
App({
  defaultShareObj: {
    imageUrl: "http://ihola.luoke101.com/wxShareImg.png",
  },
  globalData: {
    titleHeight: 0,
    statusbarHeight: 0,
  },
  teamName: "",
  teamId: "",
  teamRole: "",
  nowhF: 1,
  isTodayTeam: false,
  couponGet0: false,
  couponGet: false,
  couponGet1: false,
  isLogin: false,
  isIos: false,
  qiniuUpload: qiniuUpload,
  isIphoneX: false,
  // host: "https://luoke.ampmfit.net/hola/", //请求host
  host: "https://h5.luoke101.com/hola/",
  host1: "https://admin.luoke101.com/hola/", //请求host——测试
  host2: "http://localhost:3000/hola/", //请求host——测试
  onLaunch: function(options) {
    var referrerInfo = options.referrerInfo;
    var menuBtnObj = wx.getMenuButtonBoundingClientRect();
    if (referrerInfo && referrerInfo.appid) {
      this.fromAppId = referrerInfo.appid;
    }
    wx.removeStorageSync("hideLastTestMind");
    this.teamId = wx.getStorageSync("myTeamId") || "";
    wx.onMemoryWarning(function(res) {
      console.log('onMemoryWarningReceive', res)
    });
    var that = this;
    that.isLogin = false;
    var sysMsg = wx.getSystemInfoSync();
    // 获取机型
    that.rate = sysMsg.windowWidth / 750;
    that.isIphoneX = false;
    that.isIos = false;
    if (sysMsg.model.indexOf("iPhone X") != -1) {
      that.isIphoneX = true;
    }
    if (sysMsg.system.indexOf("iOS") != -1) {
      that.isIos = true;
    }
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.userLogin(res.code);
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = Object.assign(res.userInfo, this.globalData.userInfo || {});

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });

    wx.getSystemInfo({
        success: (res) => {
          let statusbarHeight = res.statusBarHeight,
              titleHeight = menuBtnObj.height + (menuBtnObj.top - statusbarHeight)*2;
              this.globalData.statusbarHeight = statusbarHeight;
              this.globalData.titleHeight = titleHeight
        },
        fail(err){
          console.log(err);
        }
      })
  },

  userLogin: function(code) {
    var that = this;
    that.doAjax({
      url: "userLogin",
      method: "POST",
      data: {
        fromAppId: that.fromAppId,
        appid: that.globalData.appid,
        code: code
      },
      success: function(ret) {
        that.globalData.userMsg = ret.userMsg || {};
        // console.log(wx.getStorageSync("isvip"))
        var userData = ret.data;
        var now = new Date().getTime();
        var createdAt = new Date(userData.createdAt).getTime();
        var isTodayTeam = false;
        if (now - createdAt < (24 * 60 * 60 * 1000)) {
          //24小时内注册的团队--默认为新用户
          isTodayTeam = true;
        }
        that.isTodayTeam = isTodayTeam;
        if (0 == ret.code) {
          var userMsg = that.globalData.userMsg;
          wx.hideLoading();
          wx.setStorageSync("userInfo", userData);
          wx.setStorageSync("openId", userData.openid || userMsg.openid);
          wx.setStorageSync("unionId", userData.uid || userMsg.unionid);
          that.globalData.userInfo = Object.assign(userData, that.globalData.userInfo || {});

          that.getMyTeamList(that.checkUser);
          that.isLogin = true;
        } else wx.showModal({
          title: "登入失败！",
          content: "网络故障，请退出重新进入小程序。",
          showCancel: !1,
          confirmText: "确定",
          confirmColor: "#0099ff",
          success: function(e) {}
        });
      },
      complete: function() {
        wx.hideLoading();
      }
    });
  },
  getUserInfo: function(callBack) {
    //刷新用户信息
    var that = this;
    if (!wx.getStorageSync("openId") || !that.isLogin) {
      callBack && callBack();
      return;
    }
    that.checkUser = null;
    that.doAjax({
      url: "userDetail",
      method: "GET",
      data: {
        openid: wx.getStorageSync("openId")
      },
      noLoading: true,
      success: function(ret) {
        var userData = ret.data;
        if (0 == ret.code) {
          var userMsg = that.globalData.userMsg;
          wx.hideLoading();
          wx.setStorageSync("userInfo", userData);
          wx.setStorageSync("openId", userData.openid || userMsg.openid);
          wx.setStorageSync("unionId", userData.uid || userMsg.unionid);
          that.globalData.userInfo = Object.assign(that.globalData.userInfo || {}, userData);
        }
        that.getMyTeamList(callBack);
      }
    });
  },
  checkUserVip: function(ret) {
    //设置用户VIP信息
    var createdAt = new Date(ret.createdAt).getTime();
    var now = new Date().getTime();
    var isTodayTeam = false;
    if (now - createdAt < (24 * 60 * 60 * 1000)) {
      //24小时内注册的团队--默认为新用户
      isTodayTeam = true;
    }
    var couponGet0 = ret.couponGet0 || false;
    var couponGet = ret.couponGet || false;
    var couponGet1 = ret.couponGet1 || false;
    // isTodayTeam = false;
    // this.isTodayTeam = isTodayTeam;
    this.couponGet0 = couponGet0;
    this.couponGet = couponGet;
    this.couponGet1 = couponGet1;
    var nowtime = new Date().getTime();
    if (ret.payVip0) {
      var vip0endtime = new Date(Date.parse(ret.vip0EndTime)).getTime();
      if (vip0endtime >= nowtime) {
        wx.setStorageSync("isvip0", true)
      } else {
        wx.setStorageSync("isvip0", false)
      }
    } else {
      wx.setStorageSync("isvip2", false)
    }
    if (ret.payVip1) {
      var vipendtime = new Date(Date.parse(ret.vipEndTime)).getTime();
      if (vipendtime >= nowtime) {
        wx.setStorageSync("isvip1", true)
      } else {
        wx.setStorageSync("isvip1", false)
      }
    } else {
      wx.setStorageSync("isvip1", false)
    }

    if (ret.payVip2) {
      var vip2endtime = new Date(Date.parse(ret.vip2EndTime)).getTime();
      if (vip2endtime >= nowtime) {
        wx.setStorageSync("isvip2", true)
      } else {
        wx.setStorageSync("isvip2", false)
      }
    } else {
      wx.setStorageSync("isvip2", false)
    }
    if (ret.payVip3) {
      var vip3endtime = new Date(Date.parse(ret.vip3EndTime)).getTime();
      if (vip3endtime >= nowtime) {
        wx.setStorageSync("isvip3", true)
      } else {
        wx.setStorageSync("isvip3", false)
      }
    } else {
      wx.setStorageSync("isvip3", false)
    }
    if (ret.payVip4) {
      var vip4endtime = new Date(Date.parse(ret.vip4EndTime)).getTime();
      if (vip4endtime >= nowtime) {
        wx.setStorageSync("isvip4", true)
      } else {
        wx.setStorageSync("isvip4", false)
      }
    } else {
      wx.setStorageSync("isvip4", false)
    }
  },
  globalData: {
    appid: "wx85cde7d3e8f3d949",
    userInfo: null,
    userMsg: {},
    team: null
  },

  changeDate2: function(time, dateType) {
    //日期格式化处理
    //dateType示例：yyyy-MM-dd hh:mm:ss
     dateType ="MM-dd hh:mm"
    time = new Date(time);
    // var y = time.getFullYear();
    var M = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var m = time.getMinutes();
    // var s = time.getSeconds();
    M = M < 10 ? ("0" + M) : M;
    d = d < 10 ? ("0" + d) : d;
    h = h < 10 ? ("0" + h) : h;
    m = m < 10 ? ("0" + m) : m;
    // s = s < 10 ? ("0" + s) : s;
    // dateType = dateType.replace("yyyy", y);
    dateType = dateType.replace("MM", M);
    dateType = dateType.replace("dd", d);
    dateType = dateType.replace("hh", h);
    dateType = dateType.replace("mm", m);
    // dateType = dateType.replace("ss", s);
    return dateType;
  },
  changeDate: function(time, dateType) {
    //日期格式化处理
    //dateType示例：yyyy-MM-dd hh:mm:ss
    time = new Date(time);
    var y = time.getFullYear();
    var M = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var m = time.getMinutes();
    var s = time.getSeconds();
    M = M < 10 ? ("0" + M) : M;
    d = d < 10 ? ("0" + d) : d;
    h = h < 10 ? ("0" + h) : h;
    m = m < 10 ? ("0" + m) : m;
    s = s < 10 ? ("0" + s) : s;
    dateType = dateType.replace("yyyy", y);
    dateType = dateType.replace("MM", M);
    dateType = dateType.replace("dd", d);
    dateType = dateType.replace("hh", h);
    dateType = dateType.replace("mm", m);
    dateType = dateType.replace("ss", s);
    return dateType;
  },
  doAjax: function(params) {
    //request请求
    var that = this;
    if (!params.noLoading) {
      //默认显示加载中弹窗
      wx.showLoading({
        title: '正在请求...'
      });
    }
    params.data = params.data || {};
    params.data["userId"] = (that.globalData.userInfo || {}).id || "";
    params.data["teamId"] = that.teamId;
    params.data["teamRole"] = that.teamRole;
    // console.log("main= " + that.host2 + params.url);
    wx.request({
      url: that.host + params.url,
      method: params.method || "POST",
      data: params.data || {},
      success: function(ret) {
        wx.hideLoading();
        var retData = ret.data;
        if (retData.code) {
          if (params.error) return params.error(retData);
          wx.showToast({
            title: retData.msg,
            icon: 'none',
            duration: 2000
          });
          return;
        }
        if (params.success) {
          return params.success(retData);
        }
      },
      error: function() {
        wx.hideLoading();
      }
    });
  },
  //toast信息显示
  toast: function(txt) {
    wx.showToast({
      title: txt,
      icon: "none",
      duration: 2000
    });
  },
  //数组去除空值
  trimSpace: function(array) {
    for (var i = 0; i < array.length; i++) {
      if ((array[i] == " " && array[i] != 0) || array[i] == null || typeof(array[i]) == "undefined") {
        array.splice(i, 1);
        i = i - 1;
      }
    }
    return array;
  },
  /**
   * 页面切换
   */
  changePage: function(url, tab) {
    if (url) {
      wx.navigateTo({
        url: url
      });
    }
    if (tab) {
      wx.switchTab({
        url: tab
      });
    }
  },
  /**
   * 获取团队列表
   */
  getMyTeamList: function(cb) {
    // cb && cb([]);
    // return;
    var that = this;
    that.doAjax({
      url: "myTeamList",
      method: "get",
      noLoading: true,
      data: {
        teamId: that.teamId,
        page: 1,
        pageSize: 12
      },
      success: function(list) {
        if (that.checkUser && !that.isLogin) {
          that.isLogin = true;
        }
        list = list || [];
        var toAddNew = true;
        list.forEach(function(n) {
          if (n.role == 3 && n.createUser.objectId == that.globalData.userInfo.id) { //有我创建的团队时不进行自动新增团队
            toAddNew = false;
          }
        });
        if (list.length) {
          var obj = list[0];
          that.teamId = obj.objectId;
          that.teamName = obj.name;
          that.teamRole = obj.role;
          that.globalData.team = obj;
          that.checkUserVip(obj);
          cb && cb(list);
        }
        if (toAddNew && !list.length) {
          that.addNewTeam(cb);
        }
        if (toAddNew && list.length) {
          that.addNewTeam();
        }
      }
    });
  },
  /**
   * 添加一个默认团队
   */
  addNewTeam: function(cb) {
    var that = this;
    var userInfo = that.globalData.userInfo;
    // if (!userInfo || !userInfo.nickname || !userInfo.isBind) {
    //   cb && cb([]);
    //   return;
    // }
    that.doAjax({
      url: "updateTeamMember",
      method: "post",
      noLoading: true,
      data: {
        type: 6,
        name: userInfo.nickname + "的团队",
        remark: "自动生成的团队"
      },
      success: function() {
        that.getMyTeamList(cb);
      }
    })
  },
});
