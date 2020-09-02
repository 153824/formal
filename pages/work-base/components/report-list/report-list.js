const app = getApp();
let page = 1,
  paperId;
Component({
  data: {
    mpImg: "../img/mpImg.png",
    showDlg: false,
    active: 0
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
    onShow: function() {
      // const that = this;
      // that.setData({
      //   scene: app.scene
      // });
      // app.isTest = false;
      // if (!app.globalData.userInfo || !app.globalData.userInfo.id) {
      //   app.checkUser = function() {
      //     app.checkUser = null;
      //     that.getList();
      //   }
      // } else {
      //   that.getList();
      // }
    },
  },
  methods: {
    /**
     * 获取报告列表
     */
    getList: function() {
      var that = this;
      app.doAjax({
        url: "getMyReportList",
        method: "get",
        data: {
          page: page,
          pageSize: 12
        },
        success: function(ret) {
          ret.data.forEach(function(node) {
            node.report = node.report || {};
            if (node.report.finishTime) {
              node.report.finishTime = app.changeDate(node.report.finishTime, "yyyy-MM-dd hh:mm");
              node.report.finishTime = node.report.finishTime.substring(2);
            }
          });
          that.setData({
            list: ret.data
          });
        }
      });
    },
    /**
     * 进入报告详情
     */
    toDetail: function(e) {
      var index = e.currentTarget.dataset.index;
      var obj = this.data.list[index];
      app.isTest = false;
      wx.navigateTo({
        url: '../../../../report/report?id=' + obj.id + "&name=" + obj.paper.name
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
        scene: app.scene
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
