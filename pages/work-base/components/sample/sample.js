// pages/work-base/components/sample/sample.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chapterId:'',
    introduction:'',
    sampleQuestions:[],
    optionsAry: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      sampleQuestions:JSON.parse(options.sampleQuestions),
      chapterId:options.chapterId,
      introduction:options.introduction,
      receiveRecordId:options.receiveRecordId,
      chapterIndex:options.chapterIndex,
      chapterTotal:options.chapterTotal
    })
  },

  toAnswer(){
    const url = `/pages/work-base/components/answering/answering?chapterId=${this.data.chapterId}&receiveRecordId=${this.data.receiveRecordId}&chapterIndex=${this.data.chapterIndex}&chapterTotal=${this.data.chapterTotal}`;
    wx.navigateTo({
      url: url
    });
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