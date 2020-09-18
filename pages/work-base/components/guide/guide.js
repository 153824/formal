// test/guide.js
const app = getApp();
var isHasApplyFor = false;
Page({
  data: {
    hasUserInfo: false,
    isTest: false,
    loading: false
  },
  onLoad: function(option) {
    if (option.releaseRecordId || option.receiveRecordId) {
      this.setData({
        id: option.releaseRecordId,
        receiveRecordId: option.receiveRecordId
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
    const that = this;
    const id = that.data.id;
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
      url: "release/fetch",
      method: "post",
      data: {
        releaseRecordId: id
      },
      success: function(res) {
        const sKey = "oldAnswer" + id;
        const oldData = wx.getStorageSync(sKey);
        that.setData({
          reportPermit: res.reportPermit
        });
        if (oldData) {
          that.setData({
            loading: true
          });
          setTimeout(()=>{
            wx.redirectTo({
              url: '../answering/answering?pid=' + res.evaluationId + '&id=' + id + '&receiveRecordId=' + res.receiveRecordId + "&reportPermit=" + res.reportPermit  + "&status=" + res.status
            });
          },500);
          return;
        }
        const oldPeopleMsg = res.participantInfo;
        if (oldPeopleMsg && oldPeopleMsg.username) {
          wx.setStorageSync("oldPeopleMsg", oldPeopleMsg);
        }
        let text = "";
        switch (res.msg) {
          case 'continue examining':
            text = "继续作答";
            break;
          case 'show report':
            text = "查看报告";
            break;
          case 'apply to view report':
            text = "申请查看报告";
            break;
          case 'wait for approving view report':
            text = "等待hr通过申请";
            break;
          case 'not available':
            text = "分享已失效";
            break;
        }
        that.getPaperMsg({
          status: res.status,
          reportPermit: res.reportPermit,
          draftAnswer: res.draft,
          evaluationId: res.evaluationId,
          userInfo: res.participantInfo,
          id: id,
          receiveRecordId: res.receiveRecordId
        });
        that.setData({
          avatar: res.avatar,
          teamName: res.teamName
        })
      }
    });
  },
  /**
   * 申请查看报告
   */
  toApply: function(e) {
    if (isHasApplyFor) {
      app.toast("已申请，请等待审核");
      return;
    }
    const receiveRecordId = e.currentTarget.dataset.id;
    const that = this;
    app.doAjax({
      url: `reports/${receiveRecordId}`,
      method: "patch",
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
        id: params.evaluationId || "",
        isTest: app.isTest
      },
      success: function(res) {
        let hasUserInfo = false;
        const userInfo = wx.getStorageSync("userInfo");
        if (userInfo && userInfo.avatar || params.userInfo.hasParticipantInfo) {
          hasUserInfo = true;
        }
        that.setData({
          hasUserInfo: hasUserInfo,
          status: params.status,
          isTest: app.isTest,
          userInfo: params.userInfo,
          draftAnswer: params.draftAnswer,
          reportPermit: params.reportPermit,
          id: params.id || "",
          evaluationId: params.evaluationId || "",
          evaluationList: res,
          msg: params.msg,
          receiveRecordId: params.receiveRecordId
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
          var globalData = app.globalData.userInfo;
          if (0 == res.code) {
            app.globalData.userInfo = Object.assign(globalData,userData);
            wx.setStorageSync("userInfo", Object.assign(globalData,userData));
            wx.setStorageSync("openId", userData.openid);
            // wx.setStorageSync("unionId", userData.uid);
            if (draftAnswer) {
              var sKey = "oldAnswer" + that.data.id;
              wx.setStorageSync(sKey, draftAnswer);
              wx.redirectTo({
                url: '../answering/answering?pid=' + that.data.evaluationId + '&id=' + that.data.id + '&receiveRecordId='+ that.data.receiveRecordId + "&reportPermit=" + that.data.reportPermit + "&status=" + that.data.status
              });
              return;
            }else{
              wx.redirectTo({
                url: '../answering/answering?pid=' + that.data.evaluationId + '&id=' + that.data.id + '&receiveRecordId='+ that.data.receiveRecordId + "&reportPermit=" + that.data.reportPermit + "&status=" + that.data.status
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
        url: '../answering/answering?pid=' + that.data.evaluationId + '&id=' + that.data.id + '&receiveRecordId='+ that.data.receiveRecordId +  "&reportPermit=" + that.data.reportPermit + "&status=" + that.data.status
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
