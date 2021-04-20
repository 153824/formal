import {QUES_TYPE} from './const/index';
import debounce from "../../../../utils/lodash/debounce";
const app = getApp();
Page({
    data: {
        numArr: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
        multipleQuesHTML: "<span style='display: inline-block;box-sizing: border-box;height: 20px;font-size: 15px;font-weight: 600;color: #353EE8;line-height: 20px;margin-right: 10px;'>【多选题】</span>",
        percentQuesHTML: "<span style='display: inline-block;box-sizing: border-box;height: 20px;font-size: 15px;font-weight: 600;color: #353EE8;line-height: 20px;margin-right: 10px;'>【分数分配题】</span>",
        optionsAry: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        phoneModel: app.isIphoneX,
        isSelf: "",
        sandGlass: 0,
        fetchedAt: 0,
        questions: [],
        countdownEnabled: false,
        countdownInMinutes: 0,
        /*答题卡*/
        answerSheet: [],
        questionStep: 0,
        fill: false,
        outSideScrollTop: 0,
        computeScrollTop: 0,

        size: 1,
        extraNodes: [],
        pageMetaScrollTop: 0,
        scrollTop: 0,
        receiveRecordId: ''
    },

    onLoad: function (options) {
        this._checkType(options);
        this.loadQuestion(options.receiveRecordId)
            /*初始化题目*/
            .then(res=>{
                try{
                    const {questions, countdownEnabled, countdownInMinutes} = res;
                    this.setData({
                        questions,
                        countdownEnabled,
                        countdownInMinutes,
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
                    const draft = wx.getStorageSync(options.receiveRecordId);
                    if(draft.length){
                        this.setData({
                            answerSheet: draft
                        })
                        this.swipeTo(draft.length - 1);
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
                    if(answerSheet.length === questions.length){
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
            .then(()=>{
                this._checkReceiveInfo(options.receiveRecordId)
            })
            /*抛出错误信息*/
            .catch(err=>{
                console.error(err);
            });
        this.init();
    },

    onShow() {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
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

    _checkReceiveInfo(receiveRecordId) {
        const that = this;
        let {countdownInMinutes, countdownEnabled} = this.data;
        receiveRecordId = receiveRecordId || this.data.receiveRecordId;
        app.doAjax({
            url: `wework/evaluations/receive_info/${receiveRecordId}`,
            method: "get",
            success: function (res) {
                if(!countdownEnabled){
                    return;
                }
                try{
                    let sandGlass = countdownInMinutes * 60 * 1000 - (new Date().getTime() - res.fetchedAt);
                    that.setData({
                        sandGlass: sandGlass,
                        fetchedAt: res.fetchedAt
                    });
                }catch (e) {
                    console.error(e);
                }
            },
            fail: function (err) {
                throw err
            }
        })
    },

    getScrollTop(e) {
        console.log('getScrollTop: ',e);
        this.setData({
            computeScrollTop: e.detail
        });
    },

    pageTouch() {return},

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

    selectQuesItem: debounce(function(e) {
        const {questionIndex, optionIndex} = e.currentTarget.dataset;
        // console.log(questionIndex, optionIndex);
        const {answerSheet, questions, questionStep} = this.data;
        const targetSheet = [...answerSheet];
        if(optionIndex < 0 || questionIndex < 0){
            app.toast('题目或选项为空');
            return;
        }
        const {type, leastChoice, mostChoice} = questions[questionIndex];
        try {
            if(type === 'SINGLE' && answerSheet[questionIndex].indexes.includes(optionIndex)){
                return;
            }
        } catch (e) {

        }
        if(type === 'MULTIPLE' && answerSheet[questionIndex] && answerSheet[questionIndex].indexes){
            const {indexes} = answerSheet[questionIndex];
            if(indexes.length >= mostChoice && !indexes.includes(optionIndex)){
                app.toast(`最多选中${mostChoice}个选项`)
                return;
            }
        }
        const targetItem = this.answerSheetItem(questionIndex);
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
        const targetSheet = [...answerSheet];
        const targetItem = this.answerSheetItem(questionIndex);
        /*用户无作答记录的情况*/
        if(answerSheet.length - 1 < questionIndex){
            targetItem.indexes[optionIndex] = value;
            targetSheet.push(targetItem)
        }
        /*用户有作答记录的情况*/
        if(answerSheet.length - 1 >= questionIndex){
            let indexes = targetSheet[questionIndex]['indexes'];
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
        const {listData} = e.detail;
        const {answerSheet, questions, questionStep} = this.data;
        const targetItem = this.answerSheetItem(questionStep);
        const targetSheet = [...answerSheet];
        if(answerSheet.length - 1 < questionStep){
            targetItem.indexes = listData.map(item=>{
                return item.index
            });
            targetSheet.push(targetItem);
        }
        if(answerSheet.length - 1 >= questionStep){
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
        let isSorting = false;
        const {questionStep, answerSheet, indexedOptions, questions} = this.data;
        const indexes = answerSheet[questionStep] && answerSheet[questionStep].indexes ? answerSheet[questionStep].indexes : [] ;
        this.judge().then(({flag, text})=>{
            if(!flag && text){
                app.toast(text);
            }
            if(questions[questionStep].type === 'SORTING' && indexes.length === 0){
                const targetSheet = [...answerSheet];
                targetSheet[questionStep] = this.answerSheetItem(questionStep);
                this.setData({
                    answerSheet: targetSheet
                });
                isSorting = true;
            }
            if(indexes.length && flag || isSorting){
                setTimeout(()=>{
                    this.setData({
                        questionStep: questionIndex >= 0 ? questionIndex + 1 : questionStep + 1
                    })
                },350)
            }
        })
    },

    preQues() {
        const {questionStep} = this.data;
        if(questionStep >= 1){
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
    },

    forceSave() {
        wx.showModal({
            title: '作答提示',
            content: '作答时间到，已自动提交',
            showCancel: false,
            success: ()=> {
                this.save()
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
        const {type, options, indexedOptions} = questions[questionIndex];
        const targetItem = {
            questionId: questions[questionIndex].id,
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
        this.drag.init();
    },
});
