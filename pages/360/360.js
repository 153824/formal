const app = getApp()
Page({
    data: {
        liner: 'transparent',
        title: '',
        fbEId: '',
        evaluationInfo: {
            evaluationName: "无标题问卷",
            status: 'UNCLAIMED',
            reviewerName: ''
        },
        userInfo: app.globalData.userInfo || wx.getStorageSync('userInfo'),
        disabled: false,
        surveyId: '',
        smsCode: ''
    },
    onLoad: function (options) {
        const smsCode = options.surveyId || options.smsCode;
        if (!app.globalData.userInfo && !wx.getStorageSync('userInfo')) {
            app.checkUserInfo = userInfo => {
                this.loadTemptation(smsCode, userInfo);
                this.setData({
                    userInfo: userInfo
                });
            };
        } else {
            const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
            this.loadTemptation(smsCode, userInfo);
            this.setData({
                userInfo: userInfo
            });
        }
        this.setData({
            smsCode: smsCode
        });
    },
    onShow() {
        const {smsCode} = this.data;
        if (app.globalData.userInfo && smsCode) {
            const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
            this.loadTemptation(smsCode, userInfo);
        }
    },
    getTemptation(id, data) {
        let {smsCode, userInfo} = this.data;
        if (!smsCode && id) {
            smsCode = id
        }
        console.log("feedbackEvaluationId, userInfo: ", (smsCode, userInfo));
        const temptation = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/360/fetch/${smsCode}/temptation`,
                method: 'GET',
                data: {
                    userId: userInfo.id
                },
                success(res) {
                    resolve(res)
                },
                error(err) {
                    reject(err)
                }
            })
        });
        return temptation;
    },
    checkEvaluationStatus() {
        return this.getTemptation
        ().then(res => {
            return new Promise((resolve, reject) => {
                switch (res.status) {
                    case 'UNAVAILABLE':
                        reject();
                        app.toast('测评已失效');
                        break;
                    case 'FINISHED':
                        reject();
                        app.toast('测评已完成');
                        break;
                    case 'UNCLAIMED':
                        resolve();
                        app.toast('测评可用');
                        break;
                    case 'FETCHED':
                        resolve();
                        app.toast('测评已领取');
                        break;
                    case 'IMPOSTOR':
                        reject();
                        app.toast('测评已被别人领取');
                        break;
                }
            })
        }).catch(err => {
            return new Promise((resolve, reject) => {
                reject(err)
            })
        })
    },
    loadTemptation(id, data) {
        let {smsCode} = this.data;
        if (!id) {
            id = smsCode
        }
        const temptation = this.getTemptation(id, data);
        temptation.then(res => {
            const {status, feedbackEvaluationId, evaluationName, surveyId} = res;
            const surveyInfo = {
                name: evaluationName,
                fbEId: feedbackEvaluationId,
                surveyId: surveyId
            };
            console.log(surveyInfo);
            switch (status) {
                case 'UNAVAILABLE':
                    app.toast('评估已失效');
                    break;
                case 'FINISHED':
                    this.goToDone();
                    app.toast('测评已完成');
                    break;
                case 'UNCLAIMED':
                    app.toast('测评可用');
                    break;
                case 'FETCHED':
                    this.goToReady(surveyInfo)
                    app.toast('测评已领取');
                    break;
                case 'IMPOSTOR':
                    app.toast('测评已被别人领取');
                    break;
            }
            this.setData({
                evaluationInfo: res,
                surveyId: surveyId,
                fbEId: feedbackEvaluationId,
            })
        }).catch(err => {
            console.error(err)
        })
    },
    wxAuthLogin(e) {
        const {surveyId, evaluationInfo, fbEId} = this.data;
        const surveyInfo = {
            name: evaluationInfo.evaluationName,
            fbEId: fbEId,
            surveyId: surveyId,
        };
        this.checkEvaluationStatus().then(res => {
            return app.updateUserMobileByWeWork(e);
        }).then(res => {
            return this.verify();
        }).then(res => {
            if (surveyId) {
                this.goToReady(surveyInfo)
            }
        }).catch(err => {
            switch (err.message) {
                case 'FETCHED':
                    this.goToReady(surveyInfo);
                    break;
                case 'UNAVAILABLE':
                    app.toast("测评已失效，请联系管理员");
                    this.setData({
                        disabled: true
                    });
                    break;
                case 'MISMATCHED':
                    app.toast("手机号码不匹配，请联系管理员");
                    this.setData({
                        disabled: true
                    });
                    break;
            }
            console.error(err, "领取测评失败！");
        });
    },
    verify(data) {
        const {surveyId, userInfo} = this.data;
        console.log(surveyId)
        const verify = new Promise((resolve, reject) => {
            app.doAjax({
                url: 'wework/evaluations/360/fetch/verify',
                method: 'POST',
                data: {
                    surveyId: surveyId,
                    userId: userInfo.id
                },
                success(res) {
                    switch (res.message) {
                        case 'SUCCESS':
                            resolve(res);
                            break;
                        case 'MISMATCHED':
                            reject(res);
                            break;
                        case 'UNAVAILABLE':
                            reject(res);
                            break;
                        case 'FETCHED':
                            reject(res);
                            break;
                    }
                },
                error(err) {
                    reject(err)
                }
            })
        });
        return verify
    },
    goToDone() {
        wx.navigateTo({
            url: "/pages/work-base/components/done/done"
        })
    },
    goToReady(surveyInfo) {
        wx.navigateTo({
            url: `/pages/360/subpages/ready/ready?surveyInfo=${JSON.stringify(surveyInfo)}`
        });
    }
});
