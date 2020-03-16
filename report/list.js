// admins/reportList.js
var app = getApp();
var page = 1,
  paperId;
Page({
  data: {
    order: 0,
    orderArr: ["按时间排序", "按姓名排序"]
  },
  onLoad: function(options) {
    paperId = options.id || "";
    page = 1;
  },
  onShow: function() {
    wx.setNavigationBarTitle({
      title: app.teamName || ""
    });
    this.getList();
  },
  /**
   * 获取报告列表
   */
  getList: function() {
    var that = this;
    app.doAjax({
      url: "getReportList",
      method: "get",
      data: {
        id: paperId,
        page: page,
        pageSize: 1000
      },
      success: function(ret) {
        ret.data.forEach(function(node) {
          node.report = node.report || {};
          if (node.report.finishTime) {
            node.finishTime = node.report.finishTime;
            node.report.finishTime = app.changeDate(node.report.finishTime, "yyyy-MM-dd hh:mm");
            node.report.finishTime = node.report.finishTime.substring(2);
          }
        });
        ret.data.sort(function(n1, n2) {
          //创建时间倒序
          var it1 = new Date(n1.finishTime).getTime();
          var it2 = new Date(n2.finishTime).getTime();
          return it2 - it1;
        });
        that.setData({
          list: ret.data.slice(0, 10)
        });
        setTimeout(function() {
          that.setData({
            list: ret.data
          }, 1000);
        })
      }
    });
  },
  /**
   * 进入报告详情
   */
  toDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    var obj = this.data.list[index];
    wx.navigateTo({
      url: '../report/detail?id=' + obj.id + "&name=" + obj.paper.name
    });
  },
  /**
   * 切换排序
   */
  changeOrder: function(e) {
    var value = e.detail.value;
    var list = this.data.list;
    list.sort(function(n1, n2) {
      if (value == 1) {
        //名字顺序排序
        var it1 = n1.people.name.substring(0, 1).charCodeAt();
        var it2 = n2.people.name.substring(0, 1).charCodeAt();
        return it2 - it1;
      } else {
        //创建时间倒序
        var it1 = new Date(n1.finishTime).getTime();
        var it2 = new Date(n2.finishTime).getTime();
        return it2 - it1;
      }
    });
    this.setData({
      list: list,
      order: +value
    });
  },
  /**
   * 进入分享记录
   */
  toShareList: function() {
    wx.navigateTo({
      url: './shareList'
    });
  }
})