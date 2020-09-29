const app = getApp();
Page({
  data: {
    isok: false
  },
  onLoad: function(option) {
    const that = this;
    const userData = wx.getStorageSync("userInfo")
    const {receiveRecordId,evaluationId} = option;
    app.doAjax({
      url: "paperQues",
      method: "get",
      data: {
        id: evaluationId
      },
      success: function(res) {
        const sKey = "oldAnswer" + receiveRecordId;
        const draftAnswer = wx.getStorageSync(sKey);
        that.setData({
          draftAnswer: draftAnswer,
          userInfo: userData,
          evaluationId: evaluationId,
          receiveRecordId: receiveRecordId,
          paperList: res
        });
      }
    });
  },

  onShow: function() {

  },
  goToReplying: function(e) {
    const { id,name } = e.currentTarget.dataset;
    const that = this;
    const {receiveRecordId,evaluationId} = this.data;
    const sKey = "oldAnswer" + receiveRecordId;
    const draftAnswer = this.data.draftAnswer;
    if (draftAnswer || !draftAnswer) {
      wx.setStorageSync(sKey, draftAnswer);
      wx.redirectTo({
        url: `../../replying?pid=${evaluationId}&id=${receiveRecordId}&evaluationId=${evaluationId}&receiveRecordId=${receiveRecordId}`
      });
      return;
    }
  },
})
