// manager/useHistoryDetail.js
const app = getApp();
Page({
    data: {
        nav: [
            {
                id: 0,
                name: "已完成",
                checked: true
            },
            {
                id: 1,
                name: "作答中",
                checked: false
            },
            {
                id: 2,
                name: "待作答",
                checked: false
            },
        ],
        checkedItem: 0,
        finishedPage: 1,
        examiningPage: 1,
        baseInfo: {},
        imageTrigger: false,
        statusbarHeight: app.globalData.statusbarHeight,
        titleHeight: app.globalData.titleHeight,
        tarBarHeight: app.globalData.tarBarHeight,
        windowHeight: app.globalData.windowHeight,
        screenHeight: app.globalData.screenHeight,
        pixelRate: app.globalData.pixelRate,
        examiningList: [],
        finishList: [],
        status: "",
        amount: 0,
        QRCode: "",
        maskTrigger: true,
        finishCount: 0,
        examiningCount: 0
    },

    onLoad: function (options) {
        const that = this;
        const {releaseRecordId, sharedAt,trackId} = options;
        console.log("options: ", options);
        const {examiningDetail, finishedDetail, digestDetail} = this;
        if (sharedAt) {
            this.setData({
                releaseRecordId,
                sharedAt
            });
        }
        if(releaseRecordId || trackId) {
            this.setData({
                releaseRecordId: releaseRecordId || trackId,
            });
        }
        options.userId = "";
        options.teamId = "";
        if (app.globalData.userInfo && wx.getStorageSync('userInfo')) {
            if (releaseRecordId && sharedAt) {
                this.acceptEvaluationTrack(options).then(res => {
                    Promise.all([examiningDetail(options), finishedDetail(options), digestDetail(options)]).then(res => {
                        setTimeout(()=>{
                            that.setData({
                                maskTrigger: false
                            })
                        },500)
                    })
                }).catch(err => {
                    wx.switchTab({
                        url: "pages/work-base/work-base",
                    })
                })
            } else {
                Promise.all([examiningDetail(options), finishedDetail(options), digestDetail(options)]).then(res => {
                    setTimeout(()=>{
                        that.setData({
                            maskTrigger: false
                        })
                    },500)
                }).catch(err => {
                    console.error("err: ", err);
                    that.setData({
                        maskTrigger: false
                    })
                })
            }
        } else {
            app.checkUserInfo = (userInfo) => {
                options.teamId = userInfo.teamId;
                options.userId = userInfo.id;
                if (releaseRecordId && sharedAt) {
                    this.acceptEvaluationTrack(options).then(res => {
                        Promise.all([examiningDetail(options), finishedDetail(options), digestDetail(options)]).then(res => {
                            setTimeout(()=>{
                                that.setData({
                                    maskTrigger: false
                                })
                            },500)
                        })
                    }).catch(err => {
                        wx.switchTab({
                            url: "pages/work-base/work-base",
                        })
                    })
                } else {
                    Promise.all([examiningDetail(options), finishedDetail(options), digestDetail(options)]).then(res => {
                        setTimeout(()=>{
                            that.setData({
                                maskTrigger: false
                            })
                        },500)
                    }).catch(err => {
                        console.error("err: ", err);
                        setTimeout(()=>{
                            that.setData({
                                maskTrigger: false
                            })
                        },500)
                    })
                }
            }
        }
        const systemInfo = wx.getSystemInfoSync();
        that.setData({
            windowHeight: systemInfo.windowHeight,
        });
    },

    onShow() {
    },

    acceptEvaluationTrack: function (options={trackId: "", releaseRecordId: "", sharedAt: "", userId: ""}) {
        const {trackId, releaseRecordId, sharedAt, userId} = options;
        const acceptEvaluationTrackPromise = new Promise((resolve, reject) => {
            app.doAjax({
                url: "release_records/accept",
                method: "post",
                noLoading: true,
                data: {
                    userId: wx.getStorageSync("userInfo").id || userId,
                    releaseRecordId: releaseRecordId || trackId || this.data.releaseRecordId,
                    sharedAt: sharedAt
                },
                success: function (res) {
                    resolve(true)
                },
                fail: function (err) {
                    wx.showToast({
                        title: "领取使用记录错误！"
                    });
                    reject(false);
                }
            })
        });
        return acceptEvaluationTrackPromise
    },

    examiningDetail: function (options={trackId: "", releaseRecordId: "", sharedAt: "", userId: ""}) {
        const that = this;
        const {trackId, releaseRecordId} = options;
        let {examiningPage, examiningList} = this.data;
        const examiningDetailPromise = new Promise((resolve, reject) => {
            app.doAjax({
                url: `release_records/detail`,
                method: 'get',
                noLoading: true,
                data: {
                    type: 'examining',
                    page: examiningPage,
                    pageSize: 8,
                    releaseRecordId: releaseRecordId || trackId || this.data.releaseRecordId,
                    userId: options.userId,
                    teamId: options.teamId,
                },
                success: function (res = []) {
                    let {examiningCount} = that.data;
                    if(res.data.length){
                        examiningPage = examiningPage+1;
                        examiningCount = res.count;
                    }
                    that.setData({
                        examiningList: examiningList.concat(res.data),
                        examiningPage,
                        examiningCount
                    });
                    resolve(true)
                },
                fail: function (err) {
                    reject(false)
                }
            });
        })
        return examiningDetailPromise;
    },

    finishedDetail: function (options={trackId: "", releaseRecordId: "", sharedAt: "", userId: ""}) {
        const that = this;
        const {trackId, releaseRecordId} = options;
        let {finishedPage, finishList} = this.data;
        const finishedDetailPromise = new Promise((resolve, reject) => {
            app.doAjax({
                url: `release_records/detail`,
                method: 'get',
                noLoading: true,
                data: {
                    type: 'finished',
                    page: finishedPage,
                    pageSize: 8,
                    releaseRecordId: releaseRecordId || trackId || this.data.releaseRecordId,
                    userId: options.userId,
                    teamId: options.teamId,
                },
                success: function (res = []) {
                    let {finishCount} = that.data;
                    if(res.data.length){
                        finishedPage = finishedPage+1;
                        finishCount = res.count
                    }
                    that.setData({
                        finishList: finishList.concat(res.data),
                        finishedPage,
                        finishCount
                    });
                    resolve(true);
                },
                fail: function (err) {
                    reject(false);
                }
            });
        });
        return finishedDetailPromise;
    },

    digestDetail: function (options={trackId: "", releaseRecordId: "", sharedAt: "", userId: ""}) {
        const that = this;
        const {trackId, releaseRecordId} = options;
        const digestDetailPromise = new Promise((resolve, reject) => {
            app.doAjax({
                url: `release_records/digest`,
                method: `get`,
                noLoading: true,
                data: {
                    releaseRecordId: trackId || releaseRecordId || this.data.releaseRecordId,
                    userId: options.userId,
                    teamId: options.teamId,
                },
                success: function (res) {
                    that.setData({
                        status: res.status,
                        amount: res.amount,
                        available: res.available,
                        QRCode: res.QRCode,
                        cover: res.smallImg,
                        evaluationId: res.evaluationId,
                        evaluationName: res.evaluationName,
                        releaseRecordId: res.releaseRecordId,
                        type: res.type.toLowerCase()
                    });
                    resolve(true);
                },
                fail: function (err) {
                    reject(false);
                }
            });
        });
        return digestDetailPromise;
    },

    getNextPage: function (e) {
        let {checkedItem, finishedPage, examiningPage} = this.data;
        if (checkedItem === 0) {
            this.finishedDetail();
        } else if (checkedItem === 1) {
            this.examiningDetail();
        } else {

        }
    },

    /**
     * @Description:  切换tab页
     * @author: WE!D
     * @name:  changeTab
     * @args:  e视图层数据绑定
     * @return:
     * @date: 2020/8/27
     */
    changeTab: function (e) {
        const targetValue = e.currentTarget.dataset.id,
            {nav} = this.data;
        for (let i = 0; i < nav.length; i++) {
            nav[i].checked = nav[i].id === targetValue;
        }
        this.setData({
            nav,
            checkedItem: targetValue,
        })
    },

    /**
     * @Description:  页面跳转
     * @author: WE!D
     * @name:  changePage
     * @args:  e视图层数据绑定
     * @return:
     * @date: 2020/8/27
     */
    changePage: function (e) {
        const {id} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `../../../report/report?receiveRecordId=${id}`
        })
    },

    /**
     * @Description:  跳转至测评详情页
     * @author: WE!D
     * @name:  gotoDetail
     * @args:  e视图层数据绑定
     * @return:
     * @date: 2020/8/27
     */
    gotoDetail: function (e) {
        const {id} = e.currentTarget.dataset;
        wx.redirectTo({
            url: `../../../station/components/detail/detail?id=${id}`
        });
    },

    /**
     * @Description:  加载二维码
     * @author: WE!D
     * @name:  loadQrcode
     * @args:
     * @return:
     * @date: 2020/8/27
     */
    loadQrcode: function () {
        this.setData({
            imageTrigger: true,
        });
        setTimeout(() => {
            this.setData({
                sharePaperImg: this.data.baseInfo.img
            })
        }, 500);
    },

    /**
     * @Description:  关闭二维码
     * @author: WE!D
     * @name:  closeQrcode
     * @args:
     * @return:
     * @date: 2020/8/27
     */
    closeQrcode: function (e) {
        this.setData({
            imageTrigger: false
        })
    },

    onShareAppMessage: function () {
        const {trackId, releaseRecordId, evaluationName, cover} = this.data;
        const time = new Date().getTime();
        try {
            wx.uma.trackEvent('1602216690926')
        } catch (e) {

        }
        console.log("evaluation: ", `pages/work-base/components/track-detail/track-detail?releaseRecordId=${trackId || releaseRecordId}&sharedAt=${time}&tabIndex=1`,)
        return {
            title: `邀请您查看《${evaluationName}》的作答情况`,
            path: `pages/work-base/components/track-detail/track-detail?releaseRecordId=${trackId || releaseRecordId}&sharedAt=${time}&tabIndex=1`,
            imageUrl: cover
        };
    },
});
