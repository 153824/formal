// test/finish.js
var app = getApp();
Page({
  data: {
    mpImg: "../img/mpImg.png",
    isTest: false,
    isMp: false, //是否显示关注公众号
  },
  onLoad: function(options) {
    app.shareId = ""; //完成答题后清除领取测评ID
    var id = options.id;
    console.log("options.reportMeet: ", options);
    this.setData({
      isMp: false,
      isTest: app.isTest,
      id: id,
      reportPermit: options.reportPermit
    });
  },
  onShow: function() {

  },
  onUnload() {
    wx.reLaunch({
      url: "../../pages/work-base/work-base?maskTrigger=true"
    });
  },
  /**
   * 申请查看报告
   */
  toApply: function(e) {
    var that = this;
    if (wx.requestSubscribeMessage) {
      wx.requestSubscribeMessage({
        tmplIds: [
          "Aw5JEz2yLyNc_opz2W6ketKPTlEC_q0fA2eQAYVPC4k"
        ],
        success: function() {
          toNext();
        },
        fail: function() {
          toNext();
        }
      });
    } else {
      toNext();
    }

    function toNext() {
      const id = that.data;
      app.doAjax({
        url: `reports/${id}`,
        method: "patch",
        data: {
          id: that.data.id
        },
        success: function(ret) {
          that.setData({
            isMp: true
          });
        }
      });
    }
  },
  /**
   * 返回
   */
  toBack: function() {
    wx.navigateBack();
  },
  /**
   * 进入报告详情
   */
  toDetail: function(e) {
    var id = this.data.id;
    wx.navigateTo({
      url: '../../../report/report?id=' + id
    });
  },
})
