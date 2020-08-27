// manager/useHistoryDetail.js
const app = getApp();
Page({
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
    windowHeight: app.globalData.windowHeight,
    screenHeight: app.globalData.screenHeight,
    pixelRate: app.globalData.pixelRate
  },

  onLoad: function (options) {
    const that = this;
    const { sharePaperId,status=-1 } = options;
    this.setData({
      statusbarHeight: app.globalData.statusbarHeight,
      titleHeight: app.globalData.titleHeight,
      tarBarHeight: app.globalData.tarBarHeight,
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
      noLoading: true,
      success: function (res) {
        const baseInfo = res.data;
        that.setData({
          baseInfo,
          status,
          sharePaperImg: ""
        });
      }
    });
  },
  /**
   * @Description:  切换tab页
   * @author: WE!D
   * @name:  changeTab
   * @args:  e视图层数据绑定
   * @return:
   * @date: 2020/8/27
  */
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

  /**
   * @Description:  页面跳转
   * @author: WE!D
   * @name:  changePage
   * @args:  e视图层数据绑定
   * @return:
   * @date: 2020/8/27
  */
  changePage: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../../../report/report?id=${ id }`
    })
  },

  /**
   * @Description:  跳转至测评详情页
   * @author: WE!D
   * @name:  gotoDetail
   * @args:  e视图层数据绑定
   * @return:
   * @date: 2020/8/27
  */
  gotoDetail: function(e){
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../../../station/components/detail/detail?id=${ id }`
    });
  },

  /**
   * @Description:  加载二维码
   * @author: WE!D
   * @name:  loadQrcode
   * @args:
   * @return:
   * @date: 2020/8/27
  */
  loadQrcode: function () {
      this.setData({
        imageTrigger: true,
      });
      setTimeout(()=>{
        this.setData({
          sharePaperImg: this.data.baseInfo.img
        })
      },500);
  },

  /**
   * @Description:  关闭二维码
   * @author: WE!D
   * @name:  closeQrcode
   * @args:
   * @return:
   * @date: 2020/8/27
  */
  closeQrcode: function (e) {
    this.setData({
      imageTrigger: false
    })
  }
});
