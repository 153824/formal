import {getEnv, umaEvent} from "../../uma.config.js";
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
                isGetAccessToken: true
            })
        } else {
            app.checkUserInfo=(res)=>{
                this.check({
                    isWxWork: res.isWxWork,
                    isWxWorkAdmin: res.isAdmin,
                    is3rd: res.is3rd,
                    isWxWorkSuperAdmin: res.isSuperAdmin
                })
                this.setData({
                    isGetAccessToken: res.tokenInfo && res.tokenInfo.accessToken
                })
            };
        }
    },

    check({isWxWork, isWxWorkAdmin, isWxWorkSuperAdmin, is3rd}) {
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
            this.loadSection();
            this.loadBanner();
        }
        const umaConfig = umaEvent.launchHome;
        wx.uma.trackEvent(umaConfig.tag, {env: getEnv(wx)});
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
        wx.uma.trackEvent(umaConfig.tag, {name: `${umaConfig.name}${name}`, env: getEnv(wx)});
    },

    goToSearch() {
        wx.navigateTo({
            url: '/pages/home/subpages/search/search'
        })
        const umaConfig = umaEvent.getInSearchByHome;
        wx.uma.trackEvent(umaConfig.tag, {name: umaConfig.name, env: getEnv(wx)})
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
        wx.uma.trackEvent(umaConfig.tag, {name: `${umaConfig.name}${index}`, env: getEnv(wx)})
    },

    goToWebView(url) {
        wx.setStorageSync("webView_Url", url);
        wx.navigateTo({
            url: '/common/webView',
        });
    },

    goToCustomerService() {
        const umaConfig = umaEvent['customerService'];
        wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin.home, env: getEnv(wx)})
        wx.navigateTo({
            url: '/pages/customer-service/customer-service',
        });
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
    },

    loadBanner() {
        const that = this;
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
            },
            error(err) {

            }
        })
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
            const umaConfig = umaEvent.authPhoneSuccess;
            wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin.home, env: getEnv(wx)});
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
    },
});
