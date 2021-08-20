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
        isShowQRCode: false
    },
    onLoad(options) {
        this.setData({
            releaseRecordId: options.releaseRecordId,
            sharedAt: options.sharedAt,
        });
        console.log(options);
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
        const {receiveRecordId} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/report/report?receiveRecordId=${receiveRecordId}`
        })
    },
    onShareAppMessage() {
        const {releaseRecordId, digest, isShowQRCode} = this.data;
        console.log('isShowQRCode: ',isShowQRCode);
        if(isShowQRCode){
            return {
                title: `邀您参加《${digest.evaluationName}》`,
                path: `pages/work-base/components/guide/guide?releaseRecordId=${releaseRecordId}`,
                imageUrl: digest.smallImg,
            }
        }
        const time = new Date().getTime();
        return {
            title: `邀请您查看《${digest.evaluationName}》的作答情况`,
            path: `pages/work-base/components/grant/grant?releaseRecordId=${releaseRecordId}&sharedAt=${time}`,
            imageUrl: digest.smallImg,
        };
    },
});
