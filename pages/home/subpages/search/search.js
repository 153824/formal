import debounce from "../../../../utils/lodash/debounce";
import {getEnv, getTag, umaEvent} from "../../../../uma.config";

const app = getApp();
Page({
    data: {
        keyword: '',
        scrollTop: 0,
        offsetTop: 0,
        isFixed: false,
        isEmpty: false,
        tagSection: [],
        typeSection: [],
        searchRes: [],
        page: 0,
        size: 10,
        isGetAccessToken: app.checkAccessToken(),
        authCodeCounter: 0,
        backgroundImageClass: ['work', 'ability', 'mine', 'knowledge']
    },

    onLoad(options) {
        this.loadSection();
    },

    onShow() {
        this.setData({
            isGetAccessToken: app.checkAccessToken(),
        })
    },

    onScroll(event) {
        wx.createSelectorQuery()
            .select('#search-scroll')
            .boundingClientRect((res) => {
                this.setData({
                    scrollTop: event.detail.scrollTop,
                    offsetTop: res.top
                });
            })
            .exec();
    },

    onSticky(e) {
        let {isFixed} = e.detail;
        this.setData({
            isFixed
        });
    },

    clear() {
        this.setData({
            keyword: ""
        })
    },

    onKeywordFocus() {
        this.setData({
            isEmpty: false,
            isConfirm: false
        })
    },

    onKeywordInput() {
        this.setData({
            page: 0,
            isEmpty: false,
            searchRes: [],
        })
    },

    onKeywordConfirm: debounce(function (e) {
        const {value} = e.detail;
        this.setData({
            page: 0,
            isEmpty: false,
            searchRes: [],
            isConfirm: true
        }, () => {
            if (value) this.loadSearch()
        });
    }, 800, {trailing: true, leading: false}),

    loadSearch() {
        const that = this;
        const {keyword, page, size, searchRes} = this.data;
        app.doAjax({
            url: '../wework/homepages/search',
            method: 'GET',
            data: {
                keyword: keyword,
                page: page + 1,
                size
            },
            success(res) {
                const umaConfig = umaEvent.searchByKeyword;
                wx.uma.trackEvent(umaConfig.tag, {
                    content: `${keyword}`,
                    count: `${res.length}`,
                    env: getEnv(wx),
                    tag: getTag(wx)
                });
                if (res.length === 0 && page === 0) {
                    that.setData({
                        isEmpty: true
                    })
                }
                if (res.length) {
                    that.setData({
                        searchRes: [...searchRes, ...res],
                        page: page + 1
                    })
                }
            },
        });
    },

    loadSection() {
        const that = this;
        app.doAjax({
            url: '../wework/homepages/search/recommendation',
            method: 'GET',
            success(res) {
                that.setData({
                    tagSection: res.tagColumns,
                    typeSection: res.typeColumns
                })
            },
        })
    },

    cancel() {
        wx.switchTab({
            url: '/pages/home/home'
        });
    },

    goToEvaluationDetail(e) {
        const umaConfig = umaEvent.evaluationDetail;
        const {evaluationId, sectionName, evaluationName} = e.currentTarget.dataset;
        const type = sectionName === '最新上架' ? 'showcase' : 'hot';
        wx.navigateTo({
            url: `/pages/station/components/detail/detail?id=${evaluationId}`
        });
        wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin[type], env: getEnv(wx), tag: getTag(wx)});
        {
            const isHot = sectionName === '热门测评';
            console.log({name: `${evaluationName}`, env: getEnv(wx), tag: getTag(wx)})
            if (isHot) {
                const umaConfig = umaEvent.searchGetInHotEvaluation;
                wx.uma.trackEvent(umaConfig.tag, {name: `${evaluationName}`, env: getEnv(wx), tag: getTag(wx)});
            } else {
                const umaConfig = umaEvent.searchGetInShowcaseEvaluation;
                wx.uma.trackEvent(umaConfig.tag, {name: `${evaluationName}`, env: getEnv(wx), tag: getTag(wx)});
            }
        }
    },

    goToMore(e) {
        const {sectionId, sectionName, moreType} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/home/subpages/section/section?sectionId=${sectionId}`
        })
        if (sectionName) {
            const umaConfig = umaEvent.searchGetInTypeByHome;
            wx.uma.trackEvent(umaConfig.tag, {
                section: `${sectionName}`,
                env: getEnv(wx),
                tag: getTag(wx)
            });
        } else {
            if (moreType === '最新上架') {
                const umaConfig = umaEvent.searchGetInShowcaseMore;
                wx.uma.trackEvent(umaConfig.tag, {press: `${umaConfig.name}`, env: getEnv(wx), tag: getTag(wx)});
            } else {
                const umaConfig = umaEvent.searchGetInHotMore;
                wx.uma.trackEvent(umaConfig.tag, {
                    press: `${umaConfig.name}`,
                    env: getEnv(wx),
                    tag: getTag(wx)
                });
            }
        }
    },

    goToCustomerService(e) {
        const {isEmpty} = e.currentTarget.dataset;
        if (isEmpty) {
            const umaConfig = umaEvent.customerService;
            wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin.search, env: getEnv(wx), tag: getTag(wx)});
        }
        wx.navigateTo({
            url: '/pages/customer-service/customer-service'
        })
    },

    getPhoneNumber(e) {
        const that = this;
        let {authCodeCounter} = this.data;
        if (authCodeCounter > 5) {
            return;
        }
        app.getAccessToken(e).then(res => {
            that.setData({
                isGetAccessToken: true
            });
            that.goToCustomerService();
            const umaConfig = umaEvent.authPhoneSuccess;
            wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin.search, env: getEnv(wx), tag: getTag(wx)});
        }).catch(err => {
            if (err.code === '401111') {
                app.prueLogin().then(res => {
                    this.getPhoneNumber(e)
                });
                that.setData({
                    authCodeCounter: authCodeCounter++
                })
            }
        })
    },
});
