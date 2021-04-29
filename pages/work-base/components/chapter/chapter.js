// pages/work-base/components/chapter/chapter.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    evaluationName:'',
    synopses:[],
    receiveRecordId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadQuestion(options.receiveRecordId).then(res=>{
      const {evaluationName,synopses} = res
      this.setData({
        evaluationName,
        synopses,
        receiveRecordId:options.receiveRecordId
      })
    })
  },
  loadQuestion(receiveRecordId) {
    receiveRecordId = this.data.receiveRecordId || receiveRecordId;
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: `../wework/evaluations/${receiveRecordId}/chapters`,
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
  toAnswer(e){
    const {chapterId,chapterIndex,chapterTotal} = e.currentTarget.dataset
    const url = `/pages/work-base/components/answering/answering?chapterId=${chapterId}&receiveRecordId=${this.data.receiveRecordId}&chapterIndex=${chapterIndex+1}&chapterTotal=${chapterTotal}`;
    wx.navigateTo({
      url: url
    });
  },
  toSample(e) {
    const {chapterId,introduction,chapterIndex,chapterTotal} = e.currentTarget.dataset
    var url = ''
    if(this.data.synopses[chapterIndex].sampleQuestions.length>0){
      url = `/pages/work-base/components/sample/sample?chapterId=${chapterId}&introduction=${introduction}&receiveRecordId=${this.data.receiveRecordId}&chapterIndex=${chapterIndex}&chapterTotal=${chapterTotal}`;
    }else{
      url = `/pages/work-base/components/answering/answering?chapterId=${chapterId}&receiveRecordId=${this.data.receiveRecordId}&chapterIndex=${chapterIndex+1}&chapterTotal=${chapterTotal}`;
    }
    
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