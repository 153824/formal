// test/guide.js
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
        authCodeCounter: 0
    },
    onLoad: function (option) {
        const that = this;
        let releaseEvaluationId = "";
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
                }
            });
        }
    },
    onShow: function () {
        const that = this;
        const {releaseRecordId} = that.data;
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }

        if(app.checkAccessToken()){
            this.canIUseTemptation(releaseRecordId)
        }else{
            app.checkUserInfo=(res)=>{
                this.canIUseTemptation(releaseRecordId)
            };
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

    /**
     * 申请查看报告
     */
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
    /**
     *获取测评详情
     */
    getPaperMsg: function (params) {
        params = params || {};
        const that = this;
        app.shareId = null;
        app.doAjax({
            url: "paperQues",
            method: "get",
            noLoading: true,
            data: {
                id: params.evaluationId || "",
                isTest: app.isTest
            },
            success: function (res) {
                that.setData({
                    status: params.status,
                    isTest: app.isTest,
                    draftAnswer: params.draftAnswer,
                    reportPermit: params.reportPermit,
                    releaseRecordId: params.releaseRecordId || "",
                    evaluationId: params.evaluationId || "",
                    evaluationList: res,
                    receiveRecordId: params.receiveRecordId
                });
            }
        });
    },

    verifyUserInfo: function (e) {
        const {evaluationId,} = this.data.demonstrateInfo;
        const {releaseRecordId, reportPermit, status,} = this.data;
        const url = `/pages/work-base/components/answering/answering?evaluationId=${evaluationId}&releaseRecordId=${releaseRecordId}&reportPermit=${reportPermit}&status=${status}&verify=true`;
        wx.redirectTo({
            url: url
        });
    },

    goToReplying: function (e) {
        const {receiveRecordId} = this.data;
        const {evaluationId,releaseRecordId,reportPermit,status} = this.data.demonstrateInfo;
        app.doAjax({
            url: "wework/evaluations/fetch/relay",
            method: 'post',
            data: {
                receiveRecordId: receiveRecordId,
            },
            success: function (res) {
                // const url = `/pages/work-base/components/answering/answering?evaluationId=${evaluationId}&releaseRecordId=${releaseRecordId}&receiveRecordId=${receiveRecordId}&reportPermit=${reportPermit}&status=${status}`;
                const url = `/pages/work-base/components/chapter/chapter?evaluationId=${evaluationId}&releaseRecordId=${releaseRecordId}&receiveRecordId=${receiveRecordId}&reportPermit=${reportPermit}&status=${status}`;
                wx.setStorageSync(receiveRecordId, res.draft);
                wx.navigateTo({
                    url: url
                });
            }
        });
    },
    /**
     * 进入报告详情
     */
    toDetail: function (e) {
        var {receiveRecordId} = this.data;
        wx.redirectTo({
            url: '/pages/report/report?receiveRecordId=' + receiveRecordId,
        });
    },

    fetchEvaluation: function (userInfo) {
        const that = this;
        const {releaseRecordId} = this.data;
        if (!userInfo) {
            userInfo = {
                id: ""
            };
        }
        app.doAjax({
            url: "release/fetch",
            method: "post",
            noLoading: true,
            data: {
                releaseRecordId: releaseRecordId,
                userId: userInfo.id
            },
            success: function (res) {
                const {evaluationId, receiveRecordId, reportPermit, status} = res;
                let text = "";
                if (!res.receiveRecordId && res.msg !== 'qualification needed') {
                    app.toast("该分享已失效！");
                    wx.navigateTo({
                        url: "/pages/work-base/work-base"
                    });
                    return;
                } else if (!res.receiveRecordId && res.msg === 'qualification needed') {
                    that.setData({
                        isEmail: true,
                    })
                }
                const sKey = "oldAnswer" + res.receiveRecordId;
                const oldData = wx.getStorageSync(sKey);
                that.setData({
                    reportPermit: res.reportPermit,
                });
                setTimeout(() => {
                    that.setData({
                        maskTrigger: false
                    })
                }, 500);
                if (oldData && res.status !== 'FINISHED') {
                    setTimeout(() => {
                        const url = `../answering/answering?evaluationId=${evaluationId}&releaseRecordId=${releaseRecordId}&receiveRecordId=${receiveRecordId}&reportPermit=${reportPermit}&status=${status}`;
                        wx.redirectTo({
                            url: url,
                        });
                    }, 500);
                    return;
                }
                const oldPeopleMsg = res.participantInfo;
                if (oldPeopleMsg && oldPeopleMsg.username) {
                    wx.setStorageSync("oldPeopleMsg", oldPeopleMsg);
                }
                switch (res.msg) {
                    case 'continue examining':
                        text = "继续作答";
                        break;
                    case 'show report':
                        text = "查看报告";
                        break;
                    case 'apply to view report':
                        text = "申请查看报告";
                        break;
                    case 'wait for approving view report':
                        text = "等待hr通过申请";
                        break;
                    case 'not available':
                        text = "分享已失效";
                        app.toast("该分享已失效！")
                        wx.switchTab({
                            url: "/pages/home/home"
                        });
                        break;
                    case 'qualification needed':
                        text = "立即验证";
                        break;
                    case 'fetch success':
                        text = "开始作答";
                        break;
                }
                that.getPaperMsg({
                    status: res.status,
                    reportPermit: res.reportPermit,
                    draftAnswer: res.draft,
                    evaluationId: res.evaluationId,
                    releaseRecordId: releaseRecordId,
                    receiveRecordId: res.receiveRecordId,
                });
                that.setData({
                    avatar: res.avatar,
                    teamName: res.teamName,
                    text: text
                })
            },
            fail: function (err) {
                setTimeout(() => {
                    that.setData({
                        maskTrigger: false
                    })
                }, 500);
            }
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
                    demonstrateInfo: res,
                    maskTrigger: false
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
                        text = "分享已失效";
                        break;
                    case "FETCHED":
                        text = "继续作答";
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
                }
                _this.setData({
                    demonstrateInfo: res.demonstrateInfo,
                    evaluationStatus: msg,
                    evaluationStatusText: text,
                    receiveRecordId: receiveRecordId,
                    maskTrigger: false
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
        const {releaseRecordId,demonstrateInfo} = this.data;
        try {
            wx.uma.trackEvent('1602215501397', {name: demonstrateInfo.evaluationName})
        } catch (e) {

        }
        wx.navigateTo({
            url: `/pages/recorder/recorder?releaseRecordId=${releaseRecordId}`
        });
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
        app.getAccessToken(e).then(res => {
            this.goToRecorder()
        }).catch(err=>{
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
});
