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
    imageTrigger: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    const { sharePaperId,status } = options;
    console.log("{ sharePaperId,status } = options", options);
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
    // const { dispatchId } = this.data,
    //       that = this;
    // app.doAjax({
    //   url: `../haola/dispatchs/${ dispatchId }/detail`,
    //   method: "get",
    //   success: function (res) {
    //     const { finished,Answering,waitingAnswer } = res.data.data,
    //           { evaluation,image,count } = res.data;
    //     /*层级太深 将数据进行拆分*/
    //     const baseInfo = {
    //       evaluation,
    //       image,
    //       count
    //     };
    //     that.setData({
    //       finished,
    //       Answering,
    //       waitingAnswer,
    //       baseInfo
    //     });
    //   }
    // });

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
      url: `../report/detail?id=${ id }`
    })
  },
  gotoDetail: function(e){
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../station/detail?id=${ id }`
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
      url: '../store/sharePaper?id=' + paperDetail.id + "&count=" + userPapersNum.total,
    });
    return;
    app.doAjax({
      url: 'toSharePaper',
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
