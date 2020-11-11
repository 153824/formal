const app = getApp();
Page({
  data: {
    isok: false
  },
  onLoad: function(option) {
    const that = this;
    const userData = wx.getStorageSync("userInfo")
    const {evaluationId,evaluationInfo} = option;
    if(evaluationInfo){
      this.setData({
        evaluationInfo: JSON.parse(evaluationInfo),
        evaluationId: evaluationId,
      })
    }
    app.doAjax({
      url: "paperQues",
      method: "get",
      data: {
        id: evaluationId
      },
      success: function(res) {
        that.setData({
          userInfo: userData,
          paperList: res
        });
      }
    });
  },

  onShow: function() {

  },
  goToReplying: function(e) {
    const {evaluationInfo} = this.data;
    app.doAjax({
      url: 'release/self',
      method: 'post',
      data: {
        evaluationInfo: evaluationInfo
      },
      success: function (res) {
        const {receiveRecordId} = res;
        const {evaluationId,evaluationInfo} = this.data;
        console.log("evaluationId: ",evaluationId);
        const sKey = "oldAnswer" + receiveRecordId;
        const draftAnswer = wx.getStorageSync(sKey);
        if (draftAnswer) {
          wx.setStorageSync(sKey, draftAnswer);
        }
        wx.setStorageSync("st",res.createdAt);
        wx.redirectTo({
          url: `../../replying?pid=${evaluationInfo.evaluationId}&id=${receiveRecordId}&evaluationId=${evaluationInfo.evaluationId}&receiveRecordId=${receiveRecordId}`
        });
      }
    });
  },
})
