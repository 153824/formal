// store/charge/charge.js
//测评详情界面
var app = getApp();
var isFirstLoad = true;
Page({
    data: {
        teamRole: app.teamRole,
        isIos: false,
        payTrigger: false,
        count: 1,
        name: "",
        getPhoneNum: true,
        loading: true,
        mobile: "18559297592",
        wechat: "haola72",
        getInOnceAgainst: false,
        subscribe: false,
        giftTrigger: false,
        buyByCounts: true,
        buyByTicket: false,
        ticketCount: 1,
        assistant: app.globalData.assistant,
        isPC: false,
        statusbarHeight: app.globalData.statusbarHeight,
        titleHeight: app.globalData.titleHeight,
        windowHeight: app.globalData.windowHeight,
        evaluation: {},
        evaluationVoucherInfo: {},
        currAnsweringStatus: false,
        releaseInfo: {},
        experienceTicket: 0,
        officialTicket: 0,
        certificateTicket: 0,
        shareTicket: 0,
        deprecatedTicket: 0
    },

    onLoad: function (options) {
        var that = this;
        var {resubscribe = 'false'} = options;
        var userData = app.globalData.userInfo || wx.getStorageSync("userInfo");
        var isGetInAgainst = wx.getStorageSync('isGetInAgainst') || 'NO';
        this.setData({
            isIos: app.isIos,
            teamRole: app.teamRole,
            userData: userData,
            evaluationId: options.id,
            getPhoneNum: true,
            resubscribe: resubscribe === 'true' ? true : false,
            isGetInAgainst,
            isPC: app.isPC
        });
        if (app.isLogin) return;
        app.checkUser = function () {
            that.onShow();
            app.checkUser = null;
        };
    },
    onShow: function () {
        const that = this;
        const isBindPhone = wx.getStorageSync("USER_DETAIL").phone ? true : false;
        this.setData({
            isBindPhone: isBindPhone
        });
        if (app.isLogin) {
            const teamDetailPromise = new Promise((resolve, reject) => {
                app.doAjax({
                    url: "myTeamDetail",
                    method: "get",
                    data: {
                        id: app.teamId
                    },
                    noLoading: true,
                    success: function (ret) {
                        that.setData({
                            teamAdminUser: ret.adminUser.nickname
                        });
                        resolve('success');
                    },
                    fail: function (err) {
                        reject('fail');
                    }
                });
            });
            const evaluationDetailPromise = new Promise((resolve, reject) => {
                app.doAjax({
                    url: 'evaluations/outline',
                    method: 'get',
                    data: {
                        evaluationId: that.data.evaluationId
                    },
                    noLoading: true,
                    success: function (res) {
                        let evaluation = res;
                        let {id, name, freeEvaluation} = evaluation;
                        if (freeEvaluation) {
                            // 	访问免费测评
                            try {
                                wx.uma.trackEvent('1602211030236', {name: name})
                            } catch (e) {

                            }
                        } else {
                            // 	访问付费测评
                            try {
                                wx.uma.trackEvent('1602211124861', {name: name})
                            } catch (e) {

                            }
                        }
                        // 访问测评详情
                        try {
                            wx.uma.trackEvent('1602210780126', {name: name})
                        } catch (e) {

                        }
                        that.setData({
                            evaluation,
                        });
                        if (evaluation.freeEvaluation) {
                        } else {
                        }
                        resolve("success");
                    },
                    fail: function (err) {
                        reject("fail");
                    }
                });
            });
            const evaluationVoucherPromise = new Promise(((resolve, reject) => {
                app.doAjax({
                    url: `inventories/${that.data.evaluationId}`,
                    method: "get",
                    success: function (res) {
                        const evaluationVoucherInfo = res;
                        let hasVoucher = true,
                            voucher = 0,
                            {voucherInfo} = evaluationVoucherInfo,
                            isFreeTicket = false,
                            shareTicket = 0,
                            experienceTicket = 0,
                            officialTicket = 0,
                            deprecatedTicket = 0,
                            certificateTicket = 0;
                        let {id, name} = that.data.evaluation;
                        if (Object.keys(voucherInfo).length <= 0) {
                            hasVoucher = false;
                        } else {
                            for (let i in voucherInfo) {
                                voucher += voucherInfo[i];
                                if (i === 'BEGINNER') {
                                    officialTicket = voucherInfo[i];
                                } else if (i === ' EXCLUSIVE') {
                                    shareTicket = voucherInfo[i];
                                } else if (i === 'GIFT') {
                                    experienceTicket = voucherInfo[i];
                                } else if (i === 'CERTIFICATE') {
                                    certificateTicket = voucherInfo[i];
                                } else if (i === 'DEPRECATED') {
                                    deprecatedTicket = voucherInfo[i];
                                }
                                if (i === ' EXCLUSIVE' || i === 'GIFT') {
                                    isFreeTicket = true;
                                }
                            }
                        }
                        that.setData({
                            evaluationVoucherInfo,
                            hasVoucher,
                            voucher,
                            officialTicket,
                            shareTicket,
                            experienceTicket,
                            certificateTicket,
                            deprecatedTicket
                        });
                        resolve("success");
                    }
                })
            }));
            Promise.all([teamDetailPromise, evaluationDetailPromise, evaluationVoucherPromise]).then(values => {
                setTimeout(() => {
                    this.setData({
                        loading: false,
                    })
                }, 500)
            }).catch(err => {
                this.setData({
                    loading: false,
                })
            });
        }
    },
    onUnload: function () {
        try {
            const {isBeginner, hadShare} = this.data.evaluation;
            if (!isBeginner && !hadShare) {
                this.setData({
                    isGetInAgainst: 'NO'
                });
                wx.setStorage({
                    key: 'isGetInAgainst',
                    data: 'YES'
                })
            }
        } catch (e) {

        }
    },
    toGetPaperDetail: function () {
        const that = this;
        const {evaluation} = this.data;
        const getEvaluationPromise = new Promise(((resolve, reject) => {
            app.doAjax({
                url: `inventories/${that.data.evaluationId}`,
                method: "get",
                success: function (res) {
                    const evaluationVoucherInfo = res;
                    let hasVoucher = true,
                        voucher = 0,
                        {voucherInfo} = evaluationVoucherInfo,
                        isFreeTicket = false,
                        shareTicket = 0,
                        experienceTicket = 0,
                        officialTicket = 0,
                        deprecatedTicket = 0,
                        certificateTicket = 0;
                    let {id, name} = that.data.evaluation;
                    if (Object.keys(voucherInfo).length <= 0) {
                        hasVoucher = false;
                    } else {
                        for (let i in voucherInfo) {
                            voucher += voucherInfo[i];
                            if (i === 'BEGINNER') {
                                officialTicket = voucherInfo[i];
                            } else if (i === ' EXCLUSIVE') {
                                shareTicket = voucherInfo[i];
                            } else if (i === 'GIFT') {
                                experienceTicket = voucherInfo[i];
                            } else if (i === 'CERTIFICATE') {
                                certificateTicket = voucherInfo[i];
                            } else if (i === 'DEPRECATED') {
                                deprecatedTicket = voucherInfo[i];
                            }
                            if (i === ' EXCLUSIVE' || i === 'GIFT') {
                                isFreeTicket = true;
                            }
                        }
                    }
                    that.setData({
                        evaluationVoucherInfo,
                        hasVoucher,
                        voucher,
                        officialTicket,
                        shareTicket,
                        experienceTicket,
                        certificateTicket,
                        deprecatedTicket,
                        payTrigger: false
                    });
                    resolve("success");
                },
                fail: function () {
                    reject("fail");
                }
            })
        })).then(res => {
            // do nothing
        });
    },

    changePrice: function (e) {
        this.setData({
            count: e.detail.value * 1
        })
    },

    payForEvaluation: function () {
        const {evaluation} = this.data;
        this.setData({
            payTrigger: true
        });
        try {
            wx.uma.trackEvent('1602213155213',{name: evaluation.name,})
        } catch (e) {

        }
    },

    cancelPayForEvaluation: function (e) {
        this.setData({
            payTrigger: false,
        })
    },
    /**
     * 用券购买测评
     */
    useticket: function () {
        var that = this;
        var {ticketCount, voucher, evaluation} = this.data;
        if (!ticketCount) return wx.showToast({
            title: '购买数量不能为空',
            icon: 'none',
            duration: 1200
        });
        var maxCount = voucher;
        if (ticketCount > maxCount) return wx.showToast({
            title: '券数量不足，无法购买',
            icon: 'none',
            duration: 1200
        });
        app.doAjax({
            url: "exchangeByVoucher",
            method: "post",
            data: {
                evaluationId: evaluation.id,
                count: ticketCount,
            },
            success: function (res) {
                wx.showToast({
                    title: '兑换成功',
                });
                that.setData({
                    buyByTicket: false
                });
                setTimeout(function () {
                    that.toGetPaperDetail(true);
                }, 500);
            }
        });
    },
    /** 体验测评 */
    goToReplyingGuide: function (e) {
        const that = this;
        const {evaluation} = this.data;
        const {name, answering, id} = e.currentTarget.dataset;
        app.doAjax({
            url: 'release/self',
            method: 'post',
            data: {
                evaluationInfo: {
                    evaluationId: evaluation.id,
                    normId: evaluation.generalNorms[0].normId,
                    freeEvaluation: evaluation.freeEvaluation,
                    evaluationName: evaluation.name,
                    quesCount: evaluation.quesCount,
                    estimatedTime: evaluation.estimatedTime
                }
            },
            success: function (res) {
                that.setData({
                    releaseInfo: res
                });
                const replyingURL = `/pages/replying/replying?evaluationId=${evaluation.id}&receiveRecordId=${res.receiveRecordId}`;
                const guideURL = `/pages/replying/components/guide/guide?evaluationId=${evaluation.id}&receiveRecordId=${res.receiveRecordId}`;
                console.log("goToReplyingGuide: ",res);
                if (res.unfinished) {
                    const sKey = "oldAnswer" + res.receiveRecordId;
                    let oldData = wx.getStorageSync(sKey);
                    if (!oldData && res.draft instanceof Object) {
                        oldData = wx.setStorageSync(sKey, res.draft);
                    }
                    if (oldData) {
                        wx.navigateTo({
                            url: replyingURL
                        });
                        return;
                    }
                    wx.navigateTo({
                        url: replyingURL
                    });
                } else {
                    wx.navigateTo({
                        url: guideURL
                    });
                }
            }
        });
    },

    /**购买数量+1 */
    addcount: function () {
        this.setData({
            count: this.data.count + 1
        });
    },
    /**购买数量-1 */
    jiancount: function () {
        if (this.data.count <= 1) {
            this.setData({
                count: 1
            });
        } else {
            this.setData({
                count: this.data.count - 1
            })
        }
    },
    /**
     * 按份购买测评
     */
    payByCounts: function () {
        var that = this,
            {count, evaluation} = this.data;
        if (count !== 0) {
            app.doAjax({
                url: "buyPaper",
                method: "post",
                data: {
                    id: evaluation.id,
                    count: that.data.count,
                    type: 1,
                    openid: wx.getStorageSync("openId") || app.globalData.userMsg.openid
                },
                success: function (res) {
                    wx.requestPayment({
                        appId: res.appId,
                        timeStamp: res.timeStamp,
                        nonceStr: res.nonceStr,
                        package: res.package,
                        signType: 'MD5',
                        paySign: res.paySign,
                        success: function (res) {
                            wx.showToast({
                                title: '购买成功',
                                duration: 2000
                            });
                            setTimeout(function () {
                                that.toGetPaperDetail();
                            }, 500);
                            //这里完成跳转
                        },
                        fail: function (res) {
                            if (res.errMsg == "requestPayment:fail cancel") {
                                wx.showToast({
                                    title: '购买取消',
                                    icon: 'none',
                                    duration: 1200
                                })
                            } else {
                                wx.showToast({
                                    title: '购买失败',
                                    icon: 'none',
                                    duration: 1200
                                })
                            }
                            //支付失败
                            console.error(res);
                        },
                        complete: function (res) {
                        }
                    })
                }
            })
        }
    },
    /**
     * 按买断购买测评
     */
    payByBuyout: function () {
        var that = this;
        var {evaluation} = this.data;
        var dayOfPeriod = 365;
        try {
            dayOfPeriod = evaluation.buyoutPlans[0].dayOfPeriod
        } catch (e) {

        }
        app.doAjax({
            url: 'buyout',
            method: 'post',
            data: {
                evaluationId: evaluation.id,
                evaluationName: evaluation.evaluationName,
                dayOfPeriod: dayOfPeriod,
                openid: wx.getStorageSync("openId") || app.globalData.userMsg.openid,
            },
            success: function (res) {
                wx.requestPayment({
                    appId: res.appId,
                    timeStamp: res.timeStamp,
                    nonceStr: res.nonceStr,
                    package: res.package,
                    signType: 'MD5',
                    paySign: res.paySign,
                    success: function (res) {
                        wx.showToast({
                            title: '购买成功',
                            duration: 2000
                        });
                        setTimeout(function () {
                            that.toGetPaperDetail();
                        }, 500);
                        that.setData({
                            buyByTicket: false
                        });
                    },
                    fail: function (res) {
                        if (res.errMsg === "requestPayment:fail cancel") {
                            wx.showToast({
                                title: '购买取消',
                                icon: 'none',
                                duration: 1200
                            })
                        } else {
                            wx.showToast({
                                title: '购买失败',
                                icon: 'none',
                                duration: 1200
                            })
                        }
                        that.setData({
                            buyByTicket: false
                        });
                    },
                    complete: function (res) {
                        that.setData({
                            buyByTicket: false
                        });
                    }
                })
            }
        });
    },

    goToDaTi: function () {
        //发放测评
        const that = this;
        const {evaluation, evaluationVoucherInfo} = this.data;
        const {availableCount, buyoutInfo} = evaluationVoucherInfo;
        if (((availableCount || 0) === 0 && !evaluation.freeEvaluation) && !buyoutInfo.hadBuyout) {
            app.toast("测评可用数量不足，请先购买或用券兑换测评");
            return;
        }
        const necessaryInfo = {
            id: evaluation.id,
            count: availableCount,
            name: evaluation.name,
            isFree: evaluation.freeEvaluation,
            hadBuyout: buyoutInfo.hadBuyout,
            norms: evaluation.generalNorms,
            quesCount: evaluation.quesCount,
            estimatedTime: evaluation.estimatedTime,

        };
        wx.navigateTo({
            url: `../sharePaper/sharePaper?necessaryInfo=${JSON.stringify(necessaryInfo)}`,
        });
        return;
    },
    /**
     * 查看大图
     */
    showBigImg: function (e) {
        var url = e.currentTarget.dataset.url;
        if (!url) return;
        wx.previewImage({
            urls: [url]
        });
    },
    /**
     * 用户授权
     */
    getUserInfo: function (e) {
        var that = this;
        var userInfo = e.detail.userInfo;
        if (!userInfo) return;
        userInfo["openid"] = wx.getStorageSync("openId") || app.globalData.userMsg.openid;
        // userInfo["unionid"] = wx.getStorageSync("unionId") || app.globalData.userMsg.unionid;
        app.doAjax({
            url: "updateUserMsg",
            method: "post",
            data: {
                data: JSON.stringify({
                    wxUserInfo: userInfo,
                    userCompany: {
                        name: userInfo.nickName + "的团队"
                    }
                }),
            },
            success: function (res) {
                app.globalData.userInfo.nickname = userInfo.nickName;
                app.addNewTeam(that.onShow);
            }
        });
        that.getNewerTicket();
    },
    /**
     * 用户手机号授权
     */
    checkUserMobile: function (e, cb) {
        var that = this;
        if (that.data.userData.phone) {
            return cb();
        }
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
                    app.getUserInfo();
                    cb && cb();
                }
            });
        }
    },
    /**
     * 复制微客服信号
     */
    copyIt: function (e) {
        var that = this;
        var txt = "haola72";
        wx.setClipboardData({
            data: txt,
            success(res) {

            }
        });
    },
    onShareAppMessage(options) {
        const evaluationInfo = this.data.evaluation;
        const {teamId} = app,
            {userInfo} = app.globalData,
            that = this;
        const {id, name} = this.data.evaluation;
        console.log("this.data.evaluation.id: ",id);
        if (options.from !== 'button') {
            return {
                title: `邀您体验《${evaluationInfo.name}》测评~`,
                path: `pages/station/components/detail/detail?id=${id}`,
                imageUrl: `${evaluationInfo.smallImg}`,
            }
        }
        app.doAjax({
            url: `drawVoucher?paperId=${id}`,
            success: function (res) {
                app.toast(res);
            },
            fail: function (err) {
                console.error(err);
            }
        });
        setTimeout(() => {
            wx.showModal({
                title: '',
                content: '领券成功，快去兑换测评吧',
                confirmText: '立即兑换',
                success(res) {
                    if (res.confirm) {
                        that.setData({
                            buyByTicket: true
                        })
                    }
                }
            });
        }, 2000);
        return {
            title: "我发现一个不错的人才测评软件，快来看看吧~",
            path: "pages/home/home",
            imageUrl: "http://ihola.luoke101.com/wxShareImg.png",
        }
    },
    /**继续体验 */
    continueTest: function (e) {
        var t = e.target.dataset.t;
        if (t == 2) {
            this.setData({
                oldShareInfo: ""
            });
            return;
        }
        var id = this.data.oldShareInfo.id;
        wx.navigateTo({
            url: '../test/guide?id=' + id
        });
    },
    getNewerTicket: function (e) {
        var that = this;
        var {name} = that.data.evaluation;
        app.doAjax({
            url: "drawNoviceVoucher",
            method: "post",
            data: {},
            success: function (ret) {
                app.getUserInfo(); //更新用户信息
                that.setData({
                    giftTrigger: true,
                });
            },
            error: function (res) {
                app.toast(res.msg);
            }
        });
        wx.uma.trackEvent('1602211291284', {name: name});
        that.onShow(false);
    },
    goToUserCenter: function () {
        wx.switchTab({
            url: "../user/index"
        })
    },
    /**关闭测评体验券*/
    closeGift: function () {
        this.setData({
            giftTrigger: false
        });
    },
    /**召唤测评体验券*/
    openGift: function () {
        this.setData({
            giftTrigger: true
        })
    },
    buyByCounts: function () {
        this.setData({
            buyByCounts: true
        })
    },
    servingTrigger: function () {
        this.selectComponent('#serving').callServing();
        this.setData({
            payTrigger: false
        })
    },
    buyByTicket: function () {
        this.setData({
            buyByTicket: true,
            payTrigger: false,
            giftTrigger: false
        })
    },
    cancelBuyByTicket: function () {
        this.setData({
            buyByTicket: false,
        })
    },
    subTicket: function () {
        var {ticketCount} = this.data;
        if (ticketCount <= 0) {
            ticketCount = 0;
        } else {
            ticketCount = ticketCount - 1;
        }
        this.setData({
            ticketCount
        })
    },
    addTicket: function () {
        var {voucher, ticketCount} = this.data;
        if (ticketCount >= voucher) {
            app.toast("最多只能兑换" + voucher + "份");
        } else {
            ticketCount = ticketCount + 1;
        }
        this.setData({
            ticketCount
        })
    },
    getPhoneNumber: function (e) {
        const that = this;
        const {mark, eventName} = e.currentTarget.dataset;
        const {iv, encryptedData} = e.detail;
        const {evaluation} = this.data;
        if (mark !== 'dont-get-ticket') {
            try {
                wx.uma.trackEvent('1602211711933', {name: evaluation.name});
            } catch (e) {

            }
        }
        if (mark === 'dont-get-ticket') {
            switch (eventName) {
                case 'goToDaTi':
                    try {
                        wx.uma.trackEvent('1602211801893', {name: evaluation.name});
                    } catch (e) {

                    }
                    break;
                case 'goToReplyingGuide':
                    try {
                        wx.uma.trackEvent('1602211853957', {name: evaluation.name});
                    } catch (e) {

                    }
                    break;
                case 'payForEvaluation':
                    try {
                        wx.uma.trackEvent('1602211886750', {name: evaluation.name});
                    } catch (e) {

                    }
                    break;
                default:
                    break;
            }
        }
        if (encryptedData) {
            //用户授权手机号
            var userMsg = app.globalData.userMsg || {};
            userMsg["iv"] = iv;
            userMsg["encryptedData"] = encryptedData;
            var updatedUserMobilePromise = new Promise(((resolve, reject) => {
                app.doAjax({
                    url: "updatedUserMobile",
                    data: userMsg,
                    success: function (res) {
                        resolve(true);
                    },
                    fail: function (err) {
                        reject(err);
                    }
                })
            }));
            updatedUserMobilePromise.then(() => {
                app.doAjax({
                    url: `wework/users/${app.globalData.userMsg.id || app.globalData.userInfo.id}`,
                    method: "get",
                    data: {
                        openid: wx.getStorageSync("openId"),
                    },
                    success: function (res) {
                        app.globalData.userInfo = Object.assign(app.globalData.userInfo, res);
                        wx.setStorageSync("userInfo", app.globalData.userInfo);
                        wx.setStorageSync("USER_DETAIL", app.globalData.userInfo);
                        if (res.phone && mark !== 'dont-get-ticket') {
                            that.getNewerTicket();
                            try {
                                wx.uma.trackEvent('1602211933140', {name: evaluation.name});
                            } catch (e) {

                            }
                        }
                        if (mark === 'dont-get-ticket') {
                            switch (eventName) {
                                case 'goToDaTi':
                                    try {
                                        wx.uma.trackEvent('1602212015300', {name: evaluation.name});
                                    } catch (e) {

                                    }
                                    that.goToDaTi(e);
                                    break;
                                case 'goToReplyingGuide':
                                    try {
                                        wx.uma.trackEvent('1602212048924', {name: evaluation.name});
                                    } catch (e) {

                                    }
                                    that.goToReplyingGuide(e);
                                    break;
                                case 'payForEvaluation':
                                    try {
                                        wx.uma.trackEvent('1602212078917', {name: evaluation.name});
                                    } catch (e) {

                                    }
                                    that.payForEvaluation();
                                    break;
                                default:
                                    break;
                            }
                        }
                        that.setData({
                            isBindPhone: true
                        })
                    }
                })
            });
        }
    },
    goToTransit: function (e) {
        const that = this;
        const {mark, eventName} = e.currentTarget.dataset;
        const {evaluation} = this.data;
        if (that.data.isBindPhone) {
            switch (eventName) {
                case 'goToDaTi':
                    wx.uma.trackEvent('1602212461556', {name: evaluation.name, isFree: evaluation.freeEvaluation});
                    that.goToDaTi(e);
                    break;
                case 'goToReplyingGuide':
                    wx.uma.trackEvent('1602212336204', {name: evaluation.name, isFree: evaluation.freeEvaluation});
                    that.goToReplyingGuide(e);
                    break;
            }
        }
    }
});
