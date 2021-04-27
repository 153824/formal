// pages/work-base/components/chapter/chapter.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    evaluationName:'',
    synopses:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadQuestion(options.receiveRecordId).then(res=>{
      if(res.paper&&!res.chapter){
        const url = `/pages/work-base/components/answering/answering?evaluationId=${options.evaluationId}&releaseRecordId=${options.releaseRecordId}&receiveRecordId=${options.receiveRecordId}&reportPermit=${reportPermit}&status=${options.status}`;
        wx.navigateTo({
          url: url
        });
      }else{
        const {evaluationName,synopses} = res.chapter
        this.setData({
          evaluationName,
          synopses
        })
      }
    })
  },
  toSample(e) {
    const chapterId = e.currentTarget.dataset.chapterId
    const url = `/pages/work-base/components/sample/sample?chapterId=${chapterId}`;
    wx.navigateTo({
      url: url
    });
  },
  loadQuestion(receiveRecordId) {
    receiveRecordId = this.data.receiveRecordId || receiveRecordId;
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: `../wework/evaluations/${receiveRecordId}/paper`,
            method: 'GET',
            success(res){
                resolve(res);
            },
            error(err){
                reject(err);
            }
        })
    });
    return p;
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})