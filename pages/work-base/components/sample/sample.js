import debounce from "../../../../utils/lodash/debounce";
import {QUES_TYPE} from './const/index';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chapterId:'',
    introduction:'',
    sampleQuestions:[],
    optionsAry: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    hasVanishImageSetting:[],
    multipleQuesHTML: "<span style='display: inline-block;box-sizing: border-box;height: 20px;font-size: 15px;font-weight: 600;color: #353EE8;line-height: 20px;margin-right: 10px;'>【多选题】</span>",
    percentQuesHTML: "<span style='display: inline-block;box-sizing: border-box;height: 20px;font-size: 15px;font-weight: 600;color: #353EE8;line-height: 20px;margin-right: 10px;'>【分数分配题】</span>",
    answerSheet: {},
    questionStep:0,
    fill: false,
    receiveRecordId: '',
    size: 1,
    scrollTop: 0, 
    outSideScrollTop: 0,
    computeScrollTop: 0,
    extraNodes: [],
    synopses:[],
    isChapter: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
        receiveRecordId:options.receiveRecordId,
        isChapter: options.isChapter
    })
    this.loadQuestion(options.receiveRecordId).then(res=>{
        const {synopses} = res
        const sampleQuestions = options.isChapter ? synopses[options.chapterIndex].sampleQuestions : res.sampleQuestions;
        var hasVanishImageSetting = Array.apply(null,{length:sampleQuestions.length})
        sampleQuestions.forEach((que,queIndex) => {
          if(que.question.vanishImageSetting){
              que.question.stem = que.question.stem.replace(/<img.*?(?:>|\/>)/gi,'')
              var newObj = que.question.vanishImageSetting
              newObj['isShow'] = true
              hasVanishImageSetting.splice(queIndex,1,newObj)
          }
        })
        if(options.isChapter){
            this.setData({
                sampleQuestions,
                chapterId:options.chapterId,
                introduction:options.introduction,
                chapterIndex:options.chapterIndex,
                chapterTotal:options.chapterTotal,
                hasVanishImageSetting,
            })
        } else {
            this.setData({
                sampleQuestions,
                introduction: res.introduction,
                hasVanishImageSetting,
            })
        }
    })
  },
  loadQuestion(receiveRecordId, hasChapter=true) {
    receiveRecordId = this.data.receiveRecordId || receiveRecordId;
    let url = `../wework/evaluations/${receiveRecordId}/chapters`;
    if(hasChapter){
        url = `../wework/evaluations/${receiveRecordId}/synopsis`
    }
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url,
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
  answerSheetItem(questionIndex) {
    const {sampleQuestions} = this.data;
    const {type, options, indexedOptions} = sampleQuestions[questionIndex].question;
    const targetItem = {
        questionId: sampleQuestions[questionIndex].question.id,
        indexes: type === 'PROPORTION' ? new Array(options.length).fill(0) : [],
    };
    if(type === 'SORTING'){
        targetItem.indexes = indexedOptions.map(item=>{
            return item.index;
        });
    }
    return targetItem;
  },
  paperScroll(e) {
    console.log('paperScroll: ', e.detail.scrollTop);
    this.setData({
        outSideScrollTop: e.detail.scrollTop
    });
  },
  init() {
    const {sampleQuestions} = this.data;
    const that = this
    sampleQuestions.forEach((item,index) => {
      if(item.question.type === 'SORTING'){
        that.drag = that.selectComponent(`#drag-${index}`);
        if(that.drag){
          that.drag.init();
        }
      }
    })
  },
  dragScroll(e) {
      this.setData({
          computeScrollTop: e.detail.scrollTop
      });
  },
  selectQuesItem: debounce(function(e) {
      const {questionIndex, optionIndex, questionId} = e.currentTarget.dataset;
      // console.log(questionIndex, optionIndex);
      const {answerSheet, sampleQuestions} = this.data;
      const {type, leastChoice, mostChoice} = sampleQuestions[questionIndex].question;
      const targetSheet =  JSON.parse(JSON.stringify(answerSheet));
      if(optionIndex < 0 || questionIndex < 0){
          app.toast('题目或选项为空');
          return;
      }
      if(type === QUES_TYPE[0] && questionIndex !== sampleQuestions.length-1){
          this.setData({
              isChangeQue: true,
          })
      }
      if(type === QUES_TYPE[1] && answerSheet[questionId] && answerSheet[questionId].indexes){
          const {indexes} = answerSheet[questionId];
          if(indexes.length >= mostChoice && !indexes.includes(optionIndex)){
              app.toast(`最多选中${mostChoice}个选项`)
              return;
          }
      }
      const targetItem = this.answerSheetItem(questionIndex);
      if(Object.keys(answerSheet).length - 1 < questionIndex){
          targetItem.indexes.push(optionIndex);
          targetSheet[questionId] = targetItem;
      }
      if(Object.keys(answerSheet).length - 1 >= questionIndex){
          switch (type) {
              case QUES_TYPE[0]:
                  targetSheet[questionId].indexes = [optionIndex];
                  break;
              case QUES_TYPE[1]:
                  answerSheet[questionId].indexes.push(optionIndex);
                  let targetIndexes = answerSheet[questionId].indexes;
                  targetIndexes = this.filterSameEle(targetIndexes);
                  targetSheet[questionId].indexes = targetIndexes;
                  break;
              default:
                  break;
          }
      }
      this.setData({
          answerSheet: targetSheet
      });
      if(type === QUES_TYPE[0]){
          if(questionIndex+1 !== sampleQuestions.length){
              this.nextQues(questionIndex)
          }
      }
      if(questionIndex+1 === sampleQuestions.length){
          this.judge().then(({fill})=>{
              if(fill){
                  this.setData({
                      fill: true
                  })
              }
          })
      }
  },0,{
      trailing: true,
      leading: false,
  }),

  checkSliderValue(value) {
    const NUMBER_REG = new RegExp(/^[0-9]*$/);
    if (!NUMBER_REG.test(value)) {
        app.toast("必须输入数字");
        return false;
    }
    return true;
  },
  onChangeSlider: debounce(function (e) {
      const {answerSheet, sampleQuestions} = this.data;
      const {optionIndex, questionIndex} = e.currentTarget.dataset;
      const {totalScore} = sampleQuestions[questionIndex].question;
      let value = Number(e.detail.value);
      if(value > totalScore){
          value = totalScore;
      }
      if(!this.checkSliderValue(value)){
          value = 0;
      }
      const {options} = sampleQuestions[questionIndex].question;
      const targetSheet = JSON.parse(JSON.stringify(answerSheet));
      const targetItem = this.answerSheetItem(questionIndex);
      /*用户无作答记录的情况*/
      if(Object.keys(answerSheet).length - 1 < questionIndex){
          targetItem.indexes[optionIndex] = value;
          targetSheet[sampleQuestions[questionIndex].question.id]=targetItem
      }
      /*用户有作答记录的情况*/
      if(Object.keys(answerSheet).length - 1 >= questionIndex){
        let indexes = targetSheet[sampleQuestions[questionIndex].question.id]['indexes'];
          if(indexes.length !== options.length){
              indexes = new Array(options.length).fill(0);
          }
          indexes[optionIndex] = value;
      }
      this.setData({
          answerSheet: targetSheet,
      });
      if(questionIndex+1 === sampleQuestions.length){
          this.judge().then(({fill})=>{
              this.setData({
                  fill
              })
          })
      }
  },200, {
      leading: false,
      trailing: true
  }),
  filterSameEle(arr) {
    if(!arr.length){
        return [];
    }
    const sames = [];
    arr.sort();
    for(let i =0; i < arr.length; i++){
        if(arr[i] === arr[i+1] && (!sames.includes(arr[i])) ){
            sames.push(arr[i]);
            i++;
        }
    }
    const targetArr = [];
    arr = arr.forEach((item, key)=>{
        if(!sames.includes(item)){
            targetArr.push(item);
        }
    });
    return targetArr;
  },

  judge() {
      /**
       * flag:是否满足题型要求
       * fill: 是否完成所有题目
       * text: toast文案
      */
      let flag = false;
      let fill = false;
      let text = '';
      const {questionStep, answerSheet, sampleQuestions, sortedList} = this.data;
      const {type, leastChoice, mostChoice, totalScore} = sampleQuestions[questionStep].question;
      const indexes = answerSheet[sampleQuestions[questionStep].question.id] && answerSheet[sampleQuestions[questionStep].question.id].indexes ? answerSheet[sampleQuestions[questionStep].question.id].indexes : [] ;
      const p = new Promise((resolve, reject) => {
          try{
              switch (type) {
                  case QUES_TYPE[0]:
                      /*是否完成对应的题目要求*/
                      if(indexes.length){
                          flag = true;
                      } else {
                          text = `至少选中1个选项`
                      }
                      console.log()
                      /*是否完成所有题目*/
                      if(questionStep+1 === sampleQuestions.length && flag) {
                          fill = true;
                      }
                      break;
                  case QUES_TYPE[1]:
                      /*是否完成对应的题目要求*/
                      if(indexes.length > mostChoice){
                          text = `最多选中${mostChoice}个选项`
                      } else if (indexes.length < leastChoice) {
                          text = `至少选中${leastChoice}个选项`
                      } else {
                          flag = true;
                      }
                      /*是否完成所有题目*/
                      if(questionStep+1 === sampleQuestions.length && flag) {
                          fill = true;
                      }
                      break;
                  case QUES_TYPE[2]:
                      let targetScore = 0;
                      indexes.forEach(item=>{
                          targetScore = targetScore + item;
                      });
                      if(targetScore !== totalScore){
                          text = `各项分数之和必须等于${totalScore}分`
                      } else {
                          flag = true;
                      }
                      if(questionStep+1 === sampleQuestions.length && flag) {
                          fill = true;
                      }
                      break;
                  case QUES_TYPE[3]:
                      flag = true;
                      if(questionStep+1 === sampleQuestions.length) {
                          fill = true;
                      }
                      break;
              }
              resolve({flag, text, fill})
          }
          catch (err) {
              reject(err);
          }
      });
      return p;
  },

  openImg(event) {
    var hasVanishImageSetting = this.data.hasVanishImageSetting
    hasVanishImageSetting[event.currentTarget.dataset.questionStep].isShow = false
    var time = hasVanishImageSetting[event.currentTarget.dataset.questionStep].standingInSeconds
    var intervarl = setInterval(()=>{
        time--
        if(time===0){
            clearInterval(intervarl)
        }
        hasVanishImageSetting[event.currentTarget.dataset.questionStep].standingInSeconds = time
        this.setData({
            hasVanishImageSetting
        })
    },1000)
    this.setData({
        hasVanishImageSetting
    });
  },
  toAnswer(){
    const {isChapter} = this.data;
    const url = isChapter ? `/pages/work-base/components/answering/answering?chapterId=${this.data.chapterId}&receiveRecordId=${this.data.receiveRecordId}` : `/pages/work-base/components/answering/answering?receiveRecordId=${this.data.receiveRecordId}`;
    wx.redirectTo({
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
    this.init();
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