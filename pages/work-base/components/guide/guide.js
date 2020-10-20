// test/guide.js
const app = getApp();
var isHasApplyFor = false;
Page({
    data: {
        hasUserInfo: false,
        isTest: false,
        maskTrigger: true
    },
    onLoad: function (option) {
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
                id: option.releaseRecordId || releaseEvaluationId,
                receiveRecordId: option.receiveRecordId || ""
            });
        }
    },
    onShow: function () {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
        const that = this;
        const id = that.data.id;
        if (app.isTest && !id) {
            return that.getPaperMsg()
        }
        if (!app.globalData.userInfo && !wx.getStorageSync("userInfo")) {
            app.checkUserInfo = (userInfo) => {
                that.fetchEvaluation(userInfo);
            }
        } else {
            that.fetchEvaluation();
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
                that.setData({
                    hasUserInfo: hasUserInfo,
                    status: params.status,
                    isTest: app.isTest,
                    userInfo: params.userInfo,
                    draftAnswer: params.draftAnswer,
                    reportPermit: params.reportPermit,
                    id: params.id || "",
                    evaluationId: params.evaluationId || "",
                    evaluationList: res,
                    msg: params.msg,
                    receiveRecordId: params.receiveRecordId
                });
            }
        });
    },

    goToReplying: function (e) {
        var that = this;
        var draftAnswer = that.data.draftAnswer;
        var applyStatus = that.data.applyStatus;
        var userData = e.detail.userInfo;
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
                    if (0 === res.code) {
                        app.globalData.userInfo = Object.assign(globalData, userData);
                        wx.setStorageSync("userInfo", Object.assign(globalData, userData));
                        wx.setStorageSync("USER_DETAIL", Object.assign(globalData, userData));
                        wx.setStorageSync("openId", userData.openid);
                        if (draftAnswer) {
                            var sKey = "oldAnswer" + that.data.id;
                            wx.setStorageSync(sKey, draftAnswer);
                            wx.redirectTo({
                                url: '../answering/answering?pid=' + that.data.evaluationId + '&id=' + that.data.id + '&receiveRecordId=' + that.data.receiveRecordId + "&reportPermit=" + that.data.reportPermit + "&status=" + that.data.status,
                                success: res => {
                                    app.otherPageReLaunchTrigger = false;
                                }
                            })
                            return;
                        } else {
                            wx.redirectTo({
                                url: '../answering/answering?pid=' + that.data.evaluationId + '&id=' + that.data.id + '&receiveRecordId=' + that.data.receiveRecordId + "&reportPermit=" + that.data.reportPermit + "&status=" + that.data.status,
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
            var sKey = "oldAnswer" + that.data.id;
            wx.setStorageSync(sKey, draftAnswer);
            wx.redirectTo({
                url: '../answering/answering?pid=' + that.data.evaluationId + '&id=' + that.data.id + '&receiveRecordId=' + that.data.receiveRecordId + "&reportPermit=" + that.data.reportPermit + "&status=" + that.data.status
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
        const id = that.data.id;
        console.log("userInfo: ",userInfo);
        if(!userInfo){
            userInfo = {
                id: ""
            };
        }
        console.log('this.data: ',this.data)
        app.doAjax({
            url: "release/fetch",
            method: "post",
            noLoading: true,
            data: {
                releaseRecordId: id,
                userId: userInfo.id
            },
            success: function (res) {
                let text = "";
                res.receiveRecordId = "";
                res.msg = 'qualification needed';
                if (!res.receiveRecordId && res.msg !== 'qualification needed') {
                    app.toast("该分享已失效！");
                    wx.navigateTo({
                        url: "/pages/work-base/work-base"
                    });
                    return;
                }else if(!res.receiveRecordId && res.msg === 'qualification needed'){
                    app.toast("您将被带往用户信息验证页面");
                    wx.redirectTo({
                        url: `/pages/work-base/components/answering/answering?verify=true&releaseRecordId=${id}`
                    });
                    return;
                }
                const sKey = "oldAnswer" + id;
                const oldData = wx.getStorageSync(sKey);
                that.setData({
                    reportPermit: res.reportPermit
                });
                setTimeout(()=>{
                    that.setData({
                        maskTrigger: false
                    })
                },500);
                if (oldData && res.status !== 'FINISHED') {
                    setTimeout(() => {
                        wx.redirectTo({
                            url: '../answering/answering?pid=' + res.evaluationId + '&id=' + id + '&receiveRecordId=' + res.receiveRecordId + "&reportPermit=" + res.reportPermit + "&status=" + res.status
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
                        break;
                    case 'qualification needed':
                        text = "立即验证";
                        break;
                }
                that.getPaperMsg({
                    status: res.status,
                    reportPermit: res.reportPermit,
                    draftAnswer: res.draft,
                    evaluationId: res.evaluationId,
                    userInfo: res.participantInfo,
                    id: id,
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
                setTimeout(()=>{
                    that.setData({
                        maskTrigger: false
                    })
                },500);
            }
        });
    }
});
