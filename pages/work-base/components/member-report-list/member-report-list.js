import {getEnv, getTag, umaEvent} from "../../../../uma.config";

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
    safeAreaDiff: 0,
    isWxWork: app.wxWorkInfo.isWxWork,
    isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
    is3rd: app.wx3rdInfo.is3rd,
    maskTrigger: true,
    isIos: app.isIos
  },
  properties: {
    navigationBarTitleText: {
      type: String,
      value: "他人邀请我参加的测评"
    },
    tabBarTrigger: {
      type: Boolean,
      value: false
    },
    backToUserCenter: {
      type: Boolean,
      value: false
    }
  },
  pageLifetimes: {
    load: function (options) {
      const that = this;
      paperId = options.id || "";
      page = 1;
    },
    show: function() {
      const that = this;
      that.getList();
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
        noLoading: true,
        data: {
          isEE: app.wxWorkInfo.isWxWork,
          teamId: app.teamId || wx.getStorageSync("userInfo").teamId || "",
          page: page,
          pageSize: 12
        },
        success: function(res) {
          that.setData({
            evaluationTask: res,
            maskTrigger: true
          });
        }
      });
    },

    goToReportDetail: function(e) {
      const index = e.currentTarget.dataset.index;
      const obj = this.data.evaluationTask[index];
      app.isTest = false;
      wx.navigateTo({
        url: '/pages/report/report?receiveRecordId=' + obj.receiveRecordId + "&name=" + obj.evaluationName
      });
      if(this.properties.navigationBarTitleText === '他人邀请我参加的测评'){
        const umaConfig = umaEvent.getInReport;
        wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin.invite, name: `${umaConfig.name}${obj.evaluationName}`, env: getEnv(wx), tag: getTag(wx)});
      }
    },

    changePage: function(e) {
      app.isTest = false;
      const url = e.currentTarget.dataset.url;
      app.changePage(url);
    },

    toApply: function(e) {
      const id = e.currentTarget.dataset.id;
      const that = this;
      app.doAjax({
        url: `reports/${id}`,
        method: "put",
        data: {
          type: 'apply'
        },
        success: function(ret) {
          that.getList();
          that.setData({
            showDlg: false
          });
        }
      });
    },

    hideDlg: function(e) {
      this.setData({
        showDlg: false
      });
    },

    toTestIt: function(e) {
      app.isTest = true;
      wx.navigateTo({
        url: '/pages/work-base/components/guide/guide'
      });
    },

  },
  lifetimes: {
    created() {
      const that = this;
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
      wx.setNavigationBarTitle({
        title: this.properties.navigationBarTitleText
      });
      const systemInfo = wx.getSystemInfoSync();
      const { isIPhoneXModel,pixelRate } = this.data;
      const safeAreaDiff = isIPhoneXModel  ? Math.abs(systemInfo.safeArea.height  - systemInfo.safeArea.bottom) : 0;
      const windowHeight = systemInfo.windowHeight;
      let height = 0;
      this.setData({
        isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
        isWxWork: wx.getSystemInfoSync().environment === 'wxwork' || app.wxWorkInfo.isWxWork,
        is3rd: wx.getExtConfigSync().extConfig
      });
      if(wx.getSystemInfoSync().environment === 'wxwork' && isIPhoneXModel){
        this.setData({
          height: (windowHeight-60-safeAreaDiff) * pixelRate
        })
      }else if (wx.getSystemInfoSync().environment !== 'wxwork' && isIPhoneXModel){
        this.setData({
          height: (windowHeight-safeAreaDiff) * pixelRate
        })
      }

      this.setData({
        windowHeight: systemInfo.windowHeight,
        safeAreaDiff: isIPhoneXModel  ? Math.abs(systemInfo.safeArea.height  - systemInfo.safeArea.bottom) : 0,
      });
    },

    detached() {}
  }
});
