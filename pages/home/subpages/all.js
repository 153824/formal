const app = getApp()
Page({
  data: {
    columnId: '',
    evaluations: []
  },

  onLoad: function (options) {
    this.getEvaluations(options.columnId)
        .then(res=>{
          this.setData({
            evaluations: res
          })
        })
        .catch(err=>{
          console.error(err);
        })
  },

  getEvaluations(columnId) {
    const p = new Promise((resolve, reject) => {
      app.doAjax({
        url: `homePages/columns/${columnId}/evaluations`,
        method: "get",
        noLoading: true,
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err);
        }
      });
    })
    return p;
  },

  gotoDetail: function (e) {
    const {id} = e.currentTarget.dataset;
    if (id.startsWith("http")) {
      wx.setStorageSync("webView_Url", id);
      wx.navigateTo({
        url: '../../common/webView',
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/station/components/detail/detail?id=${id}`,
      success: function () {
      }
    });
  },
})