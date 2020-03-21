//发送记录
var app = getApp();
Page({
  data: {
    notext: false,
    timeAry: []
  },
  onLoad: function(options) {
    var paperDetail = wx.getStorageSync("paperDetail");
    wx.removeStorageSync("paperDetail");
    this.setData({
      paperDetail: paperDetail,
      id: options.id || ""
    });
    app.checkUser = this.onShow;
  },
  onShow: function() {
    if (!app.isLogin) return;
    this.getShareList();
    this.getPaperShareMsg();
  },
  /**获取测评分享统计信息 */
  getPaperShareMsg: function() {
    var that = this;
    app.doAjax({
      url: 'sharePaperList',
      method: 'get',
      data: {
        type: 1,
        paperId: that.data.id,
        page: 1,
        pageSize: 12
      },
      success: function(res) {
        that.setData({
          sumlist: res.data[0]
        });
      }
    });
  },
  /**获取测评的分享记录列表 */
  getShareList: function() {
    var that = this;
    app.doAjax({
      url: 'sharePaperList',
      method: 'get',
      data: {
        type: 2,
        id: that.data.id,
        page: 1,
        pageSize: 12
      },
      success: function(res) {
        var now = new Date().getTime();
        res.data.forEach(function(node) {
          console.log(node.id)
          var createdAt = node.createdAt;
          var beentime = ((now - new Date(createdAt).getTime()) / 1000 / 60 / 60).toFixed(1);
          node.beentime = beentime;
          node.createdAt = app.changeDate(node.createdAt, "yyyy-MM-dd hh:mm");
          //临时解决方案
          var peoplesId = node.peoplesId ||[];
          console.log(peoplesId);
          node.count = node.count - peoplesId.length;
          // node.count = node.count - 4;
        });
        that.setData({
          paperlist: res.data
        });
        that.getPaperShareMsg();
      }
    });
  },
  /**
   * 撤销分享
   */
  revocation: function(e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认撤销该分享？',
      success: function(ret) {
        if (ret.confirm) {
          app.doAjax({
            url: 'cancelSharePaper',
            method: 'post',
            data: {
              id: e.target.dataset.id
            },
            success: function(res) {
              console.log(res);
              app.toast('撤回成功，测评已返还');
              setTimeout(that.onShow, 1500);
            }
          });
        }
      }
    });
  },
  changePage: function(e) {
    //页面跳转
    var d = e.currentTarget.dataset;
    var child = e.target.dataset.child;
    var child1 = e.currentTarget.dataset.child;
    if (child && !child1) return;
    app.changePage(d.url, d.tab);
  },
  /**
   * 显示分享码
   */
  showImg: function(e) {
    var url = e.currentTarget.dataset.img;
    this.setData({
      shareImg: url
    });
  },
  /**
   * 隐藏分享码
   */
  closedati: function(e) {
    this.setData({
      shareImg: ""
    });
  }
})