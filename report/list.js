// admins/reportList.js
var app = getApp();
var page = 1, noNext = false,
  paperId;
Page({
  data: {
    list: [],
    order: 0,
    orderType :0,
    orderArr: ["按时间排序", "按姓名排序"]
  },
  onLoad: function (options) {
    paperId = options.id || "";
    page = 1;
    noNext = false;
   
  },
  onShow: function () {
    wx.setNavigationBarTitle({
      title: app.teamName || ""
    });
    this.getList();
  },
  /**
   * 获取报告列表
   */
  getList: function () {
    var that = this;
    app.doAjax({
      url: "getReportList",
      method: "get",
      data: {
        id: paperId,
        page: page,
        pageSize: 12
      },
      success: function (ret) {
        ret.data.forEach(function (node) {
          // node.report = node.report || {};
          if (node.updatedAt) {
            // node.updatedAt = node.updatedAt;
            node.updatedAt = app.changeDate2(node.updatedAt, "MM-dd");
            // node.report.finishTime = node.report.finishTime.substring(2);
          }
        });
        var list = that.data.list.concat(ret.data);
        list.sort(function (n1, n2) {
          if (that.data.orderType == 0) {
            //创建时间倒序
            var it1 = new Date(n1.updatedAt).getTime();
            var it2 = new Date(n2.updatedAt).getTime();
            return it2 - it1;
          } else {
            //名字顺序排序
            var it1 = n1.people.name.trim().substring(0, 1).charCodeAt();
            var it2 = n2.people.name.trim().substring(0, 1).charCodeAt();
            return it2 - it1;
          }
        });
        if (ret.data.length < 12) {
          noNext = true;
        }
        // var list = that.data.list.concat(ret.data);
        if (page == 1) {
          list = ret.data;
        }
        that.setData({
          list: list
        });
      }
    });
  },

  /**
   * 进入报告详情
   */
  toDetail: function (e) {
    var index = e.currentTarget.dataset.index;
    var obj = this.data.list[index];
    if (!obj.isRead) {
      obj.isRead = true;
      this.data.list[index] = obj;
    }
    wx.navigateTo({
      url: '../report/detail?id=' + obj.id + "&name=" + obj.paper.name
    });
  },
  /**
   * 切换排序
   */
  changeOrder: function (e) {
    var value = e.detail.value;
    this.data.orderType=value;
    var list = this.data.list;
    list.sort(function (n1, n2) {
      if (value == 1) {
        //名字顺序排序
        var it1 = n1.people.name.substring(0, 1).charCodeAt();
        var it2 = n2.people.name.substring(0, 1).charCodeAt();
        return it2 - it1;
      } else {
        //创建时间倒序
        var it1 = new Date(n1.updatedAt).getTime();
        var it2 = new Date(n2.updatedAt).getTime();
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
  toShareList: function () {
    wx.navigateTo({
      url: './shareList'
    });
  },
  onReachBottom: function (e) {
    if (noNext) return;
    page += 1;
    this.getList();
  }
})