const app = getApp();
let page = 1,
  paperId;
Component({
  data: {
    mpImg: "../img/mpImg.png",
    showDlg: false,
    active: 0,
    evaluationTask: []
  },
  properties: {
    reportListTrigger: {
      type: Boolean,
      value: false
    }
  },
  pageLifetimes: {
    onLoad: function (options) {
      paperId = options.id || "";
      page = 1;
    },
    onShow: function() {},
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
        url: "applyToMeetReport",
        method: "post",
        data: {
          id: id
        },
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
    }
  }
});
