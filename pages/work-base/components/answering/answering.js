// test/index.js
var app = getApp();
var sKey = "";
var quesIdsOrder = [];
var answerTimeOut;
var saveTimeOut;
let count = 0;
Page({
    data: {
        isChangeQue: false,
        numArr: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
        multipleQuesHTML: "<span style='display: inline-block;box-sizing: border-box;height: 20px;font-size: 15px;font-weight: 600;color: #353EE8;line-height: 20px;margin-right: 10px;'>【多选题】</span>",
        percentQuesHTML: "<span style='display: inline-block;box-sizing: border-box;height: 20px;font-size: 15px;font-weight: 600;color: #353EE8;line-height: 20px;margin-right: 10px;'>【分数分配题】</span>",
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
        birthday: '1995-01',
        education: -1,
        imgUrl: '',
        selImg: "",
        pathIndex: 1,
        optionsAry: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        swiperCurrent: 0,
        paperList: "",
        phoneModel: app.isIphoneX,
        answers: {},
        isok: false,
        sex: ["男", "女"],
        checkedSex: 0,
        getphoneNum: false,
        phoneNumber: "微信一键授权",
        theFinalQuestionAnswer: [],
        verify: false,
        isSelf: "",
        chapterTimeDownFull: "",
        sandGlass: "",
    },
    onLoad: function (options) {
        const that = this;
        this.setData({
            status: options.type,
            reportPermit: options.reportPermit,
            startTime: new Date().getTime(),
            receiveRecordId: options.receiveRecordId,
            verify: options.verify || false,
            releaseRecordId: options.releaseRecordId || options.id || ""
        });
        quesIdsOrder = [];
        sKey = "oldAnswer" + options.receiveRecordId;
        const oldData = wx.getStorageSync(sKey);
        var storages = wx.getStorageInfoSync().keys;
        storages.forEach(function (n) {
            if (n.indexOf("oldAnswer") == 0 && n != sKey) {
                wx.removeStorageSync(n);
            }
        });
        var oldPeopleMsg = wx.getStorageSync("oldPeopleMsg");
        wx.removeStorageSync("oldPeopleMsg");
        if (oldPeopleMsg) {
            oldPeopleMsg["education"] = that.data.array.indexOf(oldPeopleMsg.educationName);
            that.setData(oldPeopleMsg);
        }
        app.doAjax({
            url: 'reports/check_type',
            method: 'get',
            data: {
                receiveRecordId: options.receiveRecordId || this.data.receiveRecordId
            },
            success: function (res) {
                that.setData({
                    isSelf: res.data.type
                });
            }
        });
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
                    const {swiperCurrent, quesAll} = that.data;
                    var startTime = oldData.startTime;
                    // var endTime = oldData.endTime;
                    var now = new Date().getTime();

                    // oldData["startTime"] = startTime + (now - endTime);
                    if ((now - startTime) > (6 * 60 * 60 * 1000)) {
                        //答题时长超过6小时
                        if (count > 1) {
                            return;
                        }
                        count = count + 1;
                        wx.showModal({
                            title: '作答提示',
                            content: '答题时长超过6小时，已自动提交',
                            showCancel: false,
                            success: function () {
                                wx.removeStorageSync(`${receiveRecordId}-st`);
                                count = count - 1;
                                that.formSubmit();
                            }
                        });
                        return;
                    }
                } else if (res.chapter[0] && that.data.pathIndex == 3) {
                    that.toAnswerIt();
                }
                saveTimeOut = setTimeout(that.saveDraftAnswer, 30000);
            }
        });
    },
    pageTouch: function () {

    },
    onShow: function () {
        const that = this;
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
        app.doAjax({
            url: `wework/users/${app.globalData.userMsg.id || app.globalData.userInfo.id}`,
            method: "get",
            data: {
                openid: wx.getStorageSync("openId") || app.globalData.userInfo.openId,
            },
            success: function (res) {
                that.setData({
                    getphoneNum: true,
                    phoneNumber: res.phone || "微信一键授权"
                });
            }
        });
        const {receiveRecordId} = that.data;
        if (wx.getStorageSync(`${receiveRecordId}-st`)) {
            that.keepTimeDown()
        }
    },
    onHide: function () {
        saveTimeOut && clearTimeout(saveTimeOut);
        answerTimeOut && clearTimeout(answerTimeOut);
    },
    onUnload: function () {
        saveTimeOut && clearTimeout(saveTimeOut);
        answerTimeOut && clearTimeout(answerTimeOut);
    },
    keepTimeDown: function () {
        const that = this;
        let chapter = this.data.chapter || [];
        let i = 0;
        let obj = chapter[i] || {};
        let chapterTimeDown = obj.time * 60;
        const {receiveRecordId} = this.data;
        const st = wx.getStorageSync(`${receiveRecordId}-st`);
        chapterTimeDown = parseInt(chapterTimeDown - (new Date().getTime() - st) / 1000);
        this.setData({
            chapterTimeDown
        })
        if (obj.type == 2) {
            if (chapterTimeDown <= 0) {
                if (count > 1) {
                    return;
                }
                count = count + 1;
                wx.showModal({
                    title: '作答提示',
                    content: '答题时间到，已自动提交',
                    showCancel: false,
                    success: function () {
                        const {receiveRecordId} = that.data;
                        wx.removeStorageSync(`${receiveRecordId}-st`);
                        count = count - 1;
                        that.formSubmit();
                    }
                });
                return;
            }
            that.toTimeDown("chapterTimeDown", function () {
                //作答限时--自动提交
                if (count > 1) {
                    return;
                }
                count = count + 1;
                wx.showModal({
                    title: '作答提示',
                    content: '答题时间到，已自动提交',
                    showCancel: false,
                    success: function () {
                        const {receiveRecordId} = that.data;
                        wx.removeStorageSync(`${receiveRecordId}-st`);
                        count = count - 1;
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
    handleUserInfo: function () {
        const that = this;
        const data = that.data;
        const {username,birthday,education} = data;
        if (!username || !(/^[\u4E00-\u9FA5A-Za-z]+$/.test(username))) {
            app.toast("请输入正确的姓名！");
            return false;
        }
        if (education == -1) {
            app.toast("请选择学历信息！");
            return false;
        }
        if (!birthday) {
            app.toast("请选择出生年月！");
            return false;
        }
        return true;
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
    /**
     * 答题提交
     */
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
                pathIndex: 4
            });
            return;
        }
        if (app.isTest) {
            wx.redirectTo({
                url: '../done/done?id=' + that.data.receiveRecordId + '+&status=' + that.data.status + "&reportPermit=" + that.data.reportPermit
            });
            return;
        }
        var now = new Date().getTime();
        var data = this.data;
        var startTime = data.startTime;
        var chapterTime = data.chapterTime || {};
        console.log("chapterTime: ", chapterTime)
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
        if (wx.getStorageSync("userInfo")["nickname"] && answer["username"] && answer["username"] === "好啦访客") {
            answer["username"] = wx.getStorageSync("userInfo")["nickname"]
        }
        if (data.isSelf === 'SELF') {
            try {
                wx.uma.trackEvent('1602214552285', {name: data.paperList.setting.name1})
            } catch (e) {

            }
        }
        app.doAjax({
            url: "receive_records/update_answer",
            method: "POST",
            data: {
                receiveRecordId: data.receiveRecordId,
                answer: answer
            },
            success: function (ret) {
                wx.navigateTo({
                    url: '../done/done?id=' + data.receiveRecordId + "&status=" + that.data.status + "&reportPermit=" + that.data.reportPermit
                });
                wx.removeStorageSync(sKey);
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
    saveAnswerStorageSync: function (test) {
        console.log()
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
        const {name1} = this.data.paperList.setting;
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
        // if (obj.status != 1) return; //非可作答
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
        let chapterTimeDown = obj.time * 60;
        const {receiveRecordId} = that.data;
        const st = wx.getStorageSync(`${receiveRecordId}-st`);
        if ((oldData && oldData.chapterTime && oldData.chapterTime[i])) {
            chapterTime[i]["st"] = st;
            // chapterTime[i] = oldData.chapterTime[i];
            // chapterTime[i]["st"] = chapterTime[i]["st"] + (new Date().getTime() - chapterTime[i]["et"]);
            // chapterTimeDown = oldData.chapterTimeDown;
            // chapterTimeDown = parseInt(chapterTimeDown - (new Date().getTime() - chapterTime[i]["st"]) / 1000);
            chapterTimeDown = parseInt(chapterTimeDown + 1 - (new Date().getTime() - st) / 1000);
        } else {
            chapterTimeDown = parseInt(chapterTimeDown + 1 - (new Date().getTime() - st) / 1000);
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
                if (count > 1) {
                    return;
                }
                count = count + 1;
                wx.showModal({
                    title: '作答提示',
                    content: '答题时间到，已自动提交',
                    showCancel: false,
                    success: function () {
                        const {receiveRecordId} = that.data;
                        wx.removeStorageSync(`${receiveRecordId}-st`);
                        count = count - 1;
                        that.formSubmit();
                    }
                });
                return;
            }
            that.toTimeDown("chapterTimeDown", function () {
                //作答限时--自动提交
                if (count > 1) {
                    return;
                }
                count = count + 1;
                wx.showModal({
                    title: '作答提示',
                    content: '答题时间到，已自动提交',
                    showCancel: false,
                    success: function () {
                        const {receiveRecordId} = that.data;
                        wx.removeStorageSync(`${receiveRecordId}-st`);
                        count = count - 1;
                        that.formSubmit();
                    }
                });
            });
        } else {
            that.setData({
                chapterTimeDownFull: ""
            });
        }
        that.saveAnswerStorageSync("sad");
    },
    //定时保存作答
    saveDraftAnswer: function () {
        const {phoneNumber, getphoneNum, pathIndex} = this.data;
        if ((!this.handleUserInfo() || !getphoneNum || phoneNumber.length < 11) && pathIndex == 3) {
            return;
        }
        var that = this;
        saveTimeOut && clearTimeout(saveTimeOut);
        var data = that.data;
        var activeChapterId = data.activeChapterId;
        if (activeChapterId != null) {
            var chapterTime = data.chapterTime || {};
            chapterTime[activeChapterId]["et"] = new Date().getTime();
        }
        if (wx.getStorageSync("userInfo")["nickname"] && data.username === "好啦访客") {
            data.username = wx.getStorageSync("userInfo")["nickname"]
        }
        console.log("data.chapterTimeDown: ", data.chapterTimeDown);
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
            url: "receive_records/update_answer",
            method: "POST",
            data: {
                receiveRecordId: data.receiveRecordId,
                draft: draftAnswer
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
    //比重题
    changeslider(e) {
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
    getPhoneNumber: function (e) {
        const that = this;
        if (this.data.isSelf === 'SHARE') {
            try {
                wx.uma.trackEvent('1602215557718')
            } catch (e) {

            }
        }
        if (app.wxWorkInfo.isWxWork) {
            app.doAjax({
                url: 'wework/auth/mobile',
                method: "post",
                data: {
                    userId: wx.getStorageSync("userInfo").id,
                    teamId: wx.getStorageSync("userInfo").teamId,
                },
                success: function (res) {
                    that.setData({
                        getphoneNum: true,
                        phoneNumber: res.phone || '微信一键授权'
                    });
                },
                fail: function (err) {
                    app.toast(err.msg)
                }
            })
        } else {
            const {name} = e.currentTarget.dataset;
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
                            if (that.data.isSelf === 'SHARE') {
                                try {
                                    wx.uma.trackEvent('1602216242156')
                                } catch (e) {

                                }
                            }
                            app.doAjax({
                                url: `wework/users/${app.globalData.userMsg.id || app.globalData.userInfo.id}`,
                                method: "get",
                                data: {
                                    openid: wx.getStorageSync("openId"),
                                },
                                success: function (res) {
                                    that.setData({
                                        getphoneNum: true,
                                        phoneNumber: res.phone || '微信一键授权'
                                    });
                                }
                            });
                        }
                    });
                }
                return;
            }
        }
    },
    notFillAll: function (e) {
        var that = this;
        var data = that.data;
        var swiperCurrent = +data.swiperCurrent;
        var que = data.quesAll[swiperCurrent];
        return app.toast("各项分数之和必须等于" + que.totalScore + "分");
    },

});
