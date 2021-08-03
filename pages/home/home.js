const app = getApp();
Page({
    data: {
        teamRole: app.teamRole,
        showTopGift: false,
        showGiftDlg: false,
        statusbarHeight: app.globalData.statusbarHeight,
        titleHeight: app.globalData.titleHeight,
        isIos: app.isIos,
        loading: true,
        mobile: "18559297592",
        wechat: "haola72",
        active: 0,
        column: [],
        trigger: true,
        scrollViewHeight: 'calc(100vh - 120rpx)',
        scrollTop: 0,
        offsetTop: 0,
        isFixed: false,
        page: 0,
        size: 10,
        evaluationSection: {
            title: '',
            evaluations: []
        }
    },

    onLoad: function () {
        this.init();
        this.loadSection();
    },

    onShow: function () {
        const that = this;
        app.freeTickId = "";
        setTimeout(()=>{
            that.setData({
                tabbarHeight: wx.getStorageSync('TAB_BAR_HEIGHT')
            })
        }, 0)
    },

    onUnload() {
        const {isWxWork, is3rd} = app.wxWorkInfo;
        if (isWxWork || is3rd) {
            this.setData({
                loading: true,
                trigger: false
            });
        }
    },

    onScroll(event) {
        wx.createSelectorQuery()
            .select('#home-scroll')
            .boundingClientRect((res) => {
                this.setData({
                    scrollTop: event.detail.scrollTop,
                    offsetTop: res.top
                });
            })
            .exec();
    },

    onSticky(e){
        this.setData({
            isFixed: e.detail.isFixed
        });
    },

    onShareAppMessage(options) {
        return app.defaultShareObj;
    },

    init() {
        if(app.checkAccessToken()){
            const {isWxWork} = app.wxWorkInfo;
            const {is3rd} = app.wx3rdInfo;
            const isWxWorkAdmin = wx.getStorageSync('userInfo').isAdmin;
            const isWxWorkSuperAdmin = wx.getStorageSync('userInfo').isSuperAdmin;
            this.check({
                isWxWork,
                isWxWorkAdmin,
                is3rd,
                isWxWorkSuperAdmin
            })
        } else {
            app.checkUserInfo=(res)=>{
                this.check({
                    isWxWork: res.isWxWork,
                    isWxWorkAdmin: res.isAdmin,
                    is3rd: res.is3rd,
                    isWxWorkSuperAdmin: res.isSuperAdmin
                })
            };
        }
    },

    check({isWxWork, isWxWorkAdmin, isWxWorkSuperAdmin, is3rd}) {
        const that = this;
        if (is3rd || isWxWork && !isWxWorkSuperAdmin) {
            let flag = false
            let url = isWxWork ? "/pages/account/account" : "/pages/auth/auth?type=auth"
            if (app.checkAccessToken()) {
                url = '/pages/work-base/work-base'
                wx.switchTab({
                    url: url
                });
            } else {
                wx.navigateTo({
                    url: url
                });
            }
            return
        }
        if (!is3rd && !isWxWork || !is3rd && isWxWork && isWxWorkSuperAdmin) {
            console.log('isWxWorkSuperAdmin: ', isWxWorkSuperAdmin);
            let homePagesPromiseList = [];
            const homePagesPromise = new Promise(function (resolve, reject) {
                app.doAjax({
                    url: "homePages",
                    method: "get",
                    noLoading: true,
                    success: function (res) {
                        resolve(res.resultObject);
                    },
                    fail: function (err) {
                        reject(err)
                    }
                });
            });
            homePagesPromise.then(res => {
                that.setData(res);
                homePagesPromiseList = res.column.map((v, k) => {
                    return new Promise((resolve, reject) => {
                        app.doAjax({
                            url: `homePages/columns/${v.column_id}/evaluations`,
                            method: "get",
                            noLoading: true,
                            success: function (res) {
                                resolve({columnId: v.column_id, data: res.data});
                            },
                            fail: function (err) {
                                reject(err);
                            }
                        });
                    })
                });
                return Promise.all(homePagesPromiseList)
            }).then(res => {
                const {column} = that.data;
                const targetColumn = column;
                for (let i = 0; i < res.length; i++) {
                    for (let j = 0; j < column.length; j++) {
                        if (res[i].columnId === targetColumn[j].column_id) {
                            targetColumn[j]["data"] = res[i].data || [];
                        }
                    }
                }
                that.setData({
                    column: targetColumn,
                });
                setTimeout(() => {
                    that.setData({
                        loading: false
                    })
                }, 500);
            }).catch(err => {
                setTimeout(() => {
                    that.setData({
                        loading: false
                    })
                }, 500);
            });
        }
    },

    goToMore(e) {
        const {type} = e.target.dataset;
        wx.navigateTo({
            url: `/pages/home/components/more/more?type=${type}`
        });
    },

    goToSearch() {
        wx.navigateTo({
            url: '/pages/home/subpages/search/search'
        })
    },

    goToCustomerService() {
        wx.navigateTo({
            url: '/pages/customer-service/customer-service'
        })
    },

    loadSection() {
        const that = this;
        const {evaluationSection} = this.data;
        const evaluationList = evaluationSection.evaluations;
        const {page, size} = this.data;
        app.doAjax({
            url: '../wework/homepages/evaluations',
            method: 'GET',
            data: {
                page: page + 1,
                size,
            },
            success(res) {
                const {evaluations, title} = res;
                if(evaluations.length){
                    const targetEvaluations = [...evaluationList, ...evaluations]
                    evaluationSection.evaluations = targetEvaluations;
                    evaluationSection.title = title
                    console.log({...evaluationSection})
                    that.setData({
                        evaluationSection: {...evaluationSection},
                        page: page + 1,
                    })
                } else {
                    evaluationSection.title = title
                    that.setData({
                        evaluationSection: {...evaluationSection},
                    })
                    app.toast('已为您加载所有相关内容')
                }
                console.log(res);
            },
            error(err) {

            }
        })
    }
});
