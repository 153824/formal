// index/getFreeTicket.js
var app = getApp();
var isAdd = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPc: false,
    selId: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    isAdd = false;
    this.setData({
      paperId: options.paperId || "",
      type: options.type || 1,
      isPc: options.fromPc || false
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
    var that = this;
    if (!app.isLogin) {
      app.checkUser = function() {
        that.onShow();
        app.checkUser = null;
      };
      return;
    }
    app.doAjax({
      url: "getMyticket",
      method: "get",
      noLoading: true,
      data: {
        page: 1,
        pageSize: 1000,
        type: 2
      },
      success: function(ret) {
        var hasFreeTick = false;
        ret.forEach(function(n) {
          if (n.type == 1) {
            hasFreeTick = true;
          }
        });
        if (hasFreeTick) {
          that.toNext();
          return;
        }
        var userData = app.globalData.userInfo;
        var wxInfo = userData.info;
        app.doAjax({
          url: "getColumnList",
          method: "get",
          data: {
            allPapers: true,
            page: 1,
            pageSize: 1000
          },
          success: function(res) {
            that.setData({
              userData: userData,
              isIos: app.isIos,
              wxInfo: wxInfo,
              columnList: res.data
            });
          }
        });
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
   * 选中该类型测评
   */
  selIt: function(e) {
    var index = e.currentTarget.dataset.i;
    var list = this.data.columnList;
    var data = list[index];
    var selPapers = [];
    data.papers.forEach(function(n) {
      selPapers.push(n.id);
    });
    this.setData({
      selId: data.id,
      selPapers: selPapers
    });
  },
  /**
   * 获取测评券
   */
  addTicket: function(e) {
    var that = this;
    var selId = that.data.selId;
    if (!selId || isAdd) return;
    isAdd = true;
    app.doAjax({
      url: "addFreeVoucher",
      method: "POST",
      data: {
        columnId: selId
      },
      success: function(res) {
        app.toast("领取成功");
        setTimeout(function() {
          wx.setStorageSync("getTick", true);
          that.toNext();
        }, 1000);
      }
    });
  },
  /**
   * 用户授权
   */
  getUserInfo: function(e) {
    var that = this;
    var selId = that.data.selId;
    if (!selId) return;
    var userInfo = e.detail.userInfo;
    if (!userInfo) return;
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
        app.globalData.userInfo.nickname = userInfo.nickName;
        app.addNewTeam(that.addTicket);
      }
    });
  },
  /**
   * 下一步
   */
  toNext: function() {
    isAdd = false;
    var that = this;
    var paperId = that.data.paperId;
    var selPapers = that.data.selPapers;
    if (paperId && selPapers.indexOf(paperId) == -1 && that.data.type == 2) {
      wx.switchTab({
        url: '../store/store'
      });
      return;
    }
    if (that.data.type == 2) {
      //测评详情页
      app.doAjax({
        url: "getMyticket",
        method: "get",
        noLoading: true,
        data: {
          page: 1,
          pageSize: 1000,
          type: 2
        },
        success: function(ret) {
          var freeTickId = "";
          ret.forEach(function(n) {
            if (n.type == 1) {
              freeTickId = n.id;
              if (n.count) {
                app.freeTickId = freeTickId;
              }
            }
          });
          wx.navigateBack();
        }
      });
      return;
    }
    if (that.data.isPc) {
      wx.reLaunch({
        url: './pcGetTickSuccess'
      });
    } else {
      wx.switchTab({
        url: '../store/store'
      });
    }
  },
  /**跳过领券 */
  skipIt: function() {
    wx.setStorageSync("skipFreeTicket", true);
    wx.navigateBack();
  }
})