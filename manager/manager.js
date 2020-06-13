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
    checkedTime: '0',
    checkedEvaluation: '0',
    evaluationList: [],
    useList: [],
    timer: ["近七天", "近三十天", "更早"],
    catalog: ["筛选测评"],
    shareTrigger: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var { checkedItem,checkedTime } = this.data;
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
          pageSize: 10
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
            catalog: Array.from(catalogSet)
          });
          console.log("../haola/reports",res)
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
            useList: res.data
          });
        }
      })
    }
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
    /**/
    // var { checkedItem,checkedTime } = this.data;
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
    //       pageSize: 10
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
    //       console.log("../haola/reports",res)
    //     }
    //   })
    // }
    // if( checkedItem === "1" ){
    //   app.doAjax({
    //     url: "../haola/dispatchs",
    //     method: "get",
    //     data: {
    //       orgId: app.teamId,
    //       type: checkedTime,
    //       page: 1,
    //       pageSize: 10
    //     },
    //     success: function (res) {
    //       that.setData({
    //         useList: res.data
    //       });
    //       console.log("useList: res.data", res.data)
    //     }
    //   })
    // }
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
          { checkedTime } = this.data,
          that = this;
    this.setData({
      checkedItem: targetValue
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
          pageSize: 10
        },
        success: function (res) {
          that.setData({
            evaluationList: res.data
          });
          console.log(res);
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
            useList: res.data
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
      checkedTime: targetValue
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
            evaluationList: res.data
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
            useList: res.data
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
  }
});
