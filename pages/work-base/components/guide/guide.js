// test/guide.js
const app = getApp();
var isHasApplyFor = false;
Page({
    data: {
        hasUserInfo: false,
        isTest: false,
        maskTrigger: true,
        verified: false,
        isEmail: false,
        isSelf: "SHARE",
        receiveRecordId: "",
        evaluationStatus: "",
        demonstrateInfo: {},
        evaluationStatusText: ""
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
            console.log("option.releaseRecordId: ", option.releaseRecordId)
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
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
        const that = this;
        const {releaseRecordId} = that.data;
        if (app.isTest && !releaseRecordId) {
            return that.getPaperMsg()
        }
        if (!app.globalData.userInfo && !wx.getStorageSync("userInfo")) {
            app.checkUserInfo = (userInfo) => {
                that.fetchEvaluation(userInfo);
                that.getTemptation(userInfo);
                that.getParticipantInfo(userInfo.id);
            }
        } else {
            that.fetchEvaluation();
            that.getTemptation();
            that.getParticipantInfo();
        }

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
        var that = this;
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
                let hasUserInfo = false;
                const userInfo = wx.getStorageSync("userInfo");
                if (userInfo && userInfo.avatar || params.userInfo.hasParticipantInfo) {
                    hasUserInfo = true;
                }
                console.log("paperQues: ", res)
                that.setData({
                    hasUserInfo: hasUserInfo,
                    status: params.status,
                    isTest: app.isTest,
                    userInfo: params.userInfo,
                    draftAnswer: params.draftAnswer,
                    reportPermit: params.reportPermit,
                    releaseRecordId: params.releaseRecordId || "",
                    evaluationId: params.evaluationId || "",
                    evaluationList: res,
                    msg: params.msg,
                    receiveRecordId: params.receiveRecordId
                });
            }
        });
    },

    verifyUserInfo: function (e) {
        const {evaluationId, releaseRecordId, receiveRecordId, reportPermit, status, verified, isEmail} = this.data;
        const url = `/pages/work-base/components/answering/answering?pid=${evaluationId}&releaseRecordId=${releaseRecordId}&reportPermit=${reportPermit}&status=${status}&verify=true`;
        wx.redirectTo({
            url: url
        });
    },

    goToReplying: function (e) {
        const that = this;
        const {name1} = that.data.evaluationList.setting;
        const {mark = ""} = e.currentTarget.dataset;
        if (that.data.isSelf !== 'SHARE' && mark) {
            try {
                wx.uma.trackEvent('1602214318372', {name: name1})
            } catch (e) {
                console.error(e);
            }
        } else if (that.data.isSelf === 'SHARE' && mark) {
            try {
                wx.uma.trackEvent('1602215501397', {name: name1})
            } catch (e) {
                console.error(e);
            }
        }
        const {evaluationId, releaseRecordId, receiveRecordId, reportPermit, status, verified, isEmail} = this.data;
        const draftAnswer = that.data.draftAnswer;
        const userData = e.detail.userInfo;
        if (!userData && !that.data.hasUserInfo && !app.isTest) return;
        if (userData) {
            userData.openid = wx.getStorageSync("openId");
            app.doAjax({
                url: "updateUserMsg",
                method: "post",
                noLoading: true,
                data: {
                    data: JSON.stringify({
                        wxUserInfo: userData,
                        userCompany: {
                            name: userData.nickName + "的团队"
                        }
                    })
                },
                success: function (res) {
                    const userData = res.data;
                    const globalData = app.globalData.userInfo;
                    const url = `../answering/answering?pid=${evaluationId}&releaseRecordId=${releaseRecordId}&receiveRecordId=${receiveRecordId}&reportPermit=${reportPermit}&status=${status}`;
                    if (0 === res.code) {
                        app.globalData.userInfo = Object.assign(globalData, userData);
                        wx.setStorageSync("userInfo", Object.assign(globalData, userData));
                        wx.setStorageSync("USER_DETAIL", Object.assign(globalData, userData));
                        wx.setStorageSync("openId", userData.openid);
                        if (draftAnswer) {
                            const sKey = `oldAnswer${receiveRecordId}`;
                            wx.setStorageSync(sKey, draftAnswer);
                            wx.redirectTo({
                                url: url,
                                success: res => {
                                    app.otherPageReLaunchTrigger = false;
                                }
                            });
                            return;
                        } else {
                            wx.redirectTo({
                                url: url,
                                success: res => {
                                    app.otherPageReLaunchTrigger = false;
                                }
                            })
                        }
                        that.setData({
                            hasUserInfo: true,
                            isok: false
                        });
                    }
                }
            });
            return;
        }
        if (draftAnswer || !draftAnswer) {
            const sKey = `oldAnswer${receiveRecordId}`;
            let pathIndex = "";
            const url = `/pages/work-base/components/answering/answering?pid=${evaluationId}&releaseRecordId=${releaseRecordId}&receiveRecordId=${receiveRecordId}&reportPermit=${reportPermit}&status=${status}&pathIndex=${pathIndex}`;
            wx.setStorageSync(sKey, draftAnswer);
            wx.redirectTo({
                url: url
            });
            return;
        }
        this.setData({
            isok: false
        })
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
        console.log("userInfo: ", userInfo);
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
                    wx.setStorageSync(`${res.receiveRecordId}-st`, res.fetchedAt);
                    setTimeout(() => {
                        const url = `../answering/answering?pid=${evaluationId}&releaseRecordId=${releaseRecordId}&receiveRecordId=${receiveRecordId}&reportPermit=${reportPermit}&status=${status}`;
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
                        wx.setStorageSync(`${res.receiveRecordId}-st`, res.fetchedAt);
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
                        wx.switchTab({
                            url: "/pages/home/home"
                        })
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
                    userInfo: res.participantInfo,
                    releaseRecordId: releaseRecordId,
                    receiveRecordId: res.receiveRecordId,
                    triggerText: res.msg
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

    getTemptation: function (userInfo = {id: ""}) {
        const _this = this;
        console.log("userInfo: ", userInfo);
        const {releaseRecordId} = this.data;
        app.doAjax({
            url: "wework/evaluations/fetch/temptation",
            method: "post",
            data: {
                releaseRecordId: releaseRecordId,
                userId: userInfo.id
            },
            success: function (res) {
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
                    case "DISABLE":
                        text = "申请查看报告";
                        break;
                    case "VERIFY":
                        text = "立即验证";
                        break;
                    case "APPROVED":
                        text = "查看报告";
                        break;
                }
                _this.setData({
                    demonstrateInfo: res.demonstrateInfo,
                    evaluationStatus: msg,
                    evaluationStatusText: text,
                    receiveRecordId: receiveRecordId
                });
            }
        })
    },

    goToTransit: function () {
        const {evaluationStatus} = this.data;
        if(evaluationStatus){
            switch (evaluationStatus) {
                case 'UNCLAIMED':

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
                case "DISABLE":
                    text = "申请查看报告";
                    break;
                case "VERIFY":
                    text = "立即验证";
                    break;
                case "APPROVED":
                    text = "查看报告";
                    break;
            }
        }
    },

    getParticipantInfo: function (userId) {
        const {receiveRecordId=""} = this.data;
        if(!userId){
            console.log("app.globalData.userInfo: ",app.globalData.userInfo);
            userId = (wx.getStorageSync("userInfo")||app.globalData.userInfo||app.globalData.userMsg).id;
        }
        app.doAjax({
            url: `wework/evaluations/fetch/info/participant/${userId}`,
            method: "get",
            data: {
                receiveRecordId: receiveRecordId
            },
            success: function (res) {
                console.log("wework/evaluations/fetch/info/participant: ",res);
            }
        })
    }
});
