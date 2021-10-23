import {getEnv, getTag, umaEvent, Tracker} from "../../uma.config.js";
import {loadIsSubscribed, loadSubscriber, postCreatSubscriber} from "../../api/home";

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
        authCodeCounter: 0,
        joinInShow: true,
        isSubscribed: true,
        subscriberInfo: {
            hide: false,
            owned: true,
            activated: false
        },
        popup: ''
    },

    onLoad(options) {
        this.setData({
            popup: options.popup
        })
    },

    onShow: async function () {
        const that = this;
        setTimeout(()=>{
            that.setData({
                tabbarHeight: wx.getStorageSync('TAB_BAR_HEIGHT')
            })
        }, 0);
        await this.init();
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

    async init() {
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
                isWxWorkSuperAdmin,
            })
            await this.getSubscriber()
            await this.getIsSubscribed(null, 'init')
        }
        else {
            app.checkUserInfo= async (res)=>{
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
                if(res.tokenInfo && res.tokenInfo.accessToken){
                    await this.getSubscriber(res.tokenInfo.accessToken)
                    await this.getIsSubscribed(null, 'init')
                }
            };
        }
    },

    check({isWxWork, isWxWorkAdmin, isWxWorkSuperAdmin, is3rd}) {
        const that = this;
        if (is3rd) {
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
        if (!is3rd) {
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
        if(type === 'brain'){
            wx.navigateTo({
                url: `/pages/home/subpages/free/free`
            });
            return
        }
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
        app.openContactService()
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
        const {type} = e.target.dataset;
        let {authCodeCounter} = this.data;
        if(authCodeCounter > 5){
            return;
        }
        app.getAccessToken(e)
            .then(async res=>{
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
                await that.getIsSubscribed(e);
            })
            .catch(err=>{
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
                let origin = 'home'
                const umaConfig = umaEvent.authPhoneCount;
                if(type === 'join'){
                    origin = 'card'
                }
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin[origin]});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
    },

    async getSubscriber(token) {
       const {activated, hide, owned} = await loadSubscriber({accessToken: token})
       this.setData({
           subscriberInfo: {activated, hide, owned}
       })
        if(!owned && !hide){
            try{
                const umaConfig = umaEvent.popupFreeCard;
                new Tracker(wx).generate(umaConfig.tag);
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
    },

    async getIsSubscribed(e, type) {
        const {subscriberInfo} = this.data;
        const {subscribed} = await loadIsSubscribed()
        this.setData({
            isSubscribed: subscribed,
            isJoin: e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.join === 'join'
        })
        // 前往公众号
        if(!subscribed && type !== 'init'){
            wx.navigateTo({
                url: '/common/webView'
            })
            const url =  (() => {
                if (wx.getAccountInfoSync().miniProgram.appId === 'wx85cde7d3e8f3d949') {
                    return "http://mp.weixin.qq.com/s?__biz=MzU3MDcwODgwNw==&mid=100025219&idx=1&sn=8c1056e6454739f01152969aa1e1879b&chksm=7ce9a5ab4b9e2cbd9b43625833da0e83dec43b38fe0735456808f3eeafc610a1621d7b206164#rd";
                } else {
                    return "http://mp.weixin.qq.com/s?__biz=Mzg4MzMxNTg1MA==&mid=100000013&idx=1&sn=123207cccedb235b93b4c3f2787899f3&chksm=4f4804e8783f8dfe33c4f7aee680cd99c03ced5181bb0e891645a949272b6dd326f97b20db3c#rd";
                }
            })()
            wx.setStorageSync("webView_Url", url)
        }
        if(subscribed && !subscriberInfo.owned && type !== 'init'){
            await this.postSubscriber()
            try{
                const umaConfig = umaEvent.getFreeCardRightNow;
                new Tracker(wx).generate(umaConfig.tag);
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
    },

    closeOverlay() {
        this.setData({
            joinInShow: false
        })
    },

    openOverlay() {
        this.setData({
            joinInShow: true
        })
    },

    goToUserCenter() {
        wx.switchTab({
            url: '/pages/user-center/user-center'
        })
    },

    async postSubscriber() {
        await postCreatSubscriber()
    }
});
