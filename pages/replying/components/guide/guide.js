// test/guide.js
var app = getApp();
Page({
  data: {
    isok: false
  },
  onLoad: function(option) {
    var userData = wx.getStorageSync("userInfo")
    var that = this;
    app.doAjax({
      url: "sharePapers/getSharePaper",
      data: {
        getOldPeopleMsg: true,
        id: option.id
      },
      success: function(ret) {
        var paperId = ret.paperId;
        var oldPeopleMsg = ret.oldPeopleMsg;
        if (oldPeopleMsg && oldPeopleMsg.username) {
          wx.setStorageSync("oldPeopleMsg", oldPeopleMsg);
        }
        app.doAjax({
          url: "paperQues",
          method: "get",
          data: {
            id: paperId
          },
          success: function(res) {
            var sKey = "oldAnswer" + that.data.id;
            var draftAnswer = wx.getStorageSync(sKey);
            that.setData({
              draftAnswer: draftAnswer || ret.draftAnswer,
              userInfo: userData,
              id: option.id,
              paperId: paperId,
              paperList: res
            });
          }
        });
      }
    });
  },

  onShow: function() {

  },
  goToReplying: function(e) {
    const { id,name } = e.currentTarget.dataset;
    var that = this;
    var sKey = "oldAnswer" + this.data.id;
    var draftAnswer = this.data.draftAnswer;
    if (draftAnswer || !draftAnswer) {
      wx.setStorageSync(sKey, draftAnswer);
      wx.redirectTo({
        url: '../../replying?pid=' + that.data.paperId + '&id=' + that.data.id
      });
      // wx.navigateTo({
      //   url: `../notification/notification?pid=${that.data.paperId}&id=${that.data.id}`
      // });
      wx.aldstat.sendEvent('点击开始作答', {
        '测评名称': `名称：${ name } id：${ id }`
      });
      return;
    }
    this.setData({
      // isok: !this.data.isok
    })
  },
  gototakephoto: function() {
    var data = this.data;
    wx.redirectTo({
      url: 'index?pid=' + data.paperId + "&id=" + data.id
    });
  }
})
