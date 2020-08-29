
const app = getApp();
Page({
  data: {
    titleHeight: app.globalData.titleHeight,
    statusbarHeight: app.globalData.statusbarHeight,
    checkedItem: '0',
    checkedTime: '2',
    checkedEvaluation: '0',
    evaluationList: [],
    useList: [],
    timer: ["近七天","近三十天", "全部时间"],
    catalog: ["全部测评"],
    shareTrigger: false,
    evaluationId: "",
    reportPage: 1,
    historyPage: 1,
    loading: true,
    compareArr: [],
    maxReportPage: -1,
    active: 2
  },

  onLoad: function (options) {
    const that = this;
    let reportId = "";
    try{ reportId = options.reportId; }catch (e) {}
    let { checkedItem,checkedTime,evaluationId } = this.data;
    if(options.loadingTrigger){
      this.setData({
        loading: true
      })
    }
    if( checkedItem === "0" ){
      app.doAjax({
        url: "sharePapers/reports",
        method: "get",
        data: {
          orgId: app.teamId,
          userId: app.userId,
          type: checkedTime,
          page: 1,
          pageSize: 10,
          evaluationId: ""
        },
        noLoading: true,
        success: function (res) {
          var catalog = [];
          var compareArr = [];
          res.data.forEach((item,key)=>{
            const { id,name } = item.evaluation;
            if( !compareArr.includes(id) ){
              var catalogChild = {};
              catalogChild.id = id;
              catalogChild.name = name;
              catalog.push(catalogChild);
              compareArr.push(id);
            }
          });
          catalog.unshift({ id: "",name: "全部测评" });
          that.setData({
            evaluationList: res.data,
            catalog: catalog,
            compareArr,
            reportPage: 1,
            historyPage: 1
          });
          setTimeout(()=>{
            that.setData({
              loading: false,
            });
          },500);
          if( reportId ){
            wx.navigateTo({
              url: `../report/report?id=${ reportId }`,
            });
          }
        },
        error: function(err){
          that.setData({
            loading: false,
          });
        }

      })
    }
    if( checkedItem === "1" ){
      app.doAjax({
        url: "sharePapers/batch",
        method: "get",
        data: {
          userId: app.userId,
          teamId: app.teamId,
          type: checkedTime,
          page: 1,
          size: 10,
          noLoading: true,
        },
        success: function (res) {
          if( reportId ){
            wx.navigateTo({
              url: `../report/report?id=${ reportId }`,
            });
          }
          that.setData({
            useList: res.data,
            reportPage: 1,
            historyPage: 1
          });
          setTimeout(()=>{
            that.setData({
              loading: false,
            });
          },500);
        },
        error: function(err){
          that.setData({
            loading: false,
          });
        }
      })
    }
    this.setData({
      statusbarHeight: app.globalData.statusbarHeight,
      titleHeight: app.globalData.titleHeight,
      tarBarHeight: app.globalData.tarBarHeight,
      windowHeight: app.globalData.windowHeight,
      screenHeight: app.globalData.screenHeight,
      pixelRate: app.globalData.pixelRate
    });
  },

  onReady: function () {},

  onShow: function () {
    /*1.获取title组件 2.调用title组件的loadUserMsg方法*/
    this.title = this.selectComponent("#title");
    app.getUserInfo(this.title.loadUserMsg.call(this.title._this()));
    const checkedReportId = wx.getStorageSync('CHECKED_REPORT_ID');
    const checkedUseHistoryId = wx.getStorageSync('CHECKED_USE_HISTORY_ID');
    this.setData({
      checkedReportId: checkedReportId,
      checkedUseHistoryId: checkedUseHistoryId
    })
  },

  onHide: function () {

  },

  onUnload: function () {
    wx.removeStorageSync('CHECKED_REPORT_ID');
    wx.removeStorageSync('CHECKED_USE_HISTORY_ID');
    this.setData({
      checkedReportId: '',
      checkedUseHistoryId: ''
    })
  },

  onPullDownRefresh: function () {},

  onReachBottom: function () {

  },

  changeTab: function (e) {
    const targetValue = e.currentTarget.dataset.item,
        { checkedTime,evaluationId } = this.data,
        that = this;
    this.setData({
      checkedItem: targetValue,
      loading: true
    });
    try{
      wx.setStorage({ key: 'CHECKED_REPORT_ID',data:"" });
      wx.setStorage({ key: 'CHECKED_USE_HISTORY_ID',data:"" });
      this.setData({
        checkedReportId: "",
        checkedUseHistoryId: ""
      })
    }catch(e){}
    if( targetValue === "0" ){
      app.doAjax({
        url: "sharePapers/reports",
        method: "get",
        data: {
          orgId: app.teamId,
          userId: app.userId,
          type: checkedTime,
          page: 1,
          pageSize: 10,
          evaluationId: "",
        },
        noLoading: true,
        success: function (res) {
          that.setData({
            evaluationList: res.data,
            historyPage: 1
          });
          setTimeout(()=>{
            that.setData({
              loading: false,
            });
          },500);
        },
        error: function(err){
          that.setData({
            loading: false,
          });
        }
      })
    }
    if( targetValue === "1" ){
      app.doAjax({
        url: "sharePapers/batch",
        method: "get",
        data: {
          userId: app.userId,
          teamId: app.teamId,
          type: checkedTime,
          page: 1,
          size: 10
        },
        noLoading: true,
        success: function (res) {
          that.setData({
            useList: res.data,
            reportPage: 1
          });
          setTimeout(()=>{
            that.setData({
              loading: false,
            });
          },500);
        },
        error: function(err){
          that.setData({
            loading: false,
          });
        }
      })
    }
  },

  changeTimer: function (e) {
    const targetValue = e.detail.value,
        { checkedItem,
          evaluationId,
          reportPage
        } = this.data,
        that = this;
    this.setData({
      checkedTime: targetValue,
      reportPage: 1,
      loading: true,
    });
    if( checkedItem === "0" ){
      app.doAjax({
        url: "sharePapers/reports",
        method: "get",
        data: {
          orgId: app.teamId,
          userId: app.userId,
          type: targetValue,
          page: 1,
          pageSize: 10,
          evaluationId: evaluationId
        },
        noLoading: true,
        success: function (res) {
          that.setData({
            evaluationList: res.data,
            loading: false
          });
        },
        error: function(err){
          that.setData({
            loading: false,
          });
        }
      })
    }
    if( checkedItem === "1" ){
      app.doAjax({
        url: "sharePapers/batch",
        method: "get",
        data: {
          userId: app.userId,
          teamId: app.teamId,
          type: targetValue,
          page: 1,
          size: 10
        },
        noLoading: true,
        success: function (res) {
          that.setData({
            useList: res.data,
            loading: false
          });
        },
        error: function(err){
          that.setData({
            loading: false,
          });
        }
      })
    }
  },

  changeEvaluation: function (e) {
    const that = this;
    const { checkedTime,catalog } = this.data;
    const checkedEvaluation = e.detail.value;
    this.setData({
      checkedEvaluation: checkedEvaluation,
      evaluationId: catalog[checkedEvaluation].id,
      reportPage: 0
    });
    app.doAjax({
      url: "sharePapers/reports",
      method: "get",
      data: {
        orgId: app.teamId,
        userId: app.userId,
        type: checkedTime,
        page: 1,
        pageSize: 10,
        evaluationId: catalog[checkedEvaluation].id
      },
      noLoading: true,
      success: function (res) {
        that.setData({
          evaluationList: res.data,
        });
      }
    })
  },

  changePage: function (e) {
    const { sharepaperid,status } = e.currentTarget.dataset;
    wx.setStorage({
      key: "checkedUseHistoryId",
      data: sharepaperid
    });
    wx.navigateTo({
      url: `./components/useHistoryDetail/useHistoryDetail?sharePaperId=${ sharepaperid }&status=${ status }`
    })
  },

  toReport: function (e) {
    const { id,name } = e.currentTarget.dataset,
          { shareTrigger } = this.data;
    /*当shareTrigger为true时 禁止跳转到报告详情页*/
    if( shareTrigger ){
      return;
    }else{
      wx.setStorage({
        key: 'CHECKED_REPORT_ID',
        data: id
      });
      wx.navigateTo({
        url: '../report/report?id=' + id + "&name=" + name
      });
    }
  },

  changeShareTrigger: function (e) {
    const { shareTrigger } = this.data;
    this.setData({
      shareTrigger: !shareTrigger
    })
  },

  checkboxChange: function (e) {},

  nextPage: function (e) {
    var { checkedItem,
      checkedTime,
      evaluationId,
      reportPage,
      evaluationList,
      catalog,
      historyPage,
      useList,
      compareArr,
      maxReportPage
    } = this.data;
    var that = this;
    if( checkedItem === "0" && (maxReportPage === -1 || reportPage + 1 < maxReportPage) ){
      reportPage = reportPage + 1;
      app.doAjax({
        url: "sharePapers/reports",
        method: "get",
        data: {
          orgId: app.teamId,
          userId: app.userId,
          type: checkedTime,
          page: reportPage,
          pageSize: 10,
          evaluationId: evaluationId
        },
        noLoading: true,
        success: function (res) {
          if( res.data.length <=  0) {
            var maxReportPage = reportPage - 1;
            that.setData({
              maxReportPage
            })
          };
          res.data.forEach((item,key)=>{
            const { id,name } = item.evaluation;
            if( compareArr.indexOf(id) <= -1 ){
              var catalogChild = {};
              catalogChild.id = id;
              catalogChild.name = name;
              catalog.push(catalogChild);
              compareArr.push(id);
            }
            evaluationList.push(item);
          });
          that.setData({
            evaluationList,
            catalog: catalog,
            reportPage
          });
        },
        error: function(err){
          that.setData({
            loading: false,
          });
        }
      })
    }
    if( checkedItem === "1" ){
      historyPage = historyPage + 1;
      app.doAjax({
        url: "sharePapers/batch",
        method: "get",
        data: {
          userId: app.userId,
          teamId: app.teamId,
          type: checkedTime,
          page: historyPage,
          size: 10
        },
        noLoading: true,
        success: function (res) {
          res.data.forEach((item,key)=>{
            useList.push(item)
          });
          that.setData({
            useList,
            historyPage
          });
        },
        error: function(err){
          that.setData({
            loading: false,
          });
        }
      })
    }
  }
});
