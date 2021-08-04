import {QUES_TYPE} from './const/index';
import debounce from "../../../../utils/lodash/debounce";
import {getEnv, umaEvent} from "../../../../uma.config";
const app = getApp();
Page({
    data: {
        numArr: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
        multipleQuesHTML: "<span style='display: inline-block;box-sizing: border-box;height: 20px;font-size: 15px;font-weight: 600;color: #353EE8;line-height: 20px;margin-right: 10px;'>【多选题】</span>",
        percentQuesHTML: "<span style='display: inline-block;box-sizing: border-box;height: 20px;font-size: 15px;font-weight: 600;color: #353EE8;line-height: 20px;margin-right: 10px;'>【分数分配题】</span>",
        optionsAry: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        phoneModel: app.isIphoneX,
        isSelf: "",
        questions: [],
        countdownEnabled: false,
        countdownInSeconds: 0,
        /*答题卡*/
        answerSheet: {},
        questionStep: 0,
        fill: false,
        outSideScrollTop: 0,
        computeScrollTop: 0,

        size: 1,
        extraNodes: [],
        pageMetaScrollTop: 0,
        scrollTop: 0,
        receiveRecordId: '',
        hasVanishImageSetting:[],
        /*遮罩控制，防止用户多次滑动swiper-item，导致答题流程错误*/
        isChangeQue: false,
        chapterId:'',
        isGetUserInfo: false,
        canIUseGetUserProfile: !!wx.getUserProfile,
        profileType: ''
    },

    onLoad: function (options) {
        const that = this;
        if(options.chapterId){
            this.setData({
                chapterId:options.chapterId,
                type: options.type
            })
            this.loadQuestionChapter(options.chapterId,options.receiveRecordId)
            /*初始化题目*/
            .then(res=>{
                try{
                    var {questions, countdownEnabled, countdownInSeconds} = res;
                    var hasVanishImageSetting = Array.apply(null,{length:questions.length})
                    questions.forEach((que,queIndex) => {
                        if(que.vanishImageSetting){
                            que.stem = que.stem.replace(/<img.*?(?:>|\/>)/gi,'')
                            var newObj = que.vanishImageSetting
                            newObj['isShow'] = true
                            hasVanishImageSetting.splice(queIndex,1,newObj)
                        }
                    })
                    this.setData({
                        hasVanishImageSetting,
                        questions,
                        countdownEnabled,
                        countdownInSeconds,
                        receiveRecordId: options.receiveRecordId
                    });
                    return Promise.resolve(res)
                }catch(e){
                    return Promise.reject('answering.js:188, 获取题目错误')
                }
            })
            /*初始化草稿*/
            .then(res=>{
                try{
                    const draft = res.draft;
                    if(Object.keys(draft).length){
                        this.setData({
                            answerSheet: draft
                        })
                        this.swipeTo(Object.keys(draft).length - 1);
                    }
                    return Promise.resolve(res)
                }catch (e) {
                    return Promise.reject('answering.js:203, 获取草稿错误')
                }
            })
            /*初始化答题卡*/
            .then(res=>{
                try{
                    const {answerSheet} = this.data;
                    const {questions} = res;
                    if(Object.keys(answerSheet).length === questions.length){
                        return this.judge()
                    }
                    return Promise.resolve({})
                }catch (e) {
                    return Promise.reject('answering.js:216, 初始化答题卡错误')
                }
            })
            /*初始化fill*/
            .then(({fill})=>{
                try{
                    if(fill){
                        this.setData({
                            fill: true
                        })
                    }
                }catch (e) {
                    return Promise.reject('answering.js:228, 初始化fill错误')
                }
            })
            /*抛出错误信息*/
            .catch(err=>{
                console.error(err);
            });
        }else{
            this._checkType(options);
            this.loadQuestion(options.receiveRecordId)
                /*初始化题目*/
                .then(res=>{
                    try{
                        if(res){
                            var {questions, countdownEnabled, countdownInSeconds} = res;
                            var hasVanishImageSetting = Array.apply(null,{length:questions.length})
                            questions.forEach((que,queIndex) => {
                                if(que.vanishImageSetting){
                                    que.stem = que.stem.replace(/<img.*?(?:>|\/>)/gi,'')
                                    var newObj = que.vanishImageSetting
                                    newObj['isShow'] = true
                                    hasVanishImageSetting.splice(queIndex,1,newObj)
                                }
                            })
                            this.setData({
                                hasVanishImageSetting,
                                questions,
                                countdownEnabled,
                                countdownInSeconds,
                                receiveRecordId: options.receiveRecordId
                            });
                        }
                        return Promise.resolve(res)
                    }catch(e){
                        return Promise.reject('answering.js:188, 获取题目错误')
                    }
                })
                /*初始化草稿*/
                .then(res=>{
                    try{
                        const draft = res.draft;
                        if(Object.keys(draft).length){
                            this.setData({
                                answerSheet: draft
                            })
                            this.swipeTo(Object.keys(draft).length - 1);
                        }
                        return Promise.resolve(res)
                    }catch (e) {
                        return Promise.reject('answering.js:203, 获取草稿错误')
                    }
                })
                /*初始化答题卡*/
                .then(res=>{
                    try{
                        const {answerSheet} = this.data;
                        const {questions} = res;
                        if(Object.keys(answerSheet).length === questions.length){
                            return this.judge()
                        }
                        return Promise.resolve({})
                    }catch (e) {
                        return Promise.reject('answering.js:216, 初始化答题卡错误')
                    }
                })
                /*初始化fill*/
                .then(({fill})=>{
                    try{
                        if(fill){
                            this.setData({
                                fill: true
                            })
                        }
                    }catch (e) {
                        return Promise.reject('answering.js:228, 初始化fill错误')
                    }
                })
                /*抛出错误信息*/
                .catch(err=>{
                    console.error(err);
                });
        }
        this.init();
        app.getUserInformation()
            .then(res=>{
                let {canIUseGetUserProfile, profileType} = this.data;
                if(res.avatar){
                    profileType = '';
                } else if (!res.avatar && canIUseGetUserProfile) {
                    profileType = 'getUserProfile';
                } else if (!res.avatar && !canIUseGetUserProfile) {
                    profileType = 'getUserInfo';
                }
                that.setData({
                    profileType
                })
            })
    },

    onShow() {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
    },

    authUserProfile(e) {
        const that = this;
        const {profileType} = this.data;
        if(profileType === 'getUserInfo'){
            app.updateUserInfo(e)
                .then(res=>{
                    that.save()
                })
        } else {
            wx.getUserProfile({
                desc: "获取用户信息",
                success: (res) => {
                    app.updateUserInfo(res).then(res=>{
                        that.save()
                    })
                },
                error: (e) => {
                    console.log(e);
                },
                fail: (e) => {
                    console.log(e);
                }
            })
        }
    },

    openImg(event) {
        const {questionStep} = event.currentTarget.dataset;
        const {answerSheet, questions} = this.data;
        answerSheet[questions[questionStep].id] = this.answerSheetItem(questionStep);
        var hasVanishImageSetting = this.data.hasVanishImageSetting
        hasVanishImageSetting[questionStep].isShow = false
        var time = hasVanishImageSetting[questionStep].standingInSeconds
        var intervarl = setInterval(()=>{
            time--
            if(time===0){
                clearInterval(intervarl)
            }
            hasVanishImageSetting[questionStep].standingInSeconds = time
            this.setData({
                hasVanishImageSetting
            })
        },1000);
        this.setData({
            hasVanishImageSetting,
            answerSheet: {...answerSheet}
        }, ()=>{
            this.memory();
        });
    },

    _checkType: function (options) {
        const that = this;
        app.doAjax({
            url: 'reports/check_type',
            method: 'get',
            data: {
                receiveRecordId: options.receiveRecordId || _this.data.receiveRecordId
            },
            success: function (res) {
                that.setData({
                    isSelf: res.data.type
                });
            }
        });
    },

    pageTouch() {return},

    loadQuestionChapter(chapterId,receiveRecordId) {
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                url: `../wework/evaluations/chapters/${chapterId}/paper`,
                method: 'GET',
                success(res){
                    resolve(res);
                },
                data:{
                    receiveRecordId
                },
                error(err){
                    reject(err);
                }
            })
        });
        return p;
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

    selectQuesItem: debounce(function(e) {
        const {questionIndex, optionIndex, questionId} = e.currentTarget.dataset;
        // console.log(questionIndex, optionIndex);
        const {answerSheet, questions, questionStep} = this.data;
        const {type, leastChoice, mostChoice} = questions[questionIndex];
        const targetSheet =  JSON.parse(JSON.stringify(answerSheet));
        if(optionIndex < 0 || questionIndex < 0){
            app.toast('题目或选项为空');
            return;
        }
        if(type === QUES_TYPE[0] && questionIndex !== questions.length-1){
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
        this.memory().then(()=>{
            this.storageAnswerSheetAsync();
        });
        if(type === QUES_TYPE[0]){
            if(questionIndex+1 !== questions.length){
                this.nextQues(questionIndex)
            }
        }
        if(questionIndex+1 === questions.length){
            this.judge().then(({fill})=>{
                this.setData({
                    fill: fill
                })
            })
        }
    },0,{
        trailing: true,
        leading: false,
    }),

    onChangeSlider: debounce(function (e) {
        const {questionStep, answerSheet, questions} = this.data;
        const {optionIndex, questionIndex} = e.currentTarget.dataset;
        const {totalScore} = questions[questionIndex];
        let value = Number(e.detail.value);
        if(value > totalScore){
            value = totalScore;
        }
        if(!this.checkSliderValue(value)){
            value = 0;
        }
        const {options} = questions[questionIndex];
        const targetSheet = JSON.parse(JSON.stringify(answerSheet));
        const targetItem = this.answerSheetItem(questionIndex);
        /*用户无作答记录的情况*/
        if(Object.keys(answerSheet).length - 1 < questionIndex){
            targetItem.indexes[optionIndex] = value;
            targetSheet[questions[questionIndex].id]=targetItem
        }
        /*用户有作答记录的情况*/
        if(Object.keys(answerSheet).length - 1 >= questionIndex){
            let indexes = targetSheet[questions[questionIndex].id]['indexes'];
            if(indexes.length !== options.length){
                indexes = new Array(options.length).fill(0);
            }
            indexes[optionIndex] = value;
        }
        this.setData({
            answerSheet: targetSheet,
        });
        this.memory().then(()=>{
            this.storageAnswerSheetAsync();
        });
        if(questionStep+1 === questions.length){
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

    onSorted(e) {
        console.log(e);
        const {listData} = e.detail;
        const {answerSheet, questions, questionStep} = this.data;
        console.log(answerSheet);
        const targetItem = this.answerSheetItem(questionStep);
        console.log(targetItem);
        const targetSheet = {...answerSheet};
        if(Object.keys(answerSheet).length - 1 < questionStep){
            targetItem.indexes = listData.map(item=>{
                return item.index
            });
            targetSheet[targetItem.questionId] = targetItem;
        }
        if(Object.keys(answerSheet).length - 1 >= questionStep){
            targetSheet[questionStep].indexes = listData.map(item=>{
                return item.index
            })
        }
        this.setData({
            answerSheet: targetSheet
        });
        this.memory().then(()=>{
            this.storageAnswerSheetAsync();
        });
        if(questionStep+1 === questions.length){
            this.judge().then(({fill})=>{
                this.setData({
                    fill
                })
            })
        }
    },

    nextQues(questionIndex) {
        this.setData({
            isChangeQue: true
        });
        let isSorting = false;
        const {questionStep, answerSheet, indexedOptions, questions} = this.data;
        const indexes = answerSheet[questions[questionStep]['id']] && answerSheet[questions[questionStep]['id']].indexes ? answerSheet[questions[questionStep]['id']].indexes : [] ;
        this.judge().then(({flag, text})=>{
            if(!flag && text){
                app.toast(text);
                setTimeout(()=>{
                    this.setData({
                        isChangeQue: false
                    });
                },600);
                return;
            }
            if(questions[questionStep].type === 'SORTING' && indexes.length === 0){
                const targetSheet = JSON.parse(JSON.stringify(answerSheet));
                targetSheet[questions[questionStep].id] = this.answerSheetItem(questionStep);
                this.setData({
                    answerSheet: targetSheet
                });
                isSorting = true;
            }
            if((indexes.length && flag) || isSorting){
                this.setData({
                    questionStep: questionIndex >= 0 ? questionIndex + 1 : questionStep + 1,
                },()=>{
                    setTimeout(()=>{
                        this.setData({
                            isChangeQue: false
                        });
                    }, 600)
                })
            }
        })
    },

    preQues() {
        this.setData({
            isChangeQue: true
        });
        const {questionStep} = this.data;
        if(questionStep >= 1){
            this.setData({
                questionStep: questionStep - 1
            },()=>{
                setTimeout(()=>{
                    console.log(this)
                    this.setData({
                        isChangeQue: false
                    });
                }, 600)
            })
            return;
        }
        this.setData({
            isChangeQue: false,
        });
    },


    memory(chapterId,receiveRecordId) {
        const {answerSheet} = this.data;
        chapterId = this.data.chapterId || chapterId;
        receiveRecordId = this.data.receiveRecordId || receiveRecordId;
        if(!receiveRecordId){
            console.error('answering.js:867 -> ', '缺少receiveRecordId');
            return Promise.reject;
        }
        var p
        if(chapterId){
            p = new Promise((resolve, reject) => {
                app.doAjax({
                    url: `../wework/evaluations/chapters/${chapterId}/drafts?receiveRecordId=${receiveRecordId}`,
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
        }else{
            p = new Promise((resolve, reject) => {
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

        }
        return p
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
        const {questionStep, answerSheet, questions, sortedList} = this.data;
        const {type, leastChoice, mostChoice, totalScore} = questions[questionStep];
        const indexes = answerSheet[questions[questionStep].id] && answerSheet[questions[questionStep].id].indexes ? answerSheet[questions[questionStep].id].indexes : [] ;
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
                        console.log('QUES_TYPE: ', flag)
                        /*是否完成所有题目*/
                        if(questionStep+1 === questions.length && flag) {
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
                        if(questionStep+1 === questions.length && flag) {
                            fill = true;
                        }
                        break;
                    case QUES_TYPE[3]:
                        flag = true;
                        if(questionStep+1 === questions.length) {
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

    save(automatic=false) {
        let type = 'scan'
        const {answerSheet, receiveRecordId, chapterId, isSelf} = this.data;
        const umaConfig = umaEvent.submitAnswer;
        type = isSelf.toLowerCase() === 'self' ? 'self' : 'scan';
        // ToDo 测评名称
        wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin[type], name: `${umaConfig.name}${'name'}`, env: getEnv(wx)});
        if(chapterId) {
            const p = new Promise((resolve, reject) => {
                app.doAjax({
                    url: `../hola/receive_records/chapters/answers?receiveRecordId=${receiveRecordId}&chapterId=${chapterId}&userId=${wx.getStorageSync("userInfo").userId || ""}`,
                    method: 'POST',
                    data: {
                        automatic,
                        responds: answerSheet,
                    },
                    success(res) {
                        var url =''
                        if(!res.hasNext){
                            url = `../done/done?receiveRecordId=${receiveRecordId}`
                        }else{
                            url = `/pages/work-base/components/chapter/chapter?&receiveRecordId=${receiveRecordId}`
                        }
                        wx.redirectTo({
                            url
                        });
                        resolve(res)
                    },
                    error(err) {
                        wx.reLaunch({
                            url: '/pages/user-center/components/receive-evaluations/receive-evaluations'
                        });
                        reject(err);
                    }
                })
            });
            return p;
        }
        else {
            const p = new Promise((resolve, reject) => {
                app.doAjax({
                    url: `../hola/receive_records/answers?receiveRecordId=${receiveRecordId}&userId=${wx.getStorageSync("userInfo").userId || ""}`,
                    method: 'POST',
                    data: {
                        automatic,
                        responds: answerSheet,
                    },
                    success(res) {
                        wx.redirectTo({
                            url: `../done/done?receiveRecordId=${receiveRecordId}`,
                        });
                        resolve(res)
                    },
                    error(err) {
                        wx.reLaunch({
                            url: '/pages/user-center/components/receive-evaluations/receive-evaluations'
                        });
                        reject(err);
                    }
                })
            });
            return p;
        }

    },

    forceSave() {
        wx.showModal({
            title: '作答提示',
            content: '作答时间到，已自动提交',
            showCancel: false,
            success: ()=> {
                this.save(true)
            }
        })
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
    },

    storageAnswerSheetAsync() {
        const {receiveRecordId, answerSheet} = this.data;
        wx.setStorageSync(receiveRecordId, answerSheet);
    },

    swipeTo(step) {
        this.setData({
            questionStep: step
        })
    },

    answerSheetItem(questionIndex) {
        const {questions} = this.data;
        console.log(questions[questionIndex].id);
        const {type, options, indexedOptions} = questions[questionIndex];
        const targetItem = {
            questionId: questions[questionIndex].id,
            indexes: type === 'PROPORTION' ? new Array(options.length).fill(0) : [],
        };
        if (questions[questionIndex]['vanishImageSetting']) {
            targetItem.exposed = true;
        }
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

    dragScroll(e) {
        this.setData({
            computeScrollTop: e.detail.scrollTop
        });
        console.log('dragScroll: ', e.detail.scrollTop);
    },

    checkSliderValue(value) {
        const NUMBER_REG = new RegExp(/^[0-9]*$/);
        if (!NUMBER_REG.test(value)) {
            app.toast("必须输入数字");
            return false;
        }
        return true;
    },

    init() {
        const {questionStep} = this.data;
        this.drag = this.selectComponent(`#drag-${questionStep}`);
        if(this.drag){
            this.drag.init();
        }
    },
});
