// station/more.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    isIos: app.isIos,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    const { id,title } = options;
    wx.setNavigationBarTitle({
      title: title
    });
    app.doAjax({
      url: `homePages/columns/${ id }/evaluations`,
      method: "get",
      success: function (res) {
        that.setData({
          list: res.data,
          loading: false
        })
      },
      fail: function (err) {
        that.setData({
          loading: false
        })
      }
    })
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
  toEvaluationDetail: function(e){
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../../components/detail/detail?id=${id}`,
    })
  }
})
