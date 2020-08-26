// manager/useHistoryDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: [
      {
        id: 0,
        name: "已完成",
        checked: true
      },
      {
        id: 1,
        name: "作答中",
        checked: false
      },
      {
        id: 2,
        name: "待作答",
        checked: false
      },
    ],
    checkedItem: 0,
    baseInfo: {},
    imageTrigger: false,
    statusbarHeight: app.globalData.statusbarHeight,
    titleHeight: app.globalData.titleHeight,
    tarBarHeight: app.globalData.tarBarHeight,
    pixelRatio: app.globalData.pixelRatio,
    windowHeight: app.globalData.windowHeight,
    screenHeight: app.globalData.screenHeight,
    pixelRate: app.globalData.pixelRate
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    const { sharePaperId,status=-1 } = options;
    this.setData({
      statusbarHeight: app.globalData.statusbarHeight,
      titleHeight: app.globalData.titleHeight,
      tarBarHeight: app.globalData.tarBarHeight,
      pixelRatio: app.globalData.pixelRatio,
      windowHeight: app.globalData.windowHeight,
      screenHeight: app.globalData.screenHeight,
      pixelRate: app.globalData.pixelRate
    });
    app.doAjax({
      url: `sharePapers/batchDetail`,
      method: "get",
      data: {
        sharePaperId
      },
      success: function (res) {
        const baseInfo = res.data;
        that.setData({
          baseInfo,
          status
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  changeTab: function (e) {
    const targetValue = e.currentTarget.dataset.id,
        { nav } = this.data;
    for( let i = 0;i < nav.length;i++ ){
      nav[i].checked = nav[i].id === targetValue;
    }
    this.setData({
      nav,
      checkedItem: targetValue
    })
  },
  changePage: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../../../report/report?id=${ id }`
    })
  },
  gotoDetail: function(e){
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../../../station/components/detail/detail?id=${ id }`
    });
  },
  loadQrcode: function () {
    setTimeout(()=>{
      this.setData({
        imageTrigger: true
      });
    },400);
    wx.showLoading({
      title: "图片加载中"
    })
  },
  imageLoad: function (e) {
    if( e.detail.height > 0 ){
      wx.hideLoading()
    }
  },
  closeQrcode: function (e) {
    this.setData({
      imageTrigger: false
    })
  },
  gotodati: function() {

    //发放测评
    var that = this;
    var { baseInfo } = that.data;
    var userPapersNum = baseInfo.userPapersNum || {};
    if (userPapersNum.total == 0) {
      app.toast("测评可用数量不足，请先购买或用券兑换测评");

      return;
    }
    wx.navigateTo({
      url: '../../../station/sharePaper/sharePaper?id=' + paperDetail.id + "&count=" + userPapersNum.total,
    });
    return;
    app.doAjax({
      url: 'sharePapers/toSharePaper',
      method: 'post',
      data: {
        id: that.data.paperid,
      },
      success: function(res) {
        that.setData({
          pictureUrl: res.img,
          shareId: res.id,
          dati: true,
          showMindDlg: false
        });
        that.onShow()
      }
    })
  },
});
