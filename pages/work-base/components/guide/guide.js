// test/guide.js
import {getEnv, getTag, Tracker, umaEvent} from "../../../../uma.config";

const app = getApp();
var isHasApplyFor = false;
Page({
    data: {
        isGetUserInfo: false,
        isTest: false,
        maskTrigger: true,
        verified: false,
        isEmail: false,
        isSelf: "SHARE",
        receiveRecordId: "",
        evaluationStatus: "",
        demonstrateInfo: {},
        evaluationStatusText: "",
        respondPreparingPageTxt: "",
        isGetAccessToken: app.checkAccessToken(),
        authCodeCounter: 0,
        type:'',
        countdownInMinutes: -1,
        expired: false,
        expiredAt: -1,
        started: true,
        startedAt: -1,
        illegalPhone: ''
    },
    onLoad: function (option) {
        const that = this;
        let releaseEvaluationId = "";
        if(option.type){
            this.setData({
                type:option.type,
                demonstrateInfo:JSON.parse(option.releaseInfo).demonstrateInfo,
                isGetAccessToken:true,
                evaluationStatusText:JSON.parse(option.releaseInfo).msg==='RELAY'?'继续作答':'开始作答',
                countdownInMinutes: JSON.parse(option.releaseInfo).countdownInMinutes
            })
        }
        if (option.q) {
            const q = decodeURIComponent(option.q);
            const idArray = q.split("/");
            releaseEvaluationId = idArray[idArray.length - 1] || "";
        }
        if (option.scene) {
            releaseEvaluationId = decodeURIComponent(option.scene);
        }
        if (option.releaseRecordId || option.receiveRecordId || releaseEvaluationId) {
            this.setData({
                releaseRecordId: option.releaseRecordId || releaseEvaluationId,
                receiveRecordId: option.receiveRecordId || ""
            });
        }
        if (option.receiveRecordId) {
            app.doAjax({
                url: 'reports/check_type',
                method: 'get',
                data: {
                    receiveRecordId: option.receiveRecordId || ""
                },
                success: function (res) {
                    that.setData({
                        isSelf: res.data.type
                    });
                    const type = res.data.type.toLowerCase() === 'self' ? 'self' : 'scan'
                    const umaConfig = umaEvent.getInReplyGuide;
                    try{
                        new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin[type]});
                    }
                    catch (e) {
                        console.log('友盟数据统计',e);
                    }
                }
            });
        }
    },
    onShow: function () {
        const that = this;
        const {releaseRecordId,demonstrateInfo} = that.data;
        console.log(demonstrateInfo);
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
        if(this.data.type!=='self'){
            if(app.checkAccessToken()){
                this.canIUseTemptation(releaseRecordId)
            }else{
                app.checkUserInfo=(res)=>{
                    this.canIUseTemptation(releaseRecordId)
                };
            }
        }else{
            this.setData({
                maskTrigger:false,
                demonstrateInfo:demonstrateInfo
            })
        }
    },

    canIUseTemptation(releaseRecordId) {
        const flag = app.checkAccessToken()
        const target = app.checkAccessToken() ? this.getTemptation : this.getDemonstrate;
        try{
            // if (app.isTest && !releaseRecordId) {
            //     return that.getPaperMsg()
            // }
            target();
            this.getProgramSetting(releaseRecordId);
        }catch (e) {
            console.error(e)
        }
        this.setData({
            isGetAccessToken: flag
        })
    },

    toApply: function (e) {
        if (isHasApplyFor) {
            app.toast("已申请，请等待审核");
            return;
        }
        const receiveRecordId = e.currentTarget.dataset.id;
        const that = this;
        app.doAjax({
            url: `reports/${receiveRecordId}`,
            method: "put",
            data: {
                type: 'apply'
            },
            success: function (ret) {
                app.toast(ret);
                isHasApplyFor = true;
                that.onShow()
            }
        });
    },

    goToReplying: function (e) {
        let targetType = 'scan';
        const {evaluationName} = this.data.demonstrateInfo;
        const {type} = e.currentTarget.dataset;
        const receiveRecordId = this.data.receiveRecordId;
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                url: `../wework/evaluations/${receiveRecordId}/check_if_chapter_enabled`,
                method: 'GET',
                success(res){
                    let url = '';
                    let source = '';
                    if(!res){
                        url = `/pages/work-base/components/answering/answering?receiveRecordId=${receiveRecordId}`;
                        source = '/pages/work-base/components/answering/answering'
                    }else{
                        url = `/pages/work-base/components/chapter/chapter?receiveRecordId=${receiveRecordId}`;
                        source = '/pages/work-base/components/chapter/chapter'
                        wx.setStorageSync(receiveRecordId, res.draft);
                    }
                    let targetURL = {
                        url: source,
                        receiveRecordId: receiveRecordId,
                        evaluationId: ''
                    }
                    targetURL = JSON.stringify(targetURL);
                    if(type === 'golden'){
                        wx.redirectTo({
                            url: `/pages/recorder/subpages/golden/golden?redirect=${targetURL}`
                        });
                    } else {
                        wx.redirectTo({
                            url: url
                        });
                    }
                    resolve(res);
                },
                error(err){
                    reject(err);
                }
            })
        });
        const umaConfig = umaEvent.clickStartReplying;
        if(this.data.isSelf.toLowerCase() === 'self'){
            targetType = 'self'
        }
        try{
            new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin[targetType], name: `${evaluationName}`});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
        return p;
    },

    toDetail: function (e) {
        var {receiveRecordId} = this.data;
        wx.redirectTo({
            url: '/pages/report/report?receiveRecordId=' + receiveRecordId,
        });
    },

    getDemonstrate() {
        const _this = this;
        const {releaseRecordId} = this.data;
        app.doAjax({
            url: "wework/evaluations/fetch/demonstrate",
            method: "post",
            data: {
                releaseRecordId: releaseRecordId,
            },
            success: function (res) {
                _this.setData({
                    demonstrateInfo: res.demonstrateInfo,
                    maskTrigger: false,
                    countdownInMinutes: res.countdownInMinutes,
                    expired: res.expired,
                    expiredAt: res.expiredAt,
                    started: res.started,
                    startedAt: res.startedAt,
                });
            },
            complete: function () {},
            fail: function (err) {
                console.error(err);
            }
        })
    },

    getTemptation: function (userInfo = {id: ""}) {
        const _this = this;
        const {releaseRecordId} = this.data;
        app.doAjax({
            url: "wework/evaluations/fetch/temptation",
            method: "post",
            data: {
                releaseRecordId: releaseRecordId,
                // userId: userInfo.id
            },
            success: function (res) {
                console.log(res)
                let text = "";
                let {msg} = res;
                const {receiveRecordId=""} = res;
                switch (msg) {
                    case 'UNCLAIMED':
                        text = "开始作答";
                        break;
                    case "UNAVAILABLE":
                        text = "测评可用数量不足";
                        break;
                    case "APPLYING":
                        text = "等待hr通过申请";
                        break;
                    case "DISABLED":
                        text = "申请查看报告";
                        break;
                    case "VERIFY":
                        text = "开始作答";
                        break;
                    case "APPROVED":
                        text = "查看报告";
                        break;
                    case "DISABLE":
                        text = "申请查看报告";
                        break;
                    case "PREPARED":
                        text = " 开始作答 ";
                        break;
                    case "RESPONDING":
                        text = "继续作答";
                        break;
                    case "UNBIND":
                        text = '微信一键授权作答';
                        break;
                    case 'DENIED':
                        text = '重新授权其他手机号';
                        break;
                    case 'SNATCHED':
                        text = '该测评已被其他用户领取';
                        break;
                }
                _this.setData({
                    demonstrateInfo: res.demonstrateInfo,
                    evaluationStatus: msg,
                    evaluationStatusText: text,
                    receiveRecordId: receiveRecordId,
                    maskTrigger: false,
                    countdownInMinutes: res.countdownInMinutes,
                    expired: res.expired,
                    expiredAt: res.expiredAt,
                    started: res.started,
                    startedAt: res.startedAt,
                    illegalPhone: res.phone
                });
            },
            complete: function () {},
            fail: function (err) {
                console.error(err);
            }
        })
    },

    getUserInfo(e){
        const flag = Object.keys(e.detail.userInfo).length > 0;
        const {isGetUserInfo} = this.data;
        if (!flag && !isGetUserInfo) return;
        if (flag) {
            app.updateUserInfo(e).then(res=>{
                this.goToRecorder();
                this.setData({
                    isGetUserInfo: true,
                });
            }).catch(err=>{
                console.error(err);
            });
        }
    },

    goToRecorder: function () {
        let type = 'scan';
        const {releaseRecordId,demonstrateInfo,receiveRecordId} = this.data;
        const umaConfig = umaEvent.clickStartReplying;
        if(this.data.isSelf.toLowerCase()!=='self'){
            wx.redirectTo({
                url: `/pages/recorder/recorder?releaseRecordId=${releaseRecordId}`
            });
        }else{
            app.doAjax({
                url: "/release/self/start",
                method: "post",
                data: {
                    receiveRecordId: receiveRecordId,
                    // userId: userInfo.id
                },
                success: function (res) {
                    new Promise((resolve, reject) => {
                        app.doAjax({
                            url: `../wework/evaluations/${receiveRecordId}/check_if_chapter_enabled`,
                            method: 'GET',
                            success(res){
                                resolve(res);
                            },
                            error(err){
                                reject(err);
                            }
                        })
                    }).then(res => {
                        var url = ''
                        if(res){
                            url = `/pages/work-base/components/chapter/chapter?&receiveRecordId=${receiveRecordId}`;
                        }else{
                            url = `/pages/work-base/components/answering/answering?&receiveRecordId=${receiveRecordId}`
                        }
                        wx.redirectTo({
                            url: url
                        })
                    })
                }
            })
            type = 'self';
        }
        try{
            new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin[type], name: `${demonstrateInfo.evaluationName}`});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
    },

    getProgramSetting(releaseRecordId) {
        const that = this;
        app.getMiniProgramSetting(releaseRecordId).then(res=>{
            that.setData({
                respondPreparingPageTxt: res.respondPreparingPageTxt
            })
        }).catch(err=>{
            console.error(err)
        });
    },

    getPhoneNumber(e) {
        const that = this;
        let {authCodeCounter} = this.data;
        if(authCodeCounter > 5){
            return
        }
        app.getAccessToken(e)
            .then(res => {
                try{
                    this.getTemptation()
                } catch (e) {
                    return Promise.reject();
                }
                return Promise.resolve();
            })
            .then(res=>{
                const {evaluationStatus} = this.data;
                switch (evaluationStatus) {
                    case 'UNCLAIMED':
                    case 'VERIFY':
                        this.goToRecorder();
                        break;
                    case 'RESPONDING':
                        this.goToReplying(e);
                        break;
                    case 'PREPARED':
                        this.goToReplying({currentTarget:{dataset: {type: 'golden'}}});
                }
            })
            .catch(err=>{
                if(err.code === '401111'){
                    app.prueLogin().then(res=>{
                        that.getPhoneNumber(e)
                    });
                    that.setData({
                        authCodeCounter: authCodeCounter++
                    })
                }
            })
    },

    getPhoneNumberForRec(e) {
        if(!e.detail.iv) return
        const {releaseRecordId} = this.data;
        app.prueLogin()
            .then(res=>{
                const data = {...e.detail, releaseRecordId, authCode: res.authCode}
                return app.authPhoneForRec(data)
            })
            .then(res=>{

            })
    }
});
