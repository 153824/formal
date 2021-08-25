// manager/useHistoryDetail.js
import {getEnv, getTag, Tracker, umaEvent} from "../../../../uma.config";

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
        examiningCount: 0,
        channel: "qrcode",
        isWxWork: false,
        isWxWorkAdmin: false,
        is3rd: false,
        is3rdAdmin: false,
        tabIndex: 1
    },

    onLoad: function (options) {
        const that = this;
        const {releaseRecordId, sharedAt,trackId, tabIndex} = options;
        if (tabIndex > 0) {
            const targetNav = this.data.nav.map(item=>{
                item.checked = item.id === Number(tabIndex)
                return {...item}
            })
            this.setData({
                nav: targetNav,
                checkedItem: Number(tabIndex)
            })
        }
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
        if(app.checkAccessToken()){
            this.canIUseEvaluationTrack({options,releaseRecordId, sharedAt})
        }else{
            app.checkUserInfo = (userInfo) =>{
                this.canIUseEvaluationTrack({options,releaseRecordId, sharedAt})
            }
        }
        const systemInfo = wx.getSystemInfoSync();
        that.setData({
            windowHeight: systemInfo.windowHeight,
        });
        app.setDataOfPlatformInfo(this);
    },

    onShow() {},

    canIUseEvaluationTrack({options,releaseRecordId,sharedAt}){
        const that = this;
        const {examiningDetail, finishedDetail, digestDetail} = this;
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
                        revoked: res.revoked,
                        available: res.available,
                        QRCode: res.QRCode,
                        cover: res.smallImg,
                        evaluationId: res.evaluationId,
                        evaluationName: res.evaluationName,
                        releaseRecordId: res.releaseRecordId,
                        releaseName: res.releaseName,
                        type: res.type ? res.type.toLowerCase() : '',
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

    changePage: function (e) {
        const {evaluationName} = this.data;
        const {id} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `../../../report/report?receiveRecordId=${id}`
        })
        const umaConfig = umaEvent.getInReport;
        try{
            new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.record, name: `${evaluationName}`});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
    },

    gotoDetail: function (e) {
        const {id} = e.currentTarget.dataset;
        wx.redirectTo({
            url: `../../../station/components/detail/detail?id=${id}`
        });
    },

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

    closeQrcode: function (e) {
        this.setData({
            imageTrigger: false
        })
    },

    saveToAlbum: function () {
        let invitationImgUrl = this.data.QRCode;
        wx.downloadFile({
            url: invitationImgUrl,
            success: res => {
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: res => {
                        wx.showModal({
                            title: "保存成功",
                            icon: "none"
                        })
                    },
                    fail: err => {
                        wx.showModal({
                            title: "保存失败",
                            icon: "none"
                        })
                    }
                });
            },
            fail: err => {
                wx.showModal({
                    title: "下载图片失败",
                    icon: "none"
                })
            }
        })
    },

    onShareAppMessage: function () {
        const {trackId, releaseRecordId, evaluationName, cover} = this.data;
        if(this.data.imageTrigger){
            return {
                title: `邀您参加《${evaluationName}》`,
                path: `pages/work-base/components/guide/guide?releaseRecordId=${releaseRecordId}`,
                imageUrl: cover,
            }
        }
        const time = new Date().getTime();
        return {
            title: `邀请您查看《${evaluationName}》的作答情况`,
            path: `pages/work-base/components/track-detail/track-detail?releaseRecordId=${trackId || releaseRecordId}&sharedAt=${time}&tabIndex=1`,
            imageUrl: cover
        };
    },
});
