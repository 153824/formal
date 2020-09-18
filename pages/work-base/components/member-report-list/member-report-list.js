const app = getApp();
let page = 1, paperId;
Component({
  data: {
    mpImg: "../img/mpImg.png",
    showDlg: false,
    active: 0,
    evaluationTask: [],
    pixelRate: app.globalData.pixelRate,
    tabBarHeight: 0,
    windowHeight: 0,
    isIPhoneXModel: app.isIphoneX,
    safeAreaDiff: 0
  },
  properties: {},
  pageLifetimes: {
    onLoad: function (options) {
      const that = this;
      paperId = options.id || "";
      page = 1;
    },
    onShow: function() {
      const that = this;
    },
  },
  methods: {
    /**
     * 获取报告列表
     */
    getList: function() {
      const that = this;
      app.doAjax({
        url: "receive_records",
        method: "get",
        data: {
          isEE: true,
          teamId: app.teamId,
          page: page,
          pageSize: 12
        },
        success: function(res) {
          that.setData({
            evaluationTask: res
          });
        }
      });
    },
    /**
     * 进入报告详情
     */
    goToReportDetail: function(e) {
      const index = e.currentTarget.dataset.index;
      const obj = this.data.evaluationTask[index];
      app.isTest = false;
      wx.navigateTo({
        url: '../../../../report/report?id=' + obj.receiveRecordId + "&name=" + obj.evaluationName
      });
    },
    /**
     * 页面切换
     */
    changePage: function(e) {
      app.isTest = false;
      const url = e.currentTarget.dataset.url;
      app.changePage(url);
    },
    /**
     * 申请查看报告
     */
    toApply: function(e) {
      const id = e.currentTarget.dataset.id;
      const that = this;
      app.doAjax({
        url: `reports/${id}`,
        method: "patch",
        success: function(ret) {
          that.getList();
          that.setData({
            showDlg: false
          });
        }
      });
    },
    /**
     * 弹窗隐藏
     */
    hideDlg: function(e) {
      this.setData({
        showDlg: false
      });
    },
    /**
     * 进入测评模拟测试
     */
    toTestIt: function(e) {
      app.isTest = true;
      wx.navigateTo({
        url: '../guide/guide'
      });
    }
  },
  lifetimes: {
    created() {
      const that = this;
      that.setData({
        scene: app.scene || 0
      });
      app.isTest = false;
      if (!app.globalData.userInfo || !app.globalData.userInfo.id) {
        app.checkUser = function() {
          app.checkUser = null;
          that.getList();
        }
      } else {
        that.getList();
      }
    },
    attached() {
      const systemInfo = wx.getSystemInfoSync();
      const { isIPhoneXModel } = this.data;
      console.log("systemInfo: ",systemInfo);
      this.setData({
        windowHeight: systemInfo.windowHeight,
        safeAreaDiff: isIPhoneXModel  ? Math.abs(systemInfo.safeArea.height  - systemInfo.safeArea.bottom) : 0,
      });
      console.log("safeAreaDiff",Math.abs(systemInfo.safeArea.height  - systemInfo.safeArea.bottom));
      // console.log(wx.createSelectorQuery().in(this).select("#hola-member-report-list").boundingClientRect(res=>{
      //   console.log(res);
      // }));
    }
  }
});
