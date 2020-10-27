// test/home.js
let app = getApp();
let sKey = "";
let quesIdsOrder = [];
let answerTimeOut;
let saveTimeOut;
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
        loading: true,
    },

    onLoad: function (options) {
        let that = this;
        that.setData({
            applyStatus: options.type,
            startTime: new Date().getTime()
        });
        if (app.isTest || !app.isTest) {
            that.setData({
                // pathIndex: 2
                pathIndex: 3
            });
        }
        quesIdsOrder = [];
        sKey = "oldAnswer" + options.receiveRecordId || options.id;
        let oldData = wx.getStorageSync(sKey);
        if (oldData.pathIndex == "2" || oldData.pathIndex == "1") {
            oldData.pathIndex = 3
        }
        let storages = wx.getStorageInfoSync().keys;
        storages.forEach(function (n) {
            if (n.indexOf("oldAnswer") == 0 && n != sKey) {
                wx.removeStorageSync(n);
            }
        });
        let getphoneNum = false;
        let userPhone = (app.globalData.userInfo || {}).phone;
        if (userPhone) {
            getphoneNum = true;
        }
        let oldPeopleMsg = wx.getStorageSync("oldPeopleMsg");
        wx.removeStorageSync("oldPeopleMsg");
        if (oldPeopleMsg) {
            oldPeopleMsg["education"] = that.data.array.indexOf(oldPeopleMsg.educationName);
            that.setData(oldPeopleMsg);
        }
        app.doAjax({
            url: "paperQues",
            method: "get",
            data: {
                id: options.pid || options.evaluationId
            },
            success: function (res) {
                that.setData({
                    loading: false
                });
                if (oldData) {
                    quesIdsOrder = oldData.quesIdsOrder || [];
                }
                let ques = [];
                let ques1 = [];
                let showQues = [];
                let oldChapter = oldData.chapter;

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
                        let i = quesIdsOrder.indexOf(node.id);
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
                        let oldswiperCurrent = oldData.swiperCurrent;
                        let i1 = oldswiperCurrent - i;
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
                    id: options.id || options.receiveRecordId,
                    paperId: options.pid,
                    showQues: showQues,
                    paperList: res,
                    time: ((res.chapter || [])[0] || {}).time || "",
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
                    let startTime = oldData.startTime;
                    // let endTime = oldData.endTime;
                    let now = new Date().getTime();

                    // oldData["startTime"] = startTime + (now - endTime);
                    if ((now - startTime) > (6 * 60 * 60 * 1000)) {
                        //答题时长超过6小时
                        wx.showModal({
                            title: '作答提示',
                            content: '答题时长超过6小时，已自动提交',
                            showCancel: false,
                            success: function () {
                                that.formSubmit(null, true);
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
        app.doAjax({
            url: 'reports/check_type',
            method: 'get',
            data: {
                receiveRecordId: options.id || options.receiveRecordId
            },
            success: function (res) {
                that.setData({
                    isSelf: res.data.type
                });
            }
        });
    },
    pageTouch: function () {

    },
    onShow: function () {
        const that = this;
        app.doAjax({
            url: `wework/users/${app.globalData.userMsg.id || app.globalData.userInfo.id}`,
            method: "get",
            data: {
                openid: wx.getStorageSync("openId") || app.globalData.userInfo.openId,
            },
            success: function (res) {
                that.setData({
                    getphoneNum: true,
                    phoneNumber: res.phone
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
        console.log("work-base");
        wx.switchTab({
            url: "/pages/work-base/work-base"
        })
    },
    // 答题前填写个人信息部分
    userInput: function (e) {
        let value = e.detail.value;
        let name = e.currentTarget.dataset.n;
        let obj = {};
        obj[name] = value;
        this.setData(obj);
    },
    sexInput: function (e) {
        const {value} = e.detail;
        // const checkedSex = value === 0 ? ;
        this.setData({
            checkedSex: value,
        })
    },
    takePhoto: function () {
        let that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['camera'],
            success(res) {
                // wx.showLoading({
                //   title: '上传图片...',
                // });
                // tempFilePath可以作为img标签的src属性显示图片
                let imgUrl = res.tempFilePaths[0];
                that.setData({
                    selImg: imgUrl
                });
                let imgType = imgUrl.split(".");
                imgType = imgType[imgType.length - 1];
                let fileName = app.globalData.userInfo.id + "/" + (new Date().getTime()) + "." + imgType;
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
                    console.error("err", err);
                }, {
                    key: fileName
                });
            }
        })
    },
    submit: function (e) {
        const {name} = e.target.dataset;
        let that = this;
        if (that.data.isSelf === "SHARE") {
            try {
                wx.uma.trackEvent('1602216442285')
            } catch (e) {

            }
        }

        function doNext() {
            let data = that.data;
            let imgUrl = data.imgUrl;
            let username = data.username;
            let birthday = data.birthday;
            let education = data.education;
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
            that.gototest();
        }

        if (!that.data.getphoneNum) {
            let detail = e.detail;
            let iv = detail.iv;
            let encryptedData = detail.encryptedData;
            if (encryptedData) {
                //用户授权手机号
                let userMsg = app.globalData.userMsg || {};
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
        let that = this;
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
        let that = this;
        timeKey = timeKey || "count";

        function timeDown() {
            let time = that.data[timeKey];
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
            let obj = {};
            obj[timeKey] = time;
            let timeDownFull = "";
            let h = parseInt(time / 3600);
            let m = parseInt((time - h * 3600) / 60);
            let s = (time - h * 3600) - m * 60;
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
        let pathIndex = 3;
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
        let that = this;
        that.setData({
            isChangeQue: true
        });
        let data = that.data;
        let showQues = data.showQues;
        let ques = data.quesAll;
        let swiperCurrent = data.swiperCurrent;
        swiperCurrent = swiperCurrent > 0 ? swiperCurrent - 1 : 0;
        if (!showQues[swiperCurrent - 1] && ques[swiperCurrent - 1]) {
            showQues[swiperCurrent - 1] = ques[swiperCurrent - 1];
        }
        if (!showQues[swiperCurrent - 2] && ques[swiperCurrent - 2]) {
            showQues[swiperCurrent - 2] = ques[swiperCurrent - 2];
        }
        let swiperCurrent1 = swiperCurrent;
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
        let that = this;
        let {swiperCurrent, quesAll, theFinalQuestionAnswer} = this.data;
        let finalTotalScore = quesAll[quesAll.length - 1].totalScore;
        let score = 0;
        if (theFinalQuestionAnswer.length > 0 && swiperCurrent + 1 === quesAll.length) {
            theFinalQuestionAnswer.forEach(((value, index) => {
                score = value + score;
            }));
            if (score === finalTotalScore) {
                this.setData({
                    isFillAll: true,
                });
            }
        }
        that.setData({
            isChangeQue: true
        });
        let d = {};
        let data = that.data;
        let showQues = data.showQues;
        let ques = data.quesAll;
        if (oldIndex != null) {
            swiperCurrent = +oldIndex;
        }
        let que = data.quesAll[swiperCurrent];
        let answers = newD ? newD.answers : data.answers;
        let minChoose = que.minChoose || 1;
        let maxChoose = que.maxChoose || 1;
        let answer = app.trimSpace(JSON.parse(JSON.stringify(answers[que.id] || [])));
        if (que.type == 3) {
            let tmpsum = 0;
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
        let isLastQue = false;
        swiperCurrent += 1;
        if (swiperCurrent == that.data.quesAll.length) {
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

        let swiperCurrent1 = (data.swiperCurrent1 || 0) + 1;
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
        let that = this;
        this.setData({
            isChangeQue: true
        });
        let {index, i} = e.currentTarget.dataset;
        let {quesAll, answers, swiperCurrent} = this.data;
        let obj = quesAll[index];
        answers[obj.id] = answers[obj.id] || [];
        let maxChoose = obj.maxChoose || 1;
        let minChoose = obj.minChoose || 1;
        let answer = app.trimSpace(JSON.parse(JSON.stringify(answers[obj.id])));
        if (maxChoose < 2) { //单选
            answers[obj.id] = [];
            answers[obj.id][i] = i;
        } else {
            if (answer.length >= maxChoose && answers[obj.id][i] == null) {
                that.setData({
                    isChangeQue: false
                });
                return app.toast("最多选中" + maxChoose + "个选项");
            }
            if (answers[obj.id][i] != null) {
                answers[obj.id][i] = null;
            } else {
                answers[obj.id][i] = i;
            }
        }
        if (quesAll.length === swiperCurrent + 1) {
            const answerCopy = app.trimSpace(JSON.parse(JSON.stringify(answers[obj.id])));
            if (maxChoose < 2 || (answerCopy.length >= Number(minChoose) && answerCopy.length <= Number(maxChoose))) {
                this.setData({
                    isFillAll: true
                })
            } else {
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
    formSubmit: function (e, autoSubmit = false) {
        let that = this;
        let data = this.data;
        let swiperCurrent = +data.swiperCurrent;
        let que = data.quesAll[swiperCurrent];
        let answers = data.answers;
        let answer = app.trimSpace(JSON.parse(JSON.stringify(answers[que.id] || [])));
        if (que.type == 3 && !autoSubmit) {
            let tmpsum = 0;
            answer.forEach(score => {
                tmpsum = Number(score) + tmpsum;
            });
            if (tmpsum != que.totalScore) {
                that.setData({
                    isChangeQue: false
                });
                return app.toast("各项分数之和必须等于" + que.totalScore + "分");
            }
        }
        let name = "";
        try {
            name = e.target.dataset.name
        } catch (e) {
        }
        let chapter = that.data.chapter;
        let hasNextChapter = false;
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
                url: './components/finish/finish?type=' + that.data.applyStatus
            });
            return;
        }
        let now = new Date().getTime();
        let startTime = data.startTime;
        let chapterTime = data.chapterTime || {};
        let answerTimes = {};
        for (let i in chapterTime) {
            let o = chapterTime[i];
            answerTimes[i] = now - o.st;
        }
        answer = data.answers;
        let educationName = data.array[data.education];
        answer["time"] = answerTimes || {}; //各个章节答题用时
        answer["timeTotal"] = now - startTime; //答题总用时
        answer["birthday"] = data.birthday; //生日
        answer["educationName"] = educationName; //教育学历
        answer["username"] = data.username; //姓名
        answer["imgUrl"] = data.imgUrl; //头像
        if (wx.getStorageSync("userInfo")["nickname"] && answer["username"] === "好啦访客") {
            data.username = wx.getStorageSync("userInfo")["nickname"]
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
                receiveRecordId: data.id,
                answer: answer
            },
            success: function (ret) {
                const {id, applyStatus, paperList} = data;
                const url = `/pages/replying/components/finish/finish?id=${id}&type=${applyStatus}&name=${paperList.setting.name1}`;
                wx.navigateTo({
                    url: url
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
    saveAnswerStorageSync: function () {
        let data = this.data;
        let activeChapterId = data.activeChapterId;
        let chapterTime = {};
        if (activeChapterId != null) {
            chapterTime = data.chapterTime || {};
            chapterTime[activeChapterId]["et"] = new Date().getTime();
        }
        let d = {
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
        const that = this;
        const {name1} = this.data.paperList.setting;
        if (that.data.isSelf !== 'SHARE') {
            try {
                wx.uma.trackEvent('1602214318372', {name: name1})
            } catch (e) {

            }
        } else {
            try {
                wx.uma.trackEvent('1602215501397', {name: name1})
            } catch (e) {

            }
        }
        if (answerTimeOut) {
            clearTimeout(answerTimeOut);
        }
        let i = 0;
        let data = that.data;
        let chapterTime = data.chapterTime || {};
        if (oldData) {
            chapterTime = oldData.chapterTime || {};
            let oldChapter = oldData.chapter || [];
            let oldIndex = 0;
            oldChapter.forEach(function (node, index) {
                if (node.status == 1) {
                    oldIndex = index;
                }
            });
            i = oldIndex;
        } else if (e) {
            i = e.currentTarget.dataset.index;
        }
        let chapter = data.chapter || [];
        let obj = chapter[i] || {};
        if (obj.status != 1) return; //非可作答
        let ques = obj.ques;
        if (!ques.length) return;
        let type = obj.type;
        let quesFull = data.paperList.ques;
        let quesAll = [];
        let showQues = [];
        let swiperCurrent = 0;
        let swiperCurrent1 = 0;
        quesFull.forEach(function (node) {
            let qI = ques.indexOf(node.id);
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
                let oldswiperCurrent = oldData.swiperCurrent;
                swiperCurrent1 = oldData.swiperCurrent1;
                swiperCurrent = oldswiperCurrent;
                let i1 = oldswiperCurrent - i2;
                if (i1 > -3 && i1 < 3) {
                    showQues[i2] = node;
                }
            }
        });
        let chapterTimeDown = obj.time * 60;
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
        let that = this;
        saveTimeOut && clearTimeout(saveTimeOut);
        let data = that.data;
        let activeChapterId = data.activeChapterId;
        let chapterTime = {};
        if (activeChapterId != null) {
            chapterTime = data.chapterTime || {};
            chapterTime[activeChapterId]["et"] = new Date().getTime();
        }
        if (wx.getStorageSync("userInfo")["nickname"] && data.username === "好啦访客") {
            data.username = wx.getStorageSync("userInfo")["nickname"]
        }
        let draftAnswer = {
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
                receiveRecordId: data.id,
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
    getPhoneNumber: function (e) {
        const {name} = e.currentTarget.dataset;
        let that = this;
        if (this.data.isSelf === 'SHARE') {
            try {
                wx.uma.trackEvent('1602215557718')
            } catch (e) {

            }
        }
        if (!that.data.getphoneNum) {
            let detail = e.detail;
            let iv = detail.iv;
            let encryptedData = detail.encryptedData;
            if (encryptedData) {
                //用户授权手机号
                let userMsg = app.globalData.userMsg || {};
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
                                    phoneNumber: res.phone
                                });
                            }
                        });
                    }
                });
            }
            return;
        }
    },
    changeslider(e) {
        let {index, i} = e.currentTarget.dataset;
        let {answers, swiperCurrent, quesAll, lastAnswer} = this.data;
        let obj = quesAll[index];
        let userInputAnswer = e.detail.value;
        let NUMBER_REG = new RegExp(/^[0-9]*$/);
        try {
            userInputAnswer = Number(userInputAnswer);
        } catch (e) {

        }
        if (!NUMBER_REG.test(userInputAnswer)) {
            app.toast("必须输入数字");
            return;
        }
        let totalScore = quesAll[swiperCurrent].totalScore;
        answers[obj.id] = answers[obj.id] || [];
        let answer = app.trimSpace(JSON.parse(JSON.stringify(answers[obj.id])));
        answers[obj.id][i] = userInputAnswer ? Number(userInputAnswer) : 0;
        let t = "showQues[" + index + "].slider[" + i + "]";
        let a = "answers." + obj.id + "[" + i + "]";
        let score = 0;

        if ((swiperCurrent + 1) === quesAll.length) {
            answers[obj.id].forEach((v, k) => {
                score = score + Number(v);
            });
            if (score === Number(totalScore)) {
                this.setData({
                    isFillAll: true,
                    theFinalQuestionAnswer: answers[obj.id]
                });
            } else {
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
    notFillAll: function (e) {
        let that = this;
        let data = that.data;
        let swiperCurrent = +data.swiperCurrent;
        let que = data.quesAll[swiperCurrent];
        return app.toast("各项分数之和必须等于" + que.totalScore + "分");
    },
    input: function (e) {
    }
});
