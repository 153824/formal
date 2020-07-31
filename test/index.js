// test/index.js
var app = getApp();
var sKey = "";
var quesIdsOrder = [];
var answerTimeOut;
var saveTimeOut;
Page({
  data: {
    isChangeQue: false,
    numArr: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
    html: "<span style='display: inline-block;padding: 0px 10px;box-sizing: border-box;height: 20px;background: rgba(36, 88, 240, 1);border-radius: 3px;font-size: 13px;font-weight: 400;color: rgba(255, 255, 255, 1);line-height: 20px;margin-right: 10px;'>多选题</span>",
    isFillAll: false,
    count: 5,
    array: [
      '小学',
      '初中',
      '高中',
      '中技（中专 / 技校 / 职高）',
      '大专',
      '本科',
      '硕士研究生',
      'MBA',
      '博士研究生'
    ],
    sex: ["男", "女"],
    checkedSex: 0,
    birthday: '1995-01',
    education: 5,
    imgUrl: '',
    selImg: "",
    getphoneNum: false,
    pathIndex: 1,
    optionsAry: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    swiperCurrent: 0,
    paperList: "",
    phoneModel: app.isIphoneX,
    answers: {},
    phoneNumber: "微信一键授权",
    username: app.globalData.userMsg.nickname || "好啦访客",
    lastAnswer: [],
    theFinalQuestionAnswer: [],
  },

  onLoad: function (options) {
    var that = this;
    that.setData({
      applyStatus: options.type,
      startTime: new Date().getTime()
    });
    if (app.isTest || !app.isTest ) {
      that.setData({
        // pathIndex: 2
        pathIndex: 3
      });
    }
    quesIdsOrder = [];
    sKey = "oldAnswer" + options.id;
    var oldData = wx.getStorageSync(sKey);
    if( oldData.pathIndex == "2" || oldData.pathIndex == "1" ){
      oldData.pathIndex = 3
    }
    var storages = wx.getStorageInfoSync().keys;
    storages.forEach(function (n) {
      if (n.indexOf("oldAnswer") == 0 && n != sKey) {
        wx.removeStorageSync(n);
      }
    });
    var getphoneNum = false;
    var userPhone = (app.globalData.userInfo || {}).phone;
    console.log("userPhone: ", app.globalData.userInfo);
    if (userPhone) {
      getphoneNum = true;
    }
    var oldPeopleMsg = wx.getStorageSync("oldPeopleMsg");
    wx.removeStorageSync("oldPeopleMsg");
    if (oldPeopleMsg) {
      oldPeopleMsg["education"] = that.data.array.indexOf(oldPeopleMsg.educationName);
      that.setData(oldPeopleMsg);
    }
    app.doAjax({
      url: "paperQues",
      method: "get",
      data: {
        id: options.pid
      },
      success: function (res) {
        if (oldData) {
          quesIdsOrder = oldData.quesIdsOrder || [];
        }
        var ques = [];
        var ques1 = [];
        var showQues = [];
        var oldChapter = oldData.chapter;

        res.ques.forEach(function (node) {
          node.stem = node.stem.replace(/<img/g, "<img style='max-width:100%;'");
          node.stem = node.stem.replace(/\n/g, "<br>");
          node.options = node.options.join("&&|").replace(/<img/g, "<img style='max-width:100%;'").split("&&|");
          if (!oldData || !oldData.quesIdsOrder) {
            quesIdsOrder.push(node.id);
            ques.push(node);
            if(node.type==3){
              node.slider = new Array(node.options.length).fill(0);
              node.totalScore = node.totalScore;
              node.step = Math.floor(node.totalScore/5);
              node.stepArr = [];
              if( node.totalScore < 5 ){
                node.step = 1;
                for(let i =0;i<node.totalScore;i++){
                  node.stepArr.push(Math.floor(i*node.step));
                }
              }else{
                for(let i =0;i<5;i++){
                  node.stepArr.push(Math.floor(i*node.step));
                }
              }
            }
            ques1.push(node);
            console.log("node-1：",node);
            if (showQues.length < 5) {
              showQues.push(node);
            }
          } else {
            var i = quesIdsOrder.indexOf(node.id);
            ques[i] = node;
            if(node.type==3){
              node.slider = new Array(node.options.length).fill(0);
              node.totalScore = node.totalScore;
              node.step = Math.floor(node.totalScore/5);
              node.stepArr = [];
              if( node.totalScore < 5 ){
                node.step = 1;
                for(let i =0;i<node.totalScore;i++){
                  node.stepArr.push(Math.floor(i*node.step));
                }
              }else{
                for(let i =0;i<5;i++){
                  node.stepArr.push(Math.floor(i*node.step));
                }
              }
            }
            ques1[i] = node;
            console.log("node-2：",node);
            var oldswiperCurrent = oldData.swiperCurrent;
            var i1 = oldswiperCurrent - i;
            if (i1 > -3 && i1 < 3) {
              showQues[i] = node;
            }
          }
        });
        if (!oldChapter) {
          if (res.chapter && res.chapter.length) {
            //有分章节
            res.chapter.forEach(function (node, index) {
              node.status = 1;
              if (index > 0) {
                node.status = 2;
              }
            });
          }
        } else {
          res.chapter = oldChapter;
        }

        res.ques = ques;
        that.setData({
          quesAll: ques1,
          chapter: res.chapter || [],
          getphoneNum: getphoneNum,
          id: options.id,
          paperId: options.pid,
          showQues: showQues,
          paperList: res,
          time: ((res.chapter || [])[0] || {}).time || ""
        });
        if (app.isTest) {
          that.setData({
            imgUrl: "123",
            username: "AA",
            birthday: "2019",
            education: "1",
            pathIndex: 3
          });
          // that.toTimeDown();
        }
        if (oldData) {
          wx.showToast({
            icon: 'none',
            title: '已为您恢复上次作答'
          });
          that.setData(oldData);
          that.toAnswerIt(null, oldData);
          var startTime = oldData.startTime;
          // var endTime = oldData.endTime;
          var now = new Date().getTime();

          // oldData["startTime"] = startTime + (now - endTime);
          if ((now - startTime) > (6 * 60 * 60 * 1000)) {
            //答题时长超过6小时
            wx.showModal({
              title: '作答提示',
              content: '答题时长超过6小时，已自动提交',
              showCancel: false,
              success: function () {
                that.formSubmit();
              }
            });
            return;
          }
          if (oldData.pathIndex == 2) {
            that.toTimeDown();
          }
        } else if (res.chapter[0] && that.data.pathIndex == 3) {
          that.toAnswerIt();
        }
        saveTimeOut = setTimeout(that.saveDraftAnswer, 30000);
      }
    });
    wx.cloud.init();
  },
  pageTouch: function () {

  },
  onShow: function () {
    const that = this;
    console.log("wx.getStorageSync(\"openId\")",wx.getStorageSync("openId"));
    app.doAjax({
      url: "/userDetail",
      method: "get",
      data: {
        openid: wx.getStorageSync("openId") || app.globalData.userInfo.openId,
      },
      success: function (res) {
        that.setData({
          getphoneNum: true,
          phoneNumber: res.data.phone
        });
      }
    })
  },
  onHide: function () {
    saveTimeOut && clearTimeout(saveTimeOut);
    answerTimeOut && clearTimeout(answerTimeOut);
  },
  onUnload: function () {
    saveTimeOut && clearTimeout(saveTimeOut);
    answerTimeOut && clearTimeout(answerTimeOut);
  },
  // 答题前填写个人信息部分
  userInput: function (e) {
    var value = e.detail.value;
    var name = e.currentTarget.dataset.n;
    var obj = {};
    obj[name] = value;
    console.log("obj[name] = value: ", obj);
    console.log(this.data);
    this.setData(obj);
  },
  sexInput: function (e) {
    const { value } = e.detail;
    // const checkedSex = value === 0 ? ;
    this.setData({
      checkedSex: value,
    })
  },
  takePhoto: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success(res) {
        // wx.showLoading({
        //   title: '上传图片...',
        // });
        // tempFilePath可以作为img标签的src属性显示图片
        var imgUrl = res.tempFilePaths[0];
        that.setData({
          selImg: imgUrl
        });
        var imgType = imgUrl.split(".");
        imgType = imgType[imgType.length - 1];
        var fileName = app.globalData.userInfo.id + "/" + (new Date().getTime()) + "." + imgType;
        app.qiniuUpload.upload(imgUrl, function (file) {
          wx.hideLoading();
          //成功
          that.setData({
            imgUrl: "http://" + file.imageURL
          });
        }, function (err) {
          wx.hideLoading();
          wx.showToast({
            title: '图片上传失败，请重试！',
            icon: "none",
            duration: 3000,
          });
          console.log("err", err);
        }, {
          key: fileName
        });
      }
    })
  },
  submit: function (e) {
    const { name } = e.target.dataset;
    var that = this;
    function doNext() {
      var data = that.data;
      var imgUrl = data.imgUrl;
      var username = data.username;
      var birthday = data.birthday;
      var education = data.education;
      if (!username || !(/^[\u4E00-\u9FA5A-Za-z]+$/.test(username))) {
        app.toast("请输入正确的姓名！");
        return;
      }
      if (education == -1) {
        app.toast("请选择学历信息！");
        return;
      }
      if (!birthday) {
        app.toast("请选择出生年月！");
        return;
      }
      // if (!imgUrl) {
      //   app.toast("请先拍照上传！");
      //   return;
      // }
      that.gototest();
      wx.aldstat.sendEvent('进入答题页面', {
        '测评名称': '名称：' + name
      });
    }
    if (!that.data.getphoneNum) {
      var detail = e.detail;
      var iv = detail.iv;
      var encryptedData = detail.encryptedData;
      if (encryptedData) {
        //用户授权手机号
        var userMsg = app.globalData.userMsg || {};
        userMsg["iv"] = iv;
        userMsg["encryptedData"] = encryptedData;
        app.doAjax({
          url: "updatedUserMobile",
          data: userMsg,
          success: function (ret) {
            that.setData({
              getphoneNum: true
            });
            doNext();
          }
        });
      }
      return;
    } else {
      doNext();
    }
  },
  gotoallready: function () {
    //进入答题前说明
    var that = this;
    that.setData({
      count: 5,
      pathIndex: 3
    });
    that.saveAnswerStorageSync();
    that.toTimeDown();
    that.gototest();
  },
  /**
   * 倒计时
   */
  toTimeDown(timeKey, callBack) {
    var that = this;
    timeKey = timeKey || "count";

    function timeDown() {
      var time = that.data[timeKey];
      time = time - 1
      if (time <= 0) {
        if (callBack) {
          callBack();
          return;
        }
        that.setData({
          count: 0,
          isok: true
        });
        return;
      }
      var obj = {};
      obj[timeKey] = time;
      var timeDownFull = "";
      var h = parseInt(time / 3600);
      var m = parseInt((time - h * 3600) / 60);
      var s = (time - h * 3600) - m * 60;
      if (h < 10) {
        timeDownFull = timeDownFull + ("0" + h + ":");
      } else {
        timeDownFull = timeDownFull + (h + ":");
      }
      if (m < 10) {
        timeDownFull = timeDownFull + ("0" + m + ":");
      } else {
        timeDownFull = timeDownFull + (m + ":");
      }
      if (s < 10) {
        timeDownFull = timeDownFull + ("0" + s);
      } else {
        timeDownFull = timeDownFull + s;
      }
      obj[timeKey + "Full"] = timeDownFull;
      that.setData(obj);
      answerTimeOut = setTimeout(timeDown, 1000);
    }
    answerTimeOut = setTimeout(timeDown, 1000);
  },
  //答题前信息展示部分
  gototest: function () {
    // if (!this.data.isok) return;
    var pathIndex = 3;
    if (this.data.chapter && this.data.chapter.length > 1) {
      pathIndex = 4;
    }
    if (pathIndex == 3 && this.data.chapter[0]) {
      this.toAnswerIt();
    }
    this.setData({
      startTime: new Date().getTime(),
      pathIndex: pathIndex
    });
    this.saveAnswerStorageSync();
  },
  //正式答题部分
  prev: function (e) {
    //上一题
    var that = this;
    that.setData({
      isChangeQue: true
    });
    var data = that.data;
    var showQues = data.showQues;
    var ques = data.quesAll;
    var swiperCurrent = data.swiperCurrent;
    swiperCurrent = swiperCurrent > 0 ? swiperCurrent - 1 : 0;
    if (!showQues[swiperCurrent - 1] && ques[swiperCurrent - 1]) {
      showQues[swiperCurrent - 1] = ques[swiperCurrent - 1];
    }
    if (!showQues[swiperCurrent - 2] && ques[swiperCurrent - 2]) {
      showQues[swiperCurrent - 2] = ques[swiperCurrent - 2];
    }
    var swiperCurrent1 = swiperCurrent;
    if (swiperCurrent >= 3) {
      swiperCurrent1 = 2;
    }
    that.setData({
      swiperCurrent1: (swiperCurrent1 - 1) < 1 ? swiperCurrent1 : (swiperCurrent1 - 1)
    }, function () {
      setTimeout(function () {
        that.setData({
          isChangeQue: false,
          showQues: showQues,
          swiperCurrent1: swiperCurrent1,
          swiperCurrent: swiperCurrent
        });
        that.saveAnswerStorageSync();
      }, 350);
    });
  },

  next: function (e, oldIndex, newD) {
    //下一题
    var that = this;
    var { swiperCurrent,quesAll,theFinalQuestionAnswer } = this.data;
    var finalTotalScore = quesAll[quesAll.length-1].totalScore;
    var score = 0;
    if( theFinalQuestionAnswer.length > 0 && swiperCurrent + 1 === quesAll.length){
      theFinalQuestionAnswer.forEach(((value, index) => {
        score = value + score;
      }));
      if ( score === finalTotalScore ){
        console.log("theFinalQuestionAnswer", theFinalQuestionAnswer);
        this.setData({
          isFillAll: true,
        });
      }
    }
    that.setData({
      isChangeQue: true
    });
    var d = {};
    var data = that.data;
    var showQues = data.showQues;
    var ques = data.quesAll;
    var swiperCurrent = +data.swiperCurrent;
    if (oldIndex != null) {
      swiperCurrent = +oldIndex;
    }
    var que = data.quesAll[swiperCurrent];
    var answers = newD ? newD.answers : data.answers;
    var minChoose = que.minChoose || 1;
    var maxChoose = que.maxChoose || 1;
    var answer = app.trimSpace(JSON.parse(JSON.stringify(answers[que.id] || [])));
    if(que.type==3){
      var tmpsum = 0;
      answer.forEach(score=>{
        score = +score;
        tmpsum+=score;
      });
      if(tmpsum!=que.totalScore){
        that.setData({
          isChangeQue: false
        });
        return app.toast("各项分数之和必须等于"+que.totalScore+"分");
      }
    } else{
      if (answer.length < minChoose) {
        that.setData({
          isChangeQue: false
        });
        return app.toast("至少选中" + minChoose + "个选项");
      }
    }
    var isLastQue = false;
    swiperCurrent += 1;
    if (swiperCurrent == that.data.quesAll.length) {
      console.log("that.data.quesAll.length: ",that.data.quesAll.length);
      d["isFillAll"] = true;
    }
    if (swiperCurrent == data.quesAll.length) {
      swiperCurrent = data.quesAll.length - 1;
      isLastQue = true;
    }
    d["swiperCurrent"] = swiperCurrent;
    if (newD) {
      d = Object.assign(d, newD);
    }
    if (!showQues[swiperCurrent + 1] && ques[swiperCurrent + 1]) {
      showQues[swiperCurrent + 1] = ques[swiperCurrent + 1];
    }
    if (!showQues[swiperCurrent + 2] && ques[swiperCurrent + 2]) {
      showQues[swiperCurrent + 2] = ques[swiperCurrent + 2];
    }

    var swiperCurrent1 = (data.swiperCurrent1 || 0) + 1;
    if (swiperCurrent > 2) {
      d["swiperCurrent1"] = 2;
      swiperCurrent1 = 3;
    } else {
      d["swiperCurrent1"] = swiperCurrent1;
    }
    if (isLastQue) {
      swiperCurrent1 = swiperCurrent1 - 1;
    }
    if (d.answers) {
      that.setData({
        answers: d.answers
      });
    }
    setTimeout(function () {
      that.setData({
        swiperCurrent1: swiperCurrent1
      }, function () {
        setTimeout(function () {
          d["showQues"] = showQues;
          d["isChangeQue"] = false;
          that.setData(d);
          that.saveAnswerStorageSync();
          if (e && e.currentTarget.dataset.n == "finish") {
            that.formSubmit();
          }
        }, 500);
      });
    }, 350);
  },
  change: function (e) {
    //选项点击选中
    var that = this;
    var isFillAll = false;
    this.setData({
      isChangeQue: true
    });
    console.log("You click change!");
    var d = e.currentTarget.dataset;
    var index = d.index;
    var i = d.i;
    var list = this.data.quesAll;
    var obj = list[index];
    var answers = this.data.answers;
    answers[obj.id] = answers[obj.id] || [];
    var maxChoose = obj.maxChoose || 1;
    var minChoose = obj.minChoose || 1;
    var answer = app.trimSpace(JSON.parse(JSON.stringify(answers[obj.id])));
    if (maxChoose < 2) { //单选
      answers[obj.id] = [];
      answers[obj.id][i] = i;
      if ((this.data.swiperCurrent + 1) == this.data.quesAll.length) {
        isFillAll = true;
      }
    } else {
      if (answer.length >= maxChoose && answers[obj.id][i] == null) {
        that.setData({
          isChangeQue: false
        });
        return app.toast("最多选中" + maxChoose + "个选项");
      }
      if (answer.length >= minChoose) {
        if ((this.data.swiperCurrent + 1) == this.data.quesAll.length) {
          isFillAll = true;
        }
      }
      if (answers[obj.id][i] != null) {
        answers[obj.id][i] = null;
      } else {
        answers[obj.id][i] = i;
      }
    }

    if (maxChoose < 2) {
      this.next(null, index, {
        isFillAll: isFillAll,
        answers: answers
      });
    } else {
      this.setData({
        isChangeQue: false,
        isFillAll: isFillAll,
        answers: answers
      });
    }
    this.saveAnswerStorageSync();
  },
  /**
   * 答题提交
   */
  formSubmit: function (e) {
    var that = this;
    var data = this.data;
    var swiperCurrent = +data.swiperCurrent;
    var que = data.quesAll[swiperCurrent];
    var answers = data.answers;
    var answer = app.trimSpace(JSON.parse(JSON.stringify(answers[que.id] || [])));

    if(que.type==3){
      var tmpsum = 0;
      answer.forEach(score=>{
        console.log(score);
        tmpsum = Number(score) + tmpsum;
      });
      console.log("tmpsum,que.totalScore: ",tmpsum,que.totalScore);
      if(tmpsum != que.totalScore){
        that.setData({
          isChangeQue: false
        });
        return app.toast("各项分数之和必须等于"+que.totalScore+"分");
      }
    }
    const { name } = e.target.dataset;
    console.log("formSubmit", e);
    var chapter = that.data.chapter;
    var hasNextChapter = false;
    if (answerTimeOut) {
      clearTimeout(answerTimeOut);
    }
    if (chapter && chapter.length) {
      chapter.forEach(function (n) {
        if (n.ques && n.ques.length) {
          //章节下有题目
          if (n.status == 2 && !hasNextChapter) {
            n.status = 1; //接下去作答部分
            hasNextChapter = true;
          } else if (n.status == 1) {
            //当前作答部分
            n.status = 3;
          }
        }
      });
    }
    if (hasNextChapter) {
      that.saveAnswerStorageSync();
      that.setData({
        swiperCurrent: 0,
        swiperCurrent1: 0,
        chapter: chapter,
        pathIndex: 4
      });
      return;
    }
    if (app.isTest) {
      wx.redirectTo({
        url: './finish?type=' + that.data.applyStatus
      });
      // wx.aldstat.sendEvent('点击提交测评作答', {
      //   '测评名称': '名称：' + name
      // });
      return;
    }
    var now = new Date().getTime();
    var startTime = data.startTime;
    var chapterTime = data.chapterTime || {};
    var answerTimes = {};
    for (var i in chapterTime) {
      var o = chapterTime[i];
      answerTimes[i] = now - o.st;
    }
    var answer = data.answers;
    var educationName = data.array[data.education];
    answer["time"] = answerTimes || {}; //各个章节答题用时
    answer["timeTotal"] = now - startTime; //答题总用时
    answer["birthday"] = data.birthday; //生日
    answer["educationName"] = educationName; //教育学历
    answer["username"] = data.username; //姓名
    answer["imgUrl"] = data.imgUrl; //头像
    app.doAjax({
      url: "updateUserAnswer",
      method: "POST",
      data: {
        id: data.id,
        paperId: data.paperId,
        answer: JSON.stringify(answer)
      },
      success: function (ret) {
        console.log(that.data);
        wx.redirectTo({
          url: './finish?id=' + data.id + "&type=" + that.data.applyStatus + "&name=" + that.data.paperList.setting.name1
        });
        wx.aldstat.sendEvent('点击提交测评作答', {
          '测评名称': '名称：' + name
        });
        wx.removeStorageSync(sKey);
        that.setData(ret);
      }
    });
  },
  saveAnswerStorageSync: function () {
    var data = this.data;
    var activeChapterId = data.activeChapterId;
    if (activeChapterId != null) {
      var chapterTime = data.chapterTime || {};
      chapterTime[activeChapterId]["et"] = new Date().getTime();
    }
    var d = {
      chapter: data.chapter,
      chapterTime: chapterTime,
      pathIndex: data.pathIndex,
      answers: data.answers,
      quesIdsOrder: quesIdsOrder,
      chapterTimeDown: data.chapterTimeDown,
      startTime: data.startTime,
      endTime: new Date().getTime(),
      educationName: data.educationName,
      username: data.username,
      education: data.education,
      birthday: data.birthday,
      imgUrl: data.imgUrl,
      swiperCurrent: data.swiperCurrent,
      swiperCurrent1: data.swiperCurrent1
    };
    wx.setStorageSync(sKey, d);
  },
  /**
   * 进入章节作答
   */
  toAnswerIt: function (e, oldData) {
    var that = this;
    if (answerTimeOut) {
      clearTimeout(answerTimeOut);
    }
    var i = 0;
    var data = that.data;
    var chapterTime = data.chapterTime || {};
    if (oldData) {
      chapterTime = oldData.chapterTime || {};
      var oldChapter = oldData.chapter || [];
      var oldIndex = 0;
      oldChapter.forEach(function (node, index) {
        if (node.status == 1) {
          oldIndex = index;
        }
      });
      i = oldIndex;
    } else if (e) {
      i = e.currentTarget.dataset.index;
    }
    var chapter = data.chapter || [];
    var obj = chapter[i] || {};
    if (obj.status != 1) return; //非可作答
    var ques = obj.ques;
    if (!ques.length) return;
    var type = obj.type;
    var quesFull = data.paperList.ques;
    var quesAll = [];
    var showQues = [];
    var swiperCurrent = 0;
    var swiperCurrent1 = 0;
    quesFull.forEach(function (node) {
      var qI = ques.indexOf(node.id);
      if (qI != -1) {
        quesAll[qI] = node;
      }
    });
    if (oldData && oldData.pathIndex == 4) {
      oldData.swiperCurrent = 0;
      oldData.swiperCurrent1 = 0;
    }
    quesAll = app.trimSpace(quesAll);
    quesAll.forEach(function (node, i2) {
      if (!oldData || !oldData.quesIdsOrder) {
        if (showQues.length < 5) {
          showQues.push(node);
        }
      } else {
        var oldswiperCurrent = oldData.swiperCurrent;
        swiperCurrent1 = oldData.swiperCurrent1;
        swiperCurrent = oldswiperCurrent;
        var i1 = oldswiperCurrent - i2;
        if (i1 > -3 && i1 < 3) {
          showQues[i2] = node;
        }
      }
    });
    var chapterTimeDown = obj.time * 60;
    if (oldData && oldData.chapterTime && oldData.chapterTime[i]) {
      chapterTime[i] = oldData.chapterTime[i];
      // chapterTime[i]["st"] = chapterTime[i]["st"] + (new Date().getTime() - chapterTime[i]["et"]);
      // chapterTimeDown = oldData.chapterTimeDown;
      chapterTimeDown = parseInt(chapterTimeDown - (new Date().getTime() - chapterTime[i]["st"]) / 1000);
    } else {
      chapterTime[i] = {
        time: obj.time * 60,
        st: new Date().getTime(),
        et: 0
      };
    }
    that.setData({
      pathIndex: 3,
      activeChapterId: i,
      chapterTimeDown: chapterTimeDown,
      chapterTime: chapterTime,
      swiperCurrent: swiperCurrent,
      swiperCurrent1: swiperCurrent1,
      showQues: showQues,
      quesAll: quesAll
    });
    if (obj.type == 2) {
      if (chapterTimeDown <= 0) {
        wx.showModal({
          title: '作答提示',
          content: '答题时间到，已自动提交',
          showCancel: false,
          success: function () {
            that.formSubmit();
          }
        });
        return;
      }
      that.toTimeDown("chapterTimeDown", function () {
        //作答限时--自动提交
        wx.showModal({
          title: '作答提示',
          content: '答题时间到，已自动提交',
          showCancel: false,
          success: function () {
            that.formSubmit();
          }
        });
      });
    } else {
      that.setData({
        chapterTimeDownFull: ""
      });
    }
  },
  //定时保存作答
  saveDraftAnswer: function () {
    var that = this;
    saveTimeOut && clearTimeout(saveTimeOut);
    var data = that.data;
    var activeChapterId = data.activeChapterId;
    if (activeChapterId != null) {
      var chapterTime = data.chapterTime || {};
      chapterTime[activeChapterId]["et"] = new Date().getTime();
    }
    var draftAnswer = {
      chapter: data.chapter,
      chapterTime: chapterTime,
      pathIndex: data.pathIndex,
      answers: data.answers,
      quesIdsOrder: quesIdsOrder,
      chapterTimeDown: data.chapterTimeDown,
      startTime: data.startTime,
      endTime: new Date().getTime(),
      educationName: data.educationName,
      username: data.username,
      education: data.education,
      birthday: data.birthday,
      imgUrl: data.imgUrl,
      swiperCurrent: data.swiperCurrent,
      swiperCurrent1: data.swiperCurrent1
    };
    app.doAjax({
      url: "updateUserAnswer",
      method: "POST",
      data: {
        id: data.id,
        paperId: data.paperId,
        draftAnswer: JSON.stringify(draftAnswer)
      },
      noLoading: true,
      success: function (ret) {
        saveTimeOut = setTimeout(that.saveDraftAnswer, 30000);
      },
      error: function (err) {
        console.error(err);
        saveTimeOut = setTimeout(that.saveDraftAnswer, 30000);
      }
    });
  },
  getPhoneNumber: function (e) {
    const { name } = e.currentTarget.dataset;
    var that = this;
    if (!that.data.getphoneNum || that.data.getphoneNum) {
      var detail = e.detail;
      var iv = detail.iv;
      var encryptedData = detail.encryptedData;
      if (encryptedData) {
        //用户授权手机号
        var userMsg = app.globalData.userMsg || {};
        userMsg["iv"] = iv;
        userMsg["encryptedData"] = encryptedData;
        app.doAjax({
          url: "updatedUserMobile",
          data: userMsg,
          success: function (ret) {
            app.doAjax({
              url: "/userDetail",
              method: "get",
              data: {
                openid: wx.getStorageSync("openId"),
              },
              success: function (res) {
                that.setData({
                  getphoneNum: true,
                  phoneNumber: res.data.phone
                });
              }
            });
          }
        });
      }
      return;
    }
  },
  changeslider(e){
    var d = e.currentTarget.dataset;
    var index = d.index;
    var i = d.i;
    var list = this.data.quesAll;
    var obj = list[index];
    var userInputAnswer = e.detail.value;
    var NUMBER_REG = new RegExp(/^[0-9]*$/);
    try{
      userInputAnswer = Number(userInputAnswer);
    }catch(e){

    }
    if( !NUMBER_REG.test(userInputAnswer) ){
      app.toast("必须输入数字");
    }
    var { answers,swiperCurrent,quesAll,lastAnswer } = this.data;
    var totalScore = quesAll[swiperCurrent].totalScore;
    answers[obj.id] = answers[obj.id] || [];
    var answer = app.trimSpace(JSON.parse(JSON.stringify(answers[obj.id])));
    answers[obj.id][i]= userInputAnswer ? Number(userInputAnswer) : 0;
    var t = "showQues["+index+"].slider["+i+"]";
    var a = "answers."+obj.id+"["+i+"]";
    var score = 0;
    console.log("swiperCurrent: ",swiperCurrent);
    if( (swiperCurrent + 1) == quesAll.length ){
      answers[obj.id].forEach((v,k)=>{
        score = score + Number(v);
      });
      if( score == totalScore ){
        console.log("score === totalScore: ",score === totalScore);
        this.setData({
          isFillAll: true,
          theFinalQuestionAnswer: answers[obj.id]
        });
      }else{
        this.setData({
          isFillAll: false,
        });
      }
    }
    this.setData({
      [t]:userInputAnswer,
      [a]:userInputAnswer,
    });
    // if(obj.options.length>=2&&(i==(obj.options.length-2))){
    //   var tmp = obj.totalScore;
    //   for(let ti=0;ti<obj.slider.length-1;ti++){
    //     tmp -= obj.slider[ti];
    //   }
    //   if(tmp>=0){
    //     var t1="showQues["+index+"].slider["+(obj.options.length-1)+"]";
    //     var a1 = "answers."+obj.id+"["+(obj.options.length-1)+"]";
    //     this.setData({
    //       [t1]:tmp,
    //       [a1]:tmp,
    //       isFillAll: true
    //     })
    //   }
    //   else{
    //     var t1="showQues["+index+"].slider["+(obj.options.length-1)+"]";
    //     var a1 = "answers."+obj.id+"["+(obj.options.length-1)+"]";
    //     this.setData({
    //       [t1]:0,
    //       [a1]:0,
    //       isFillAll: true
    //     })
    //   }
    // }
  },
  notFillAll: function (e) {
    var that = this;
    var data = that.data;
    var swiperCurrent = +data.swiperCurrent;
    var que = data.quesAll[swiperCurrent];
    return app.toast("各项分数之和必须等于"+que.totalScore+"分");
  },
  input: function (e) {
    console.log(e);
  }
});
