// manager/manager.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    titleHeight: app.globalData.titleHeight,
    statusbarHeight: app.globalData.statusbarHeight,
    checkedItem: '0',
    checkedTime: '2',
    checkedEvaluation: '0',
    evaluationList: [],
    useList: [],
    timer: ["近七天","近三十天", "全部时间"],
    catalog: ["筛选测评"],
    shareTrigger: false,
    evaluationId: "",
    reportPage: 1,
    historyPage: 1,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { redirectToIndex,redirectReportId } = app.globalData;
    if( redirectReportId ){
      wx.navigateTo({
        url: `../report/detail?id=${ app.globalData.redirectReportId }`,
      });
      app.globalData.redirectReportId = null;
    }
    // if( redirectToIndex ){
    //   wx.switchTab({
    //     url: `../index/index`,
    //   });
    //   app.globalData.redirectToIndex = false;
    // }
    // var { checkedItem,checkedTime,evaluationId } = this.data;
    // var that = this;
    // if( checkedItem === "0" ){
    //   app.doAjax({
    //     url: "../haola/reports",
    //     method: "get",
    //     data: {
    //       orgId: app.teamId,
    //       userId: app.userId,
    //       type: checkedTime,
    //       page: 1,
    //       pageSize: 10,
    //       evaluationId: evaluationId
    //     },
    //     success: function (res) {
    //       var catalog = [];
    //       res.data.forEach((item,key)=>{
    //         catalog.push(item.evaluation.name)
    //       });
    //       catalog.unshift("全部测评");
    //       /*数组去重*/
    //       var catalogSet = new Set(catalog);
    //
    //       that.setData({
    //         evaluationList: res.data,
    //         catalog: Array.from(catalogSet)
    //       });
    //     }
    //   })
    // }
    // if( checkedItem === "1" ){
    //   // sharePapers/batch?userId=5eb21d15eb4b2d000892d14e&teamId=5e1985617d5774006ac4533e&page=2&size=101
    //   console.log("I checked it",checkedItem);
    //   app.doAjax({
    //     url: "sharePapers/batch",
    //     method: "get",
    //     data: {
    //       userId: app.userId,
    //       teamId: app.teamId,
    //       type: checkedTime,
    //       page: 1,
    //       size: 10
    //     },
    //     success: function (res) {
    //       that.setData({
    //         useList: res.data
    //       });
    //     }
    //   })
    // }
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
    /*1.获取title组件 2.调用title组件的*/
    this.title = this.selectComponent("#title");
    app.getUserInfo(this.title.loadUserMsg.call(this.title._this()));
    var { checkedItem,checkedTime,evaluationId } = this.data;
    var that = this;
    if( checkedItem === "0" ){
      app.doAjax({
        url: "../haola/reports",
        method: "get",
        data: {
          orgId: app.teamId,
          userId: app.userId,
          type: checkedTime,
          page: 1,
          pageSize: 10,
          evaluationId: evaluationId
        },
        success: function (res) {
          var catalog = [];
          res.data.forEach((item,key)=>{
            catalog.push(item.evaluation.name)
          });
          catalog.unshift("全部测评");
          /*数组去重*/
          var catalogSet = new Set(catalog);

          that.setData({
            evaluationList: res.data,
            catalog: Array.from(catalogSet),
            loading: false,
          });
        }
      })
    }
    if( checkedItem === "1" ){
      // sharePapers/batch?userId=5eb21d15eb4b2d000892d14e&teamId=5e1985617d5774006ac4533e&page=2&size=101
      console.log("I checked it",checkedItem);
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
        success: function (res) {
          that.setData({
            useList: res.data,
            loading: false,
          });
        }
      })
    }
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
    const targetValue = e.currentTarget.dataset.item,
          { checkedTime,evaluationId } = this.data,
          that = this;
    this.setData({
      checkedItem: targetValue,
      loading: true
    });
    if( targetValue === "0" ){
      app.doAjax({
        url: "../haola/reports",
        method: "get",
        data: {
          orgId: app.teamId,
          userId: app.userId,
          type: checkedTime,
          page: 1,
          pageSize: 10,
          evaluationId: evaluationId
        },
        success: function (res) {
          that.setData({
            evaluationList: res.data,
            loading: false,
          });
        }
      })
    }
    if( targetValue === "1" ){
      // sharePapers/batch?userId=5eb21d15eb4b2d000892d14e&teamId=5e1985617d5774006ac4533e&page=2&size=101
      console.log("checkedItem === \"1\"");
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
        success: function (res) {
          that.setData({
            useList: res.data,
            loading: false,
          });
        }
      })
    }
  },
  changeTimer: function (e) {
    const targetValue = e.detail.value,
          { checkedItem } = this.data,
          that = this;
    console.log("targetValue: ",targetValue);
    this.setData({
      checkedTime: targetValue,
      loading: true
    });
    if( checkedItem === "0" ){
      app.doAjax({
        url: "../haola/reports",
        method: "get",
        data: {
          orgId: app.teamId,
          userId: app.userId,
          type: targetValue,
          page: 1,
          pageSize: 10
        },
        success: function (res) {
          that.setData({
            evaluationList: res.data,
            loading: false
          });
        }
      })
    }
    if( checkedItem === "1" ){
      // sharePapers/batch?userId=5eb21d15eb4b2d000892d14e&teamId=5e1985617d5774006ac4533e&page=2&size=101
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
        success: function (res) {
          that.setData({
            useList: res.data,
            loading: false
          });
        }
      })
    }
  },
  changeEvaluation: function (e) {
    var checkedEvaluation = e.detail.value;
    this.setData({
      checkedEvaluation: checkedEvaluation
    });
  },
  changePage: function (e) {
    const { sharepaperid,status } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `useHistoryDetail?sharePaperId=${ sharepaperid }&status=${ status }`
    })
  },
  toReport: function (e) {
    const { id,name } = e.currentTarget.dataset,
          { shareTrigger } = this.data;
    /*当shareTrigger为true时 禁止跳转到报告详情页*/
    if( shareTrigger ){
      return;
    }else{
      wx.navigateTo({
        url: '../report/detail?id=' + id + "&name=" + name
      });
    }
  },
  changeShareTrigger: function (e) {
    const { shareTrigger } = this.data;
    this.setData({
      shareTrigger: !shareTrigger
    })
  },
  checkboxChange: function (e) {
    console.log(e.detail.id)
  },
  nextPage: function (e) {
    var { checkedItem,
          checkedTime,
          evaluationId,
          reportPage,
          evaluationList,
          catalog,
          historyPage,
          useList
        } = this.data;
    var that = this;
    if( checkedItem === "0" ){
      reportPage = reportPage + 1;
      app.doAjax({
        url: "../haola/reports",
        method: "get",
        data: {
          orgId: app.teamId,
          userId: app.userId,
          type: checkedTime,
          page: reportPage,
          pageSize: 10,
          evaluationId: evaluationId
        },
        success: function (res) {
          res.data.forEach((item,key)=>{
            catalog.push(item.evaluation.name);
            evaluationList.push(item);
          });
          catalog.unshift("全部测评");
          /*数组去重*/
          var catalogSet = new Set(catalog);
          that.setData({
            evaluationList,
            catalog: Array.from(catalogSet),
            reportPage
          });
        }
      })
    }
    if( checkedItem === "1" ){
      // sharePapers/batch?userId=5eb21d15eb4b2d000892d14e&teamId=5e1985617d5774006ac4533e&page=2&size=101
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
        success: function (res) {
          res.data.forEach((item,key)=>{
            useList.push(item)
          });
          that.setData({
            useList,
            historyPage
          });
        }
      })
    }
  }
});
