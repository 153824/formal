const app = getApp()
Page({
    data: {
        liner: 'transparent',
        title: '',
        fbEId: '',
        evaluationInfo: {
            evaluationName: "无标题问卷",
            status: 'UNCLAIMED'
        },
        userInfo: app.globalData.userInfo || wx.getStorageSync('userInfo'),
        disabled: false
    },
    onLoad: function (options) {
        const feedbackEvaluationId = options.feedbackEvaluationId;
        console.log(feedbackEvaluationId);
        if (!app.globalData.userInfo && !wx.getStorageSync('userInfo')) {
            app.checkUserInfo = userInfo => {
                this.loadTemptation(feedbackEvaluationId, userInfo)
                this.setData({
                    userInfo: userInfo
                });
            };
        } else {
            const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
            this.loadTemptation(feedbackEvaluationId, userInfo)
            this.setData({
                userInfo: userInfo
            });
        }
        this.setData({
            fbEId: feedbackEvaluationId
        });
    },
    onShow() {
        const {fbEId} = this.data;
        if (app.globalData.userInfo && fbEId) {
            const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
            this.loadTemptation(fbEId, userInfo);
        }
    },
    getTemptation(id, data) {
        let {fbEId, userInfo} = this.data;
        if (!fbEId && id) {
            fbEId = id
        }
        console.log("feedbackEvaluationId, userInfo: ", (fbEId, userInfo));
        const temptation = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/360/fetch/${fbEId}/temptation`,
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
    checkEvaluation() {
        return this.getTemptation().then(res => {
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
                }
            })
        }).catch(err => {
            return new Promise((resolve, reject) => {
                reject(err)
            })
        })
    },
    loadTemptation(id, data) {
        let {fbEId} = this.data;
        if(!id){
            id = fbEId
        }
        const temptation = this.getTemptation(id, data)
        temptation.then(res => {
            const {status, surveyId, evaluationName} = res;
            const surveyInfo = {
                name: evaluationName,
                fbEId: fbEId || id,
                surveyId: surveyId || ""
            };
            switch (status) {
                case 'UNAVAILABLE':
                    app.toast('评估已失效');
                    break;
                case 'FINISHED':
                    this.done();
                    app.toast('测评已完成');
                    break;
                case 'UNCLAIMED':
                    app.toast('测评可用');
                    break;
                case 'FETCHED':
                    wx.navigateTo({
                        url: `/pages/360/subpages/ready/ready?surveyInfo=${JSON.stringify(surveyInfo)}`
                    });
                    app.toast('测评已领取');
                    break;
            }
            this.setData({
                evaluationInfo: res,
                surveyInfo: surveyInfo
            })
        }).catch(err => {
            console.error(err)
        })
    },
    wxAuthLogin(e) {
        const {surveyInfo} = this.data;
        this.checkEvaluation().then(res => {
            return app.updateUserMobile(e);
        }).then(res => {
            return this.verify();
        }).then(res => {
            const {surveyInfo} = this.data;
            console.log("verify: ", res);
            if (res.surveyId) {
                surveyInfo.surveyId = res.surveyId;
                wx.navigateTo({
                    url: `/pages/360/subpages/ready/ready?surveyInfo=${JSON.stringify(surveyInfo)}`
                });
            }
        }).catch(err => {
            switch (err.msg) {
                case 'already fetched':
                    wx.navigateTo({
                        url: `/pages/360/subpages/ready/ready?surveyInfo=${JSON.stringify(surveyInfo)}`
                    });
                    break;
                case 'UNAVAILABLE':
                    app.toast("测评已失效，请联系管理员");
                    this.setData({
                        disabled: true
                    });
                    break;
            }
            console.error(err, "领取测评失败！");
        });
    },
    verify(data) {
        const {fbEId, userInfo} = this.data;
        const verify = new Promise((resolve, reject) => {
            // reject({msg: 'UNAVAILABLE'})
            app.doAjax({
                url: 'wework/evaluations/360/fetch/verify',
                method: 'POST',
                data: {
                    feedbackEvaluationId: fbEId,
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
        return verify
    },
    done() {
        wx.navigateTo({
            url: "/pages/work-base/components/done/done"
        })
    }
});
