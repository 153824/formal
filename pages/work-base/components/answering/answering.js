import {QUES_TYPE} from './const/index'
const app = getApp();
var sKey = "";
var quesIdsOrder = [];
var answerTimeOut;
Page({
    data: {
        isChangeQue: false,
        numArr: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
        multipleQuesHTML: "<span style='display: inline-block;box-sizing: border-box;height: 20px;font-size: 15px;font-weight: 600;color: #353EE8;line-height: 20px;margin-right: 10px;'>【多选题】</span>",
        percentQuesHTML: "<span style='display: inline-block;box-sizing: border-box;height: 20px;font-size: 15px;font-weight: 600;color: #353EE8;line-height: 20px;margin-right: 10px;'>【分数分配题】</span>",
        isFillAll: false,
        count: 5,
        selImg: "",
        optionsAry: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        swiperCurrent: 0,
        paperList: "",
        phoneModel: app.isIphoneX,
        answers: {},
        isok: false,
        theFinalQuestionAnswer: [],
        isSelf: "",
        sandGlass: 0,
        fetchedAt: 0,

        questions: [],
        /*答题卡*/
        answerSheet: [],
        /*临时答题卡-使用Object数据结构方便答题操作数据*/
        temporarySheet: {},
        questionStep: 0,
        fill: false,
    },

    onLoad: function (options) {
        const that = this;
        this.setData({
            startTime: new Date().getTime(),
            receiveRecordId: options.receiveRecordId,
            releaseRecordId: options.releaseRecordId || options.id || "",
            evaluationId: options.evaluationId
        });
        quesIdsOrder = [];
        sKey = "oldAnswer" + options.receiveRecordId;
        const oldData = wx.getStorageSync(sKey);
        const storage = wx.getStorageInfoSync().keys;
        storage.forEach(function (n) {
            if (n.indexOf("oldAnswer") == 0 && n != sKey) {
                wx.removeStorageSync(n);
            }
        });
        this._checkType(options);
        app.doAjax({
            url: "paperQues",
            method: "get",
            data: {
                id: options.evaluationId
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
                        if (node.type == 3) {
                            node.slider = new Array(node.options.length).fill(0);
                            node.totalScore = node.totalScore;
                            node.step = Math.floor(node.totalScore / 5);
                            node.stepArr = [];
                            if (node.totalScore < 5) {
                                node.step = 1;
                                for (let i = 0; i < node.totalScore; i++) {
                                    node.stepArr.push(Math.floor(i * node.step));
                                }
                            } else {
                                for (let i = 0; i < 5; i++) {
                                    node.stepArr.push(Math.floor(i * node.step));
                                }
                            }
                        }
                        ques1.push(node);
                        if (showQues.length < 5) {
                            showQues.push(node);
                        }
                    } else {
                        var i = quesIdsOrder.indexOf(node.id);
                        ques[i] = node;
                        if (node.type == 3) {
                            node.slider = new Array(node.options.length).fill(0);
                            node.totalScore = node.totalScore;
                            node.step = Math.floor(node.totalScore / 5);
                            node.stepArr = [];
                            if (node.totalScore < 5) {
                                node.step = 1;
                                for (let i = 0; i < node.totalScore; i++) {
                                    node.stepArr.push(Math.floor(i * node.step));
                                }
                            } else {
                                for (let i = 0; i < 5; i++) {
                                    node.stepArr.push(Math.floor(i * node.step));
                                }
                            }
                        }
                        ques1[i] = node;
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
                    id: options.id,
                    evaluationId: options.evaluationId,
                    showQues: showQues,
                    paperList: res,
                    time: ((res.chapter || [])[0] || {}).time || ""
                });
                if (oldData) {
                    wx.showToast({
                        icon: 'none',
                        title: '已为您恢复上次作答'
                    });
                    const {receiveRecordId} = that.data;
                    if (wx.getStorageSync(`${receiveRecordId}-is-fill-all`)) {
                        that.setData({
                            isFillAll: true
                        })
                    }
                    that.setData(oldData);
                    that.toAnswerIt(null, oldData);
                    const startTime = oldData.startTime;
                    const now = new Date().getTime();
                    if ((now - startTime) > (6 * 60 * 60 * 1000)) {
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
                } else if (res.chapter[0]) {
                    that.toAnswerIt();
                }
                that.saveDraftAnswer();
            }
        });
        this.loadQuestion(options.receiveRecordId).then(res=>{
            console.log('loadQuestion: ',res);
            this.setData({
                questions: res.questions,
                countdownEnabled: res.countdownEnabled,
                countdownInMinutes: res.countdownInMinutes
            })

        });
    },

    onShow: function () {
        const that = this;
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
        this._checkReceiveInfo();
    },

    onHide: function () {
        answerTimeOut && clearTimeout(answerTimeOut);
    },

    onUnload: function () {
        answerTimeOut && clearTimeout(answerTimeOut);
    },

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

    prev: function (e) {
        const that = this;
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
                that.saveDraftAnswer();
            }, 350);
        });
    },

    next: function (e, oldIndex, newD) {
        var that = this;
        var {swiperCurrent, quesAll, theFinalQuestionAnswer} = this.data;
        var finalTotalScore = quesAll[quesAll.length - 1].totalScore;
        var score = 0;
        if (theFinalQuestionAnswer.length > 0 && swiperCurrent + 1 === quesAll.length) {
            theFinalQuestionAnswer.forEach(((value, index) => {
                score = value + score;
            }));
            const {receiveRecordId} = this.data;
            if (score === finalTotalScore) {
                wx.setStorageSync(`${receiveRecordId}-is-fill-all`, true);
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
        if (oldIndex != null) {
            swiperCurrent = +oldIndex;
        }
        var que = data.quesAll[swiperCurrent];
        var answers = newD ? newD.answers : data.answers;
        var minChoose = que.minChoose || 1;
        var maxChoose = que.maxChoose || 1;
        var answer = app.trimSpace(JSON.parse(JSON.stringify(answers[que.id] || [])));
        if (que.type == 3) {
            var tmpsum = 0;
            answer.forEach(score => {
                score = +score;
                tmpsum += score;
            });
            if (tmpsum != que.totalScore) {
                that.setData({
                    isChangeQue: false
                });
                return app.toast("各项分数之和必须等于" + que.totalScore + "分");
            }
        } else {
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
            const {receiveRecordId} = that.data;
            d["isFillAll"] = true;
            wx.setStorageSync(`${receiveRecordId}-is-fill-all`, true);
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
                    that.saveDraftAnswer();
                    if (e && e.currentTarget.dataset.n == "finish") {
                        that.formSubmit();
                    }
                }, 500);
            });
        }, 350);
    },

    change: function (e) {
        this.setData({
            isChangeQue: true
        });
        var {index, i} = e.currentTarget.dataset;
        var {quesAll, swiperCurrent, answers} = this.data;
        var questionInfo = quesAll[index];
        answers[questionInfo.id] = answers[questionInfo.id] || [];
        var maxChoose = questionInfo.maxChoose || 1;
        var minChoose = questionInfo.minChoose || 1;
        var answer = app.trimSpace(JSON.parse(JSON.stringify(answers[questionInfo.id])));
        if (maxChoose < 2) { //单选
            answers[questionInfo.id] = [];
            answers[questionInfo.id][i] = i;
        } else {
            if (answer.length >= maxChoose && answers[questionInfo.id][i] == null) {
                this.setData({
                    isChangeQue: false
                });
                return app.toast("最多选中" + maxChoose + "个选项");
            }
            if (answers[questionInfo.id][i] != null) {
                answers[questionInfo.id][i] = null;
            } else {
                answers[questionInfo.id][i] = i;
            }
        }
        if (quesAll.length === swiperCurrent + 1) {
            const {receiveRecordId} = this.data;
            const answerCopy = app.trimSpace(JSON.parse(JSON.stringify(answers[questionInfo.id])));
            if (maxChoose < 2 || (answerCopy.length >= Number(minChoose) && answerCopy.length <= Number(maxChoose))) {
                wx.setStorageSync(`${receiveRecordId}-is-fill-all`, true);
                this.setData({
                    isFillAll: true
                })
            } else {
                wx.setStorageSync(`${receiveRecordId}-is-fill-all`, false);
                this.setData({
                    isFillAll: false
                })
            }
        }
        if (maxChoose < 2) {
            this.next(null, index, {
                answers: answers
            });
        } else {
            this.setData({
                isChangeQue: false,
                answers: answers
            });
        }
        this.saveAnswerStorageSync();
    },

    formSubmit: function (e) {
        var that = this;
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
            });
            return;
        }
        if (app.isTest) {
            wx.redirectTo({
                url: '../done/done?receiveRecordId=' + that.data.receiveRecordId,
            });
            return;
        }
        var now = new Date().getTime();
        var data = this.data;
        var startTime = data.startTime;
        var chapterTime = data.chapterTime || {};
        var answerTimes = {};
        for (var i in chapterTime) {
            var o = chapterTime[i];
            answerTimes[i] = now - o.st;
        }
        var answer = data.answers;
        answer["time"] = answerTimes || {}; //各个章节答题用时
        answer["timeTotal"] = now - data.fetchedAt; //答题总用时
        if (wx.getStorageSync("userInfo")["nickname"] && answer["username"] && answer["username"] === "好啦访客") {
            answer["username"] = wx.getStorageSync("userInfo")["nickname"]
        }
        const {evaluationId, receiveRecordId} = data;
        app.doAjax({
            url: "receive_records/update_answer",
            method: "post",
            data: {
                receiveRecordId: receiveRecordId,
                answer: answer
            },
            success: function (ret) {
                wx.redirectTo({
                    url: `../done/done?receiveRecordId=${receiveRecordId}&evaluationId=${evaluationId}`,
                });
                wx.removeStorageSync(sKey);
                wx.removeStorageSync(`${receiveRecordId}-is-fill-all`);
                that.setData(ret);
            }
        });
        if (that.data.isSelf === "SHARE") {
            try {
                wx.uma.trackEvent('1602216509662', {name: that.data.paperList.setting.name1});
            } catch (e) {

            }
        } else {
            try {
                wx.uma.trackEvent('1602214552285', {name: that.data.paperList.setting.name1});
            } catch (e) {

            }
        }
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
            answers: data.answers,
            quesIdsOrder: quesIdsOrder,
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

    toAnswerIt: function (e, oldData) {
        const that = this;
        if (answerTimeOut) {
            clearTimeout(answerTimeOut);
        }
        let i = 0;
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
        const {receiveRecordId} = that.data;
        const st = wx.getStorageSync(`${receiveRecordId}-st`);
        if ((oldData && oldData.chapterTime && oldData.chapterTime[i])) {
            chapterTime[i]["st"] = st;
            chapterTime[i] = oldData.chapterTime[i];
            chapterTime[i]["st"] = chapterTime[i]["st"] + (new Date().getTime() - chapterTime[i]["et"]);
        } else {
            chapterTime[i] = {
                time: obj.time * 60,
                st: new Date().getTime(),
                et: 0
            };
        }
        that.setData({
            activeChapterId: i,
            chapterTime: chapterTime,
            swiperCurrent: swiperCurrent,
            swiperCurrent1: swiperCurrent1,
            showQues: showQues,
            quesAll: quesAll
        });
        that._checkReceiveInfo();
        that.saveAnswerStorageSync();
    },

    saveDraftAnswer: function () {
        const that = this;
        const data = this.data;
        let {chapter, answers, startTime, swiperCurrent, swiperCurrent1, receiveRecordId} = this.data;
        var activeChapterId = data.activeChapterId;
        if (activeChapterId != null) {
            var chapterTime = data.chapterTime || {};
            chapterTime[activeChapterId]["et"] = new Date().getTime();
        }
        if (wx.getStorageSync("userInfo")["nickname"] && data.username === "好啦访客") {
            data.username = wx.getStorageSync("userInfo")["nickname"]
        }
        var draftAnswer = {
            chapter: chapter,
            chapterTime: chapterTime,
            answers: answers,
            quesIdsOrder: quesIdsOrder,
            startTime: startTime,
            endTime: new Date().getTime(),
            swiperCurrent: swiperCurrent,
            swiperCurrent1: swiperCurrent1
        };
        app.doAjax({
            url: "receive_records/update_answer",
            method: "post",
            data: {
                receiveRecordId: receiveRecordId,
                draft: draftAnswer
            },
            noLoading: true,
            success: function (ret) {
            },
            error: function (err) {
                console.error(err);
            }
        });
    },

    changeSlider(e) {
        var d = e.currentTarget.dataset;
        var index = d.index;
        var i = d.i;
        var list = this.data.quesAll;
        var obj = list[index];
        var userInputAnswer = e.detail.value;
        var NUMBER_REG = new RegExp(/^[0-9]*$/);
        try {
            userInputAnswer = Number(userInputAnswer);
        } catch (e) {

        }
        if (!NUMBER_REG.test(userInputAnswer)) {
            app.toast("必须输入数字");
            return;
        }
        var {answers, swiperCurrent, quesAll, lastAnswer} = this.data;
        var totalScore = Number(quesAll[swiperCurrent].totalScore);
        answers[obj.id] = answers[obj.id] || [];
        var answer = app.trimSpace(JSON.parse(JSON.stringify(answers[obj.id])));
        answers[obj.id][i] = userInputAnswer;
        var t = "showQues[" + index + "].slider[" + i + "]";
        var a = "answers." + obj.id + "[" + i + "]";
        var score = 0;
        if ((swiperCurrent + 1) === quesAll.length) {
            answers[obj.id].forEach((v, k) => {
                score = score + Number(v);
            });
            const {receiveRecordId} = this.data;
            if (score == totalScore) {
                wx.setStorageSync(`${receiveRecordId}-is-fill-all`, true);
                this.setData({
                    isFillAll: true,
                    theFinalQuestionAnswer: answers[obj.id]
                });
            } else {
                wx.setStorageSync(`${receiveRecordId}-is-fill-all`, false);
                this.setData({
                    isFillAll: false,
                });
            }
        }
        this.setData({
            [t]: userInputAnswer,
            [a]: userInputAnswer,
        });

    },

    _checkType: function (options) {
        const _this = this;
        app.doAjax({
            url: 'reports/check_type',
            method: 'get',
            data: {
                receiveRecordId: options.receiveRecordId || _this.data.receiveRecordId
            },
            success: function (res) {
                _this.setData({
                    isSelf: res.data.type
                });
            }
        });
    },

    _checkReceiveInfo: function () {
        const _this = this;
        const {receiveRecordId} = this.data;
        const {chapter} = this.data;
        app.doAjax({
            url: `wework/evaluations/receive_info/${receiveRecordId}`,
            method: "get",
            success: function (res) {
                if(!chapter){
                    return;
                }
                try{
                    let sandGlass = chapter[0].time * 60 * 1000 - (new Date().getTime() - res.fetchedAt);
                    if (chapter && chapter[0].type == 2) {
                        _this.setData({
                            sandGlass: sandGlass,
                        })
                    }
                    _this.setData({
                        fetchedAt: res.fetchedAt
                    })
                }catch (e) {
                    console.error(e);
                }
            },
            fail: function (err) {
                throw err
            }
        })
    },

    submitAnswerForce: function () {
        const _this = this;
        wx.showModal({
            title: '作答提示',
            content: '作答时间到，已自动提交',
            showCancel: false,
            success: function () {
                _this.formSubmit(null, true);
            }
        });
    },

    pageTouch(){

    },

    loadQuestion(receiveRecordId) {
        receiveRecordId = this.data.receiveRecordId || receiveRecordId;
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                url: `../wework/evaluations/${receiveRecordId}/questions`,
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

    selectQuesItem(e) {
        const {questionIndex, optionIndex} = e.currentTarget.dataset;
        // console.log(questionIndex, optionIndex);
        const {answerSheet, questions, questionStep} = this.data;
        const targetSheet = [...answerSheet];
        if(optionIndex < 0 || questionIndex < 0){
            app.toast('题目或选项为空');
            return;
        }
        const {type, leastChoice, mostChoice} = questions[questionIndex];
        if(type === 'MULTIPLE' && answerSheet[questionIndex] && answerSheet[questionIndex].indexes){
            const {indexes} = answerSheet[questionIndex];
            if(indexes.length >= mostChoice && !indexes.includes(optionIndex)){
                app.toast(`最多选中${mostChoice}个选项`)
                return;
            }
        }
        const targetItem = {
            questionId: questions[questionIndex].id,
            indexes: []
        };
        if(answerSheet.length - 1 < questionIndex){
            targetItem.indexes.push(optionIndex);
            targetSheet[questionIndex] = targetItem;
        }
        if(answerSheet.length - 1 >= questionIndex){
            switch (type) {
                case QUES_TYPE[0]:
                    targetSheet[questionIndex].indexes = [optionIndex];
                    break;
                case QUES_TYPE[1]:
                    answerSheet[questionIndex].indexes.push(optionIndex);
                    let targetIndexes = answerSheet[questionIndex].indexes;
                    targetIndexes = this.filterSameEle(targetIndexes);
                    targetSheet[questionIndex].indexes = targetIndexes;
                    break;
                default:
                    break;
            }
        }
        this.setData({
            answerSheet: targetSheet
        });
        this.memory();
        if(type === QUES_TYPE[0]){
            if(questionStep+1 !== questions.length){
                this.nextQues()
            }
        }
        if(questionStep+1 === questions.length){
            this.judge().then(({fill})=>{
                console.log('judge():',fill);
                if(fill){
                    this.setData({
                        fill: true
                    })
                }
            })
        }
    },

    nextQues() {
        const {questionStep, answerSheet} = this.data;
        const indexes = answerSheet[questionStep] && answerSheet[questionStep].indexes ? answerSheet[questionStep].indexes : [] ;
        this.judge().then(({flag, text})=>{
            if(!flag && text){
                app.toast(text)
            }
            if(indexes.length && flag){
                this.setData({
                    questionStep: questionStep + 1
                })
            }
        })
    },

    preQues(e) {
        const {questionStep, answerSheet} = this.data;
        if(answerSheet[questionStep].indexes.length){
            this.setData({
                questionStep: questionStep - 1
            })
        }
    },

    memory(receiveRecordId) {
        const {answerSheet} = this.data;
        receiveRecordId = this.data.receiveRecordId || receiveRecordId;
        if(!receiveRecordId){
            console.error('answering.js:867 -> ', '缺少receiveRecordId');
            return Promise.reject;
        }
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                url: `../wework/evaluations/${receiveRecordId}/drafts`,
                method: 'POST',
                data: answerSheet,
                noLoading: true,
                success(res) {
                    resolve(res)
                },
                error(err) {
                    reject(err);
                }
            })
        })
        return p;
    },

    judge() {
        let fill = false;
        let flag = false;
        let text = '';
        const {questionStep, answerSheet, questions} = this.data;
        const {type, leastChoice, mostChoice} = questions[questionStep];
        const indexes = answerSheet[questionStep] && answerSheet[questionStep].indexes ? answerSheet[questionStep].indexes : [] ;
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
                        if(questionStep+1 === questions.length && flag) {
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
                        if(questionStep+1 === questions.length && flag) {
                            fill = true;
                        }
                        break;
                    case QUES_TYPE[2]:
                    case QUES_TYPE[3]:
                }
                resolve({flag, text, fill})
            }
            catch (err) {
                reject(err);
            }
        });
        return p;
    },

    save() {
        const {answerSheet, receiveRecordId} = this.data;
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                url: '../hola/receive_records/answers',
                method: 'POST',
                data: {
                    responds: answerSheet,
                    receiveRecordId: receiveRecordId
                },
                success(res) {
                    resolve(res)
                },
                error(err) {
                    reject(err);
                }
            })
        })
        return p;
    },

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
    }
});
