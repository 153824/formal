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
    },
    onLoad: function (options) {
        const surveyId = options.surveyId;
        if (!app.globalData.userInfo && !wx.getStorageSync('userInfo')) {
            app.checkUserInfo = userInfo => {
                this.loadTemptation(surveyId, userInfo)
                this.setData({
                    userInfo: userInfo
                });
            };
        } else {
            const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
            this.loadTemptation(surveyId, userInfo)
            this.setData({
                userInfo: userInfo
            });
        }
        this.setData({
            surveyId: surveyId
        });
    },
    onShow() {
        const {surveyId} = this.data;
        if (app.globalData.userInfo && surveyId) {
            const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
            this.loadTemptation(surveyId, userInfo);
        }
    },
    getTemptation(id, data) {
        let {surveyId, userInfo} = this.data;
        if (!surveyId && id) {
            surveyId = id
        }
        console.log("feedbackEvaluationId, userInfo: ", (surveyId, userInfo));
        const temptation = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/360/fetch/${surveyId}/temptation`,
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
        let {surveyId} = this.data;
        if (!id) {
            id = surveyId
        }
        const temptation = this.getTemptation(id, data)
        temptation.then(res => {
            const {status, feedbackEvaluationId, evaluationName} = res;
            const surveyInfo = {
                name: evaluationName,
                fbEId: feedbackEvaluationId,
                surveyId: surveyId || id
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
                evaluationInfo: res
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
            surveyId,
        }
        this.checkEvaluationStatus().then(res => {
            return app.updateUserMobile(e);
        }).then(res => {
            return this.verify();
        }).then(res => {
            if (surveyId) {
                this.goToReady(surveyInfo)
            }
        }).catch(err => {
            switch (err.message) {
                case 'FETCHED':
                    this.goToReady(surveyInfo)
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
