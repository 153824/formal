import {getEnv, getTag, Tracker, umaEvent} from "../../../../uma.config";

const app = getApp();
Page({
    data: {
        isIos: app.isIos,
        payTrigger: false,
        count: 1,
        name: "",
        loading: false,
        buyByCounts: true,
        assistant: app.globalData.assistant,
        isPC: app.isPC,
        iphonex: app.isIphoneX,
        statusbarHeight: app.globalData.statusbarHeight,
        titleHeight: app.globalData.titleHeight,
        windowHeight: app.globalData.windowHeight,
        evaluation: {},
        evaluationId: '',
        releaseInfo: {},
        customNorms: [],
        isGetAccessToken: app.checkAccessToken(),
        authCodeCounter: 0,
        availableVoucher: 0,
        availableInventory: 0,
        showSelectQuiz: false,
        buttonGroupHeight: 0
    },

    onLoad(options) {
        const that = this;
        const {scene} = wx.getLaunchOptionsSync();
        const umaConfig = umaEvent.evaluationDetail;
        this.loadEvaluationName(options.id).then(res=>{
            if (umaConfig.scene.includes(scene)) {
                try{
                    console.log({origin: umaConfig.origin.card, scene, name: res.name})
                    new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.card, scene, name: res.name});
                }
                catch (e) {
                    console.log('友盟数据统计',e);
                }
            }
        }).catch(e=>{
            console.log(e);
        })
        this.setData({evaluationId: options.id});
    },

    onShow() {
        const that = this;
        this.setData({
            isGetAccessToken: app.checkAccessToken()
        })
        this.loadEvaluationInfo()
            .then(res=>{
                this.setData({
                    evaluation: res
                })
            });
        if(app.checkAccessToken()) {
            this.loadInventory()
                .then(({availableVoucher, availableInventory})=>{
                    this.setData({
                        availableVoucher,
                        availableInventory
                    })
                });
        }
        let query = wx.createSelectorQuery();
        query.select('.button-group-wrapper').boundingClientRect(rect=>{
            console.log(rect);
            that.setData({
                buttonGroupHeight: rect.height
            })
        }).exec();
    },

    onCountChange(e) {
        this.setData({
            count: e.detail.value * 1
        })
    },

    loadEvaluationName(evaluationId) {
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                method: 'GET',
                url: `../wework/evaluations/${evaluationId}/info`,
                success(res) {
                    resolve(res)
                },
                error(e) {
                    reject(e)
                }
            })
        })
        return p
    },

    payForEvaluation: function () {
        const {evaluation} = this.data;
        this.setData({
            payTrigger: true
        });
    },

    cancelPayForEvaluation: function (e) {
        this.setData({
            payTrigger: false,
        })
    },

    goToGuide(e) {
        const that = this;
        const {evaluation} = this.data;
        this.loadReleaseSelf()
            .then(res=>{
                const answeringURL = `/pages/work-base/components/guide/guide?evaluationId=${evaluation.id}&receiveRecordId=${res.receiveRecordId}&type=self&releaseInfo=${JSON.stringify(res)}`;
                const sKey = "oldAnswer" + res.receiveRecordId;
                if (res.msg === 'RELAY') {
                    let oldData = wx.getStorageSync(sKey);
                    if (!oldData && res.draft instanceof Object) {
                        wx.setStorageSync(sKey, res.draft);
                    }
                }
                that.setData({
                    releaseInfo: res
                });
                wx.navigateTo({
                    url: answeringURL
                });
            })
        const umaConfig = umaEvent.clickSelfOffer;
        try{
            new Tracker(wx).generate(umaConfig.tag, {name: `${evaluation.name}`});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
    },

    addcount() {
        this.setData({
            count: this.data.count + 1
        });
    },

    subcount() {
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

    payByCounts() {
        const that = this,
            {count, evaluation} = this.data;
        if (count !== 0) {
            app.doAjax({
                url: "buyPaper",
                method: "post",
                data: {
                    id: evaluation.id,
                    count: that.data.count,
                    type: 1,
                    openid: wx.getStorageSync("userInfo").openid
                },
                success(res) {
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
                                that.onShow();
                            }, 500);
                        },
                        fail(res) {
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

    goToDaTi() {
        //发放测评
        const {evaluation, customNorms, availableVoucher, availableInventory} = this.data;
        const umaConfig = umaEvent.clickShareOffer;
        try{
            new Tracker(wx).generate(umaConfig.tag, {name: `${evaluation.name}`});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
        if (availableVoucher <= 0 && availableInventory <= 0) {
            app.toast("测评可用数量不足，请先购买测评");
            return;
        }
        const necessaryInfo = {
            id: evaluation.id,
            count: availableVoucher + availableInventory,
            availableVoucher,
            availableInventory,
            name: evaluation.name,
            isFree: evaluation.freeEvaluation,
            norms: customNorms.length ? customNorms : evaluation.generalNorms,
            quesCount: evaluation.quesCount,
            estimatedTime: evaluation.estimatedTime,
            useVoucher: true
        };
        wx.navigateTo({
            url: `../sharePaper/sharePaper?necessaryInfo=${JSON.stringify(necessaryInfo)}`,
        });
    },

    showBigImg(e) {
        var url = e.currentTarget.dataset.url;
        if (!url) return;
        wx.previewImage({
            urls: [url]
        });
    },

    onShareAppMessage(options) {
        const evaluationInfo = this.data.evaluation;
        const {teamId} = app,
            {userInfo} = app.globalData,
            that = this;
        const {id, name} = this.data.evaluation;
        if (options.from !== 'button') {
            return {
                title: `邀您体验《${evaluationInfo.name}》测评~`,
                path: `pages/station/components/detail/detail?id=${id}`,
                imageUrl: `${evaluationInfo.smallImg}`,
            }
        }
        return {
            title: "我发现一个不错的人才测评软件，快来看看吧~",
            path: "pages/home/home",
            imageUrl: "http://ihola.luoke101.com/wxShareImg.png",
        }
    },

    showSelectQuiz(e) {
        const {type} = e.currentTarget.dataset;
        this.setData({
            showSelectQuiz: true
        })
        if(type === 'enjoy'){
            const umaConfig = umaEvent.clickFreeEnjoy;
            try{
                new Tracker(wx).generate(umaConfig.tag);
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
        if(type === 'using'){
            const umaConfig = umaEvent.clickUsingRightNow;
            try{
                new Tracker(wx).generate(umaConfig.tag);
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
    },

    hideSelectQuiz() {
        this.setData({
            showSelectQuiz: false
        })
    },

    goToCustomerService() {
        try{
            const umaConfig = umaEvent.customerService;
            new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.evaluation});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
        wx.navigateTo({
            url: "/pages/customer-service/customer-service"
        });
    },

    buyByCounts() {
        this.setData({
            buyByCounts: true
        })
    },

    authPhoneNumber(e) {
        // enjoy-体验测评 contact-联系客服
        const that = this;
        const {type} = e.currentTarget.dataset;
        let {authCodeCounter, isIos} = this.data;
        if (authCodeCounter > 5) {
            return;
        }
        if(authCodeCounter < 1){
            const umaConfig = umaEvent.authPhoneDialog;
            try{
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin[type]});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
        app.getAccessToken(e)
            .then(res => {
                const umaConfig = umaEvent.authPhoneSuccess;
                if(type === 'enjoy'){
                    try{
                        new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.experience});
                    }
                    catch (e) {
                        console.log('友盟数据统计',e);
                    }
                    try{
                        const umaConfig = umaEvent.clickFreeEnjoy;
                        new Tracker(wx).generate(umaConfig.tag);
                    }
                    catch (e) {
                        console.log('友盟数据统计',e);
                    }
                }
                else if(type === 'contact' && !isIos){
                    try{
                        new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.pay});
                    }
                    catch (e) {
                        console.log('友盟数据统计',e);
                    }
                }
                else if (type === 'contact' && isIos){
                    try{
                        new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.contact});
                    }
                    catch (e) {
                        console.log('友盟数据统计',e);
                    }
                }
                return that.loadInventory();
            })
            .then(res => {
                const {availableVoucher, availableInventory} = res;
                if (type === 'enjoy') {
                    if (availableVoucher <= 0) {
                        app.toast('您的免费体验券已用完');
                    }
                    if (availableVoucher > 0) {
                        that.setData({
                            showSelectQuiz: true
                        })
                    }
                }
                if (type === 'contact') {
                    if (isIos) {
                        wx.navigateTo({
                            url: "/pages/customer-service/customer-service"
                        })
                    } else {
                        that.setData({
                            payTrigger: true
                        })
                    }
                }
                that.setData({
                    availableVoucher,
                    availableInventory
                });
            })
            .catch(err => {
                if (err.code === '401111') {
                    app.prueLogin().then(res => {
                        this.authPhoneNumber(e)
                    });
                    that.setData({
                        authCodeCounter: authCodeCounter++
                    })
                }
            })
            if(authCodeCounter <= 0){
                const umaConfig = umaEvent.authPhoneCount;
                if(type === 'enjoy'){
                    try{
                        new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.experience});
                    }
                    catch (e) {
                        console.log('友盟数据统计',e);
                    }
                }
                else if (type === 'contact' && !isIos) {
                    try{
                        new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.pay});
                    }
                    catch (e) {
                        console.log('友盟数据统计',e);
                    }
                }
                else if (type === 'contact' && isIos) {
                    try{
                        new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.contact});
                    }
                    catch (e) {
                        console.log('友盟数据统计',e);
                    }
                }
            }
    },

    loadInventory() {
        const that = this;
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                url: `../wework/inventories/${that.data.evaluationId}`,
                method: "get",
                success(res) {
                    resolve(res);
                },
                fail(e) {
                    reject(e);
                }
            });
        });
        return p;
    },

    loadEvaluationInfo() {
        const that = this;
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                url: 'evaluations/outline',
                method: 'get',
                data: {
                    evaluationId: that.data.evaluationId
                },
                noLoading: true,
                success: function (res) {
                    resolve(res);
                },
                fail: function (err) {
                    reject(err);
                }
            });
        });
        return p;
    },

    loadReleaseSelf() {
        const that = this;
        const {evaluation, customNorms} = this.data;
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                url: 'release/self',
                method: 'post',
                data: {
                    evaluationInfo: {
                        evaluationId: evaluation.id,
                        normId: evaluation.generalNorms.length ? evaluation.generalNorms[0].normId : customNorms[0].normId,
                        freeEvaluation: evaluation.freeEvaluation,
                        evaluationName: evaluation.name,
                        quesCount: evaluation.quesCount,
                        estimatedTime: evaluation.estimatedTime
                    }
                },
                success(res) {
                    resolve(res);
                },
                fail(err) {
                    reject(err);
                }
            });
        })
        return p;
    }
});
