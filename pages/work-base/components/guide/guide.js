// test/guide.js
var app = getApp();
var isHasApplyFor = false;
Page({

  data: {
    isPass: false,
    hasUserInfo: false,
    isTest: false,
    loading: false
  },
  onLoad: function(option) {
    if (option.id) {
      this.setData({
        id: option.id
      });
    }
    if(option.maskTrigger){
      this.setData({
        maskTrigger: option.maskTrigger,
        loading: true
      });
    }
  },
  onShow: function() {
    var that = this;
    var id = that.data.id;
    if (app.isTest && !id) {
      return that.getPaperMsg()
    };
    if (!app.globalData.userInfo) {
      setTimeout(function() {
        that.onShow();
      }, 500);
      return;
    };

    app.doAjax({
      url: "sharePapers/getSharePaper",
      data: {
        backUserInfo: true,
        id: id
      },
      success: function(ret) {
        if (ret.isPass) {
          app.shareId = "";
          that.setData(ret);
          return;
        }
        if (ret.id) {
          id = ret.id;
        }
        var sKey = "oldAnswer" + id;
        var oldData = wx.getStorageSync(sKey);
        that.setData({
          reportMeet: ret.reportMeet
        });
        if (oldData) {
          that.setData({
            loading: true
          });
          setTimeout(()=>{
            wx.redirectTo({
              url: '../answering/answering?pid=' + ret.paperId + '&id=' + id + "&type=" + ret.applyStatus  + "&reportMeet=" + ret.reportMeet
            });
          },500);
          return;
        }
        var oldPeopleMsg = ret.oldPeopleMsg;
        if (oldPeopleMsg && oldPeopleMsg.username) {
          wx.setStorageSync("oldPeopleMsg", oldPeopleMsg);
        }
        that.getPaperMsg({
          applyStatus: ret.applyStatus,
          draftAnswer: ret.draftAnswer,
          paperId: ret.paperId,
          userInfo: ret.userInfo,
          id: id,
        });
      }
    });
  },
  /**
   * 申请查看报告
   */
  toApply: function(e) {
    if (isHasApplyFor) {
      app.toast("已申请，请等待审核")
      return;
    }
    var id = e.currentTarget.dataset.id;
    var that = this;
    app.doAjax({
      url: "applyToMeetReport",
      method: "post",
      data: {
        id: id
      },
      success: function(ret) {
        app.toast(ret);
        isHasApplyFor = true;
      }
    });
  },
  /**
   *获取测评详情
   */
  getPaperMsg: function(params) {
    params = params || {};
    var that = this;
    app.shareId = null;
    app.doAjax({
      url: "paperQues",
      method: "get",
      data: {
        id: params.paperId || "",
        isTest: app.isTest
      },
      success: function(res) {
        var hasUserInfo = false;
        var userInfo = wx.getStorageSync("userInfo");
        if (userInfo && userInfo.avatar) {
          hasUserInfo = true;
        }
        that.setData({
          hasUserInfo: hasUserInfo,
          isTest: app.isTest,
          userInfo: params.userInfo,
          draftAnswer: params.draftAnswer,
          applyStatus: params.applyStatus,
          id: params.id || "",
          paperId: params.paperId || "",
          paperList: res
        });
      }
    });
  },

  goToReplying: function(e) {
    console.log(e);
    var that = this;
    var draftAnswer = that.data.draftAnswer;
    var applyStatus = that.data.applyStatus;
    var userData = e.detail.userInfo;
    if (!userData && !that.data.hasUserInfo && !app.isTest) return;
    if (userData) {
      userData.openid = wx.getStorageSync("openId");
      app.doAjax({
        url: "updateUserMsg",
        method: "post",
        data: {
          data: JSON.stringify({
            wxUserInfo: userData,
            userCompany: {
              name: userData.nickName + "的团队"
            }
          })
        },
        success: function(res) {
          var userData = res.data;
          if (0 == res.code) {
            wx.setStorageSync("userInfo", userData);
            wx.setStorageSync("openId", userData.openid);
            wx.setStorageSync("unionId", userData.uid);
            if (draftAnswer) {
              var sKey = "oldAnswer" + that.data.id;
              wx.setStorageSync(sKey, draftAnswer);
              wx.redirectTo({
                url: '../answering/answering?pid=' + that.data.paperId + '&id=' + that.data.id + "&type=" + that.data.applyStatus + "&reportMeet=" + that.data.reportMeet
              });
              return;
            }else{
              wx.redirectTo({
                url: '../answering/answering?pid=' + that.data.paperId + '&id=' + that.data.id + "&type=" + that.data.applyStatus + "&reportMeet=" + that.data.reportMeet
              });
            }
            that.setData({
              hasUserInfo: true,
              isok: false
            });
          }
        }
      });
      return;
    }
    if (draftAnswer || !draftAnswer) {
      var sKey = "oldAnswer" + that.data.id;
      wx.setStorageSync(sKey, draftAnswer);
      wx.redirectTo({
        url: '../answering/answering?pid=' + that.data.paperId + '&id=' + that.data.id + "&type=" + that.data.applyStatus + "&reportMeet=" + that.data.reportMeet
      });
      return;
    }
    this.setData({
      isok: false
    })
  },
  /**
   * 进入报告详情
   */
  toDetail: function(e) {
    var id = this.data.id;
    wx.redirectTo({
      url: '../../../report/report?id=' + id,
    });
  },
});
