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
        listData: [
            {
                dragId: "item0",
                title: "1、这个绝望的世界没有存在的价值，所剩的只有痛楚",
                description: "思念、愿望什么的都是一场空，被这种虚幻的东西绊住脚，什么都做不到",
                images: "/assets/image/swipe/1.png",
                fixed: false
            },
            {
                dragId: "item1",
                title: "2、我早已闭上了双眼，我的目的，只有在黑暗中才能实现",
                description: "有太多的羁绊只会让自己迷惘，强烈的想法和珍惜的思念，只会让自己变弱",
                images: "/assets/image/swipe/2.png",
                fixed: false
            },
            {
                dragId: "item2",
                title: "3、感受痛苦吧，体验痛苦吧，接受痛苦吧，了解痛苦吧。不知道痛苦的人是不会知道什么是和平",
                description: "但我已经在无限存在的痛苦之中，有了超越凡人的成长。从凡人化为神",
                images: "/assets/image/swipe/3.png",
                fixed: false
            },
            {
                dragId: "item3",
                title: "4、我决定了 从今天起 我要选择一条不会让自己后悔的路 我要创造出属于自己的忍道 ",
                description: "我才不要在这种时候放弃,即使当不成中忍,我也会通过其他的途径成为火影的,这就是我的忍道",
                images: "/assets/image/swipe/4.png",
                fixed: false
            },
            {
                dragId: "item4",
                title: "5、为什么你会这么弱？就是因为你对我的仇恨...还不够深...",
                description: "你没有杀的价值...愚蠢的弟弟啊...想要杀死我的话...仇恨吧！憎恨吧！然后丑陋地活下去吧！逃吧 逃吧...然后苟且偷生下去吧！",
                images: "/assets/image/swipe/5.png",
                fixed: false
            },
            {
                dragId: "item5",
                title: "6、对于忍者而言怎样活着无所谓，怎样死去才是最重要的...",
                description: "所谓的忍者就是忍人所不能忍，忍受不了饿肚子，而沦落为盗贼的人，根本不能称之为忍者",
                images: "/assets/image/swipe/6.png",
                fixed: false
            },
            {
                dragId: "item6",
                title: "7、在这世上，有光的地方就必定有黑暗，所谓的胜者，也就是相对败者而言",
                description: "若以一己之思念要维持和平，必会招致战争，为了守护爱，变回孕育出恨。此间因果，是无法斩断的。现实就是如此",
                images: "/assets/image/swipe/7.png",
                fixed: false
            },
            {
                dragId: "item7",
                title: "8、世界上...只有没有实力的人,才整天希望别人赞赏...",
                description: "很不巧的是我只有一个人，你说的那些家伙们已经一个都没有了，已经??全部被杀死了",
                images: "/assets/image/swipe/8.png",
                fixed: false
            },
            {
                dragId: "item8",
                title: "9、千代婆婆，父亲大人和母亲大人回来了吗？？？",
                description: "明明剩下的只有痛苦了，既然你这么想活命，我就方你一条生路好了。不过，你中的毒不出三日就会要了你的命",
                images: "/assets/image/swipe/9.png",
                fixed: false
            },
            {
                dragId: "item9",
                title: "10、艺术就是爆炸！！~~ 嗯 ~~ 芸术は爆発します！",
                description: "我的艺术就是爆炸那一瞬，和蝎那种让人吃惊的人偶喜剧从根本上就是不同的！",
                images: "/assets/image/swipe/10.png",
                fixed: false
            }
        ],
        extraNodes: [],
        pageMetaScrollTop: 0,
        scrollTop: 0,
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
                        countdownInMinutes
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
                    return Promise.resolve()
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
        this.init();
    },

    onShow() {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
        this._checkReceiveInfo();
    },

    onHide: function () {},

    onUnload: function () {},

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
        const that = this;
        const {receiveRecordId, countdownInMinutes, countdownEnabled} = this.data;
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

    pageTouch() {

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
            if(questionStep+1 !== questions.length){
                this.nextQues()
            }
        }
        if(questionStep+1 === questions.length){
            this.judge().then(({fill})=>{
                if(fill){
                    this.setData({
                        fill: true
                    })
                }
            })
        }
    },

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
        const {questionStep, answerSheet, questions} = this.data;
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
                    //TODO: 后端需要回传evaluationId
                    wx.redirectTo({
                        url: `../done/done?receiveRecordId=${receiveRecordId}&evaluationId=${evaluationId}`,
                    });
                    resolve(res)
                },
                error(err) {
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
        const {type, options} = questions[questionIndex];
        const targetItem = {
            questionId: questions[questionIndex].id,
            indexes: type === 'PROPORTION' ? new Array(options.length).fill(0) : [],
        };
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
