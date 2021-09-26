import {Tracker, umaEvent} from "../../../../uma.config";

const app = getApp();
Page({
    data: {
        nav: [
            {
                name: "已完成",
                code: 'done',
                checked: true
            },
            {
                name: "作答中",
                code: 'replying',
                checked: false
            },
            {
                name: "待作答",
                code: 'wait',
                checked: false
            },
        ],
        releaseRecordId: '',
        finishPage: 0,
        replyPage: 0,
        waitPage: 0,
        finishCount: 0,
        replyCount: 0,
        waitCount: 0,
        currentNav: 0,
        finish: [],
        reply: [],
        wait: [],
        digest: {},
        imageTrigger: false,
        isShowQRCode: false,
        releaseName: ''
    },
    onLoad(options) {
        this.setData({
            releaseRecordId: options.releaseRecordId,
            sharedAt: options.sharedAt,
        });
        try{
            const route = 'pages/station/components/generate/generate';
            const currentPage = getCurrentPages()[getCurrentPages().length - 2].route;
            if(route === currentPage){
                const nav = this.data.nav.map(((item, index)=>{
                    return {
                        ...item,
                        checked: index === 1
                    }
                }))
                this.setData({
                    nav
                })
            }
        }
        catch (e) {
            console.error(e);
        }
        const targetOptions = {
            ...options,
            userId: wx.getStorageSync('userInfo').userId,
            teamId: wx.getStorageSync('userInfo').teamId,
        }
        if(app.checkAccessToken()){
            this.init(targetOptions)
        } else {
            app.checkUserInfo = (userInfo) =>{
                targetOptions.userId = userInfo.userId;
                targetOptions.teamId = userInfo.teamId;
                this.init(targetOptions)
            }
        }
    },
    init(options) {
        if(options.sharedAt){
            this.acceptEvaluationTrack(options)
                .then(res=>{
                    this.loadDigest(options.releaseRecordId)
                    this.loadFinish(options.releaseRecordId)
                    this.loadReplying(options.releaseRecordId)
                    this.loadWait(options.releaseRecordId)
                })
        } else {
            this.loadDigest(options.releaseRecordId)
            this.loadFinish(options.releaseRecordId)
            this.loadReplying(options.releaseRecordId)
            this.loadWait(options.releaseRecordId)
        }
    },
    acceptEvaluationTrack(options={trackId: "", releaseRecordId: "", sharedAt: "", userId: ""}) {
        const that = this;
        const {releaseRecordId, sharedAt, userId} = options;
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                url: "release_records/accept",
                method: "post",
                noLoading: true,
                data: {
                    userId: wx.getStorageSync("userInfo").id || userId,
                    releaseRecordId: releaseRecordId || that.data.releaseRecordId,
                    sharedAt: sharedAt
                },
                success(res) {
                    resolve(true)
                },
                error(err) {
                    console.error('领取使用记录错误:',err);
                    wx.showToast({
                        title: "领取使用记录错误！"
                    });
                    reject(false);
                }
            })
        });
        return p;
    },
    onChangeTab(e) {
        const {nav} = this.data;
        const {index, name} = e.currentTarget.dataset;
        const targetNav = nav.map((item, key)=>{
            item.checked = key === Number(index);
            return item;
        });
        this.setData({
            nav: targetNav,
            currentNav: index
        });
    },
    loadDigest(releaseRecordId) {
        const that = this;
        const {nav} = this.data;
        app.doAjax({
            url: '/release_records/digest',
            method: 'GET',
            data: {
                releaseRecordId
            },
            success(res){
                that.setData({
                    digest: res
                })
                that.loadEvaluationInfo(res.evaluationId)
                if(res.type!=='EMAIL'){
                   that.setData({
                       nav: nav.slice(0, nav.length - 1)
                   })
                }
            }
        })
    },
    loadFinish(releaseRecordId) {
        const that = this;
        const {finishPage, finish} = this.data;
        releaseRecordId = releaseRecordId || this.data.releaseRecordId;
        app.doAjax({
            url: '/release_records/detail',
            method: 'GET',
            data: {
                type: 'finished',
                page: finishPage + 1,
                pageSize: '',
                releaseRecordId
            },
            success(res){
                if(res.data.length){
                    that.setData({
                        finish: [...finish, ...res.data],
                        finishCount: res.count,
                        finishPage: finishPage + 1
                    })
                }
            }
        })
    },
    loadReplying(releaseRecordId) {
        const that = this;
        const {replyPage, reply} = this.data;
        releaseRecordId = releaseRecordId || this.data.releaseRecordId;
        app.doAjax({
            url: '/release_records/detail',
            method: 'GET',
            data: {
                type: 'examining',
                page: replyPage + 1,
                pageSize: 8,
                releaseRecordId
            },
            success(res){
                that.setData({
                    reply: [...reply, ...res.data],
                    replyCount: res.count,
                    replyPage: replyPage + 1
                })
            }
        })
    },
    loadWait(releaseRecordId) {
        const that = this;
        const {waitPage, wait} = this.data;
        releaseRecordId = releaseRecordId || this.data.releaseRecordId;
        app.doAjax({
            url: '/release_records/detail',
            method: 'GET',
            data: {
                type: 'unclaimed',
                page: waitPage + 1,
                pageSize: 8,
                releaseRecordId
            },
            success(res){
                if(res.data.length) {
                    that.setData({
                        wait: [...wait, ...res.data],
                        waitCount: res.count,
                        waitPage: waitPage + 1
                    })
                }
            }
        })
    },
    revoke() {
        const that = this;
        const {releaseRecordId} = this.data;
        wx.showModal({
            title: '提示',
            content: '确认撤回该测评？',
            success(ret) {
                if (ret.confirm) {
                    app.doAjax({
                        url: 'release/revoke',
                        method: 'post',
                        data: {
                            releaseRecordId: that.data.releaseRecordId
                        },
                        success: function(res) {
                            app.toast('撤回成功，测评已返还');
                            that.loadDigest(releaseRecordId)
                        }
                    });
                }
            }
        });
    },
    next() {
        const {currentNav} = this.data;
        switch (currentNav) {
            case 0:
                this.loadFinish();
                break;
            case 1:
                this.loadReplying();
                break;
            case 2:
                this.loadWait();
                break;
        }
    },
    showQRCode() {
        this.setData({
            isShowQRCode: true
        })
        this.selectComponent('#preview-image').showQRCode()
    },
    hideQRCode() {
        this.selectComponent('#preview-image').hideQRCode()
        this.setData({
            isShowQRCode: false
        })
    },
    goToReport(e) {
        const {digest} = this.data;
        const {receiveRecordId} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/report/report?receiveRecordId=${receiveRecordId}`
        });
        const umaConfig = umaEvent.getInReport;
        try{
            new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.record, name: `${digest.evaluationName}`});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
    },
    follow() {
        let url = 'https://mp.weixin.qq.com/s/0gO2v6kVZS4ULJLP3l-IPg';
        const appId = wx.getAccountInfoSync().miniProgram.appId;
        if(appId.indexOf('2d32') > -1){
            url = 'https://mp.weixin.qq.com/s/RtW69M0UsFvLzLnMTuyp3A';
        }
        wx.setStorageSync('webView_Url', url);
        wx.navigateTo({
            url: '/common/webView'
        });
    },
    async loadEvaluationInfo(evaluationId) {
        const res = await app.loadEvaluationInfo(evaluationId)
        this.setData({
            shareInfo: res
        })
    },
    showEditDialog() {
        this.setData({
            isShowEditDialog: true,
        })
    },
    hideEditDialog() {
        this.setData({
            isShowEditDialog: false,
        })
    },
    saveReleaseName() {
        const that = this;
        const {releaseRecordId, releaseName} = this.data
        app.doAjax({
            url: `wework/evaluations/release_records/${releaseRecordId}/names`,
            method: 'PUT',
            data: {
                name: releaseName
            },
            success(res) {
                that.hideEditDialog()
                that.loadDigest(releaseRecordId)
            }
        })
    },
    onReleaseNameInput(e) {
        this.setData({
            releaseName: e.detail.value
        })
    },
    onShareAppMessage() {
        const {releaseRecordId, digest, isShowQRCode, shareInfo} = this.data;
        console.log('isShowQRCode: ',isShowQRCode);
        if(isShowQRCode){
            return {
                title: `邀您参加《${digest.evaluationName}》`,
                path: `pages/work-base/components/guide/guide?releaseRecordId=${releaseRecordId}`,
                imageUrl: shareInfo.rectangleImage,
            }
        }
        const time = new Date().getTime();
        return {
            title: `邀请您查看《${digest.evaluationName}》的作答情况`,
            path: `pages/work-base/components/grant/grant?releaseRecordId=${releaseRecordId}&sharedAt=${time}`,
            imageUrl: shareInfo.rectangleImage,
        };
    },
});
