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
        smsCode: '',
        authCodeCounter: 0,
    },
    onLoad: function (options) {
        const smsCode = options.surveyId || options.smsCode;
        this.getBaseInfo(smsCode)
        if(app.checkAccessToken()){
            this.loadTemptation(smsCode)
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
    getTemptation(id) {
        let {smsCode, userInfo} = this.data;
        if (!smsCode && id) {
            smsCode = id
        }
        const temptation = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/360/fetch/${smsCode}/temptation`,
                method: 'GET',
                data: {
                    userId: userInfo.userId
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
    getBaseInfo(smsCode) {
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/360/fetch/${smsCode}/info`,
                method: 'GET',
                data: {
                    smsCode,
                },
                success(res) {
                    resolve(res)
                },
                error(err) {
                    reject(err)
                }
            })
        });
        p.then(res=>{
            this.setData({
                evaluationInfo: Object.assign({},this.data.evaluationInfo,res),
                fbEId: res.feedbackEvaluationId,
            })
        })
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
    loadTemptation(id) {
        let {smsCode} = this.data;
        if (!id) {
            id = smsCode
        }
        const temptation = this.getTemptation(id);

        return temptation.then(res => {
            const {status, feedbackEvaluationId, evaluationName, surveyId} = res;
            const surveyInfo = {
                name: evaluationName,
                fbEId: feedbackEvaluationId,
                surveyId: surveyId
            };
            this.setData({
                evaluationInfo: res,
                surveyId: surveyId,
                fbEId: feedbackEvaluationId,
            });
            switch (status) {
                case 'UNAVAILABLE':
                    app.toast('评估已失效');
                    return Promise.reject();
                case 'FINISHED':
                    this.goToDone();
                    app.toast('测评已完成');
                    return Promise.reject();
                case 'UNCLAIMED':
                    app.toast('测评可用');
                    return Promise.resolve();
                case 'FETCHED':
                    this.goToReady(surveyInfo);
                    app.toast('测评已领取');
                    return Promise.reject();
                case 'IMPOSTOR':
                    app.toast('测评已被别人领取');
                    return Promise.reject();
                    break;
            }
        }).catch(err => {
            console.error(err)
            return Promise.reject();
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
        const verify = new Promise((resolve, reject) => {
            app.doAjax({
                url: 'wework/evaluations/360/fetch/verify',
                method: 'POST',
                data: {
                    surveyId: surveyId,
                    userId: userInfo.userId
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
    },
    getAccessToken(e) {
        const that = this;
        let {authCodeCounter} = this.data;
        if(authCodeCounter > 5){
            return;
        }
        app.getAccessToken(e).then(res=>{
            return this.loadTemptation()
        }).then(res=>{
            return this.wxAuthLogin(e)
        }).catch(err=>{
            if(err && err.code === '401111'){
                app.prueLogin().then(res=>{
                    this.getAccessToken(e)
                });
                that.setData({
                    authCodeCounter: authCodeCounter++
                })
            }
        })
    }
});
