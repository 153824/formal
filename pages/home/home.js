import {getEnv, getTag, umaEvent, Tracker} from "../../uma.config.js";
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
        },
        bannerRes: [],
        isGetAccessToken: app.checkAccessToken(),
        authCodeCounter: 0
    },

    onLoad: function () {
        this.init();
    },

    onShow: function () {
        const that = this;
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
        const that = this;
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
            this.setData({
                isGetAccessToken: true,
                isWxWork,
                isWxWorkAdmin,
                is3rd,
                isWxWorkSuperAdmin
            })
        } else {
            app.checkUserInfo=(res)=>{
                console.log(res)
                this.check({
                    isWxWork: res.isWxWork,
                    isWxWorkAdmin: res.isAdmin,
                    is3rd: res.is3rd,
                    isWxWorkSuperAdmin: res.isSuperAdmin
                })
                this.setData({
                    isGetAccessToken: res.tokenInfo && res.tokenInfo.accessToken,
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
                console.log('checkAccessToken')
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
            Promise.race([this.loadSection(), this.loadBanner()])
                .then(res=>{
                    that.setData({
                        loading: false
                    })
                })
                .catch(err=>{
                    that.setData({
                        loading: false
                    })
                })
            setTimeout(()=>{
                const umaConfig = umaEvent.launchHome;
                new Tracker(wx).generate(umaConfig.tag);
            }, 10000);
        }
    },

    goToMore(e) {
        let name = "";
        const {type} = e.target.dataset;
        wx.navigateTo({
            url: `/pages/home/components/more/more?type=${type}`
        });
        switch (type) {
            case 'brain':
                name = '人才盘点';
                break;
            case 'school':
                name = '校招选才';
                break;
            case 'social':
                name = '社招选才';
                break;
        }
        const umaConfig = umaEvent.getInNavigationByHome;
        try{
            new Tracker(wx).generate(umaConfig.tag, {navigation: `${name}`});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
    },

    goToSearch() {
        wx.navigateTo({
            url: '/pages/home/subpages/search/search'
        })
        const umaConfig = umaEvent.getInSearchByHome;
        try{
            new Tracker(wx).generate(umaConfig.tag);
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
    },

    goToWhere(e) {
        const {bannerRes} = this.data;
        const {index} = e.currentTarget.dataset;
        if(bannerRes[index].linkId.indexOf('http') > -1) {
            this.goToWebView(bannerRes[index].linkId)
        } else {
            wx.navigateTo({
                url: `/pages/station/components/detail/detail?id=${bannerRes[index].id}`
            })
        }
        const umaConfig = umaEvent.getInBannerByHome;
        try{
            new Tracker(wx).generate(umaConfig.tag, {order: `${index}`});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
    },

    goToWebView(url) {
        wx.setStorageSync("webView_Url", url);
        wx.navigateTo({
            url: '/common/webView',
        });
    },

    goToCustomerService() {
        try{
            const umaConfig = umaEvent.customerService;
            new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.home});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
        wx.navigateTo({
            url: '/pages/customer-service/customer-service',
        });
    },

    loadSection() {
        const that = this;
        const {evaluationSection} = this.data;
        const evaluationList = evaluationSection.evaluations;
        const {page, size} = this.data;
        const p = new Promise((resolve, reject) => {
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
                    }
                    resolve(res);
                },
                error(err) {
                    reject(err);
                }
            });
        });
        return p;
    },

    loadBanner() {
        const that = this;
        const p = new Promise((resolve, reject) => {
            app.doAjax({
                url: "homePages",
                method: "get",
                noLoading: true,
                success(res) {
                    const targetData = [];
                    const {data} = res.resultObject.banner;
                    data.forEach(item=>{
                        targetData.push(item)
                    })
                    that.setData({
                        bannerRes: data
                    })
                    resolve(res)
                },
                error(err) {
                    reject(err)
                }
            })
        })
        return p;
    },

    getPhoneNumber(e) {
        const that = this;
        let {authCodeCounter} = this.data;
        if(authCodeCounter > 5){
            return;
        }
        app.getAccessToken(e).then(res=>{
            that.setData({
                isGetAccessToken: true
            });
            that.goToCustomerService();
            try{
                const umaConfig = umaEvent.authPhoneSuccess;
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.home});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }).catch(err=>{
            console.log(err);
            if(err.code === '401111'){
                app.prueLogin().then(res=>{
                    this.getPhoneNumber(e)
                });
                that.setData({
                    authCodeCounter: authCodeCounter++
                })
            }
        })
        if(authCodeCounter <= 0){
            try{
                const umaConfig = umaEvent.authPhoneCount;
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.home});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
    },
});
