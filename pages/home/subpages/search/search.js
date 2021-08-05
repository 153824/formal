import debounce from "../../../../utils/lodash/debounce";
import {getEnv, umaEvent} from "../../../../uma.config";

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
        authCodeCounter: 0
    },

    onLoad: function (options) {
        this.loadSection();
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

    onSticky(e){
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
            isEmpty: false
        })
    },

    onKeywordInput: debounce(function (e) {
        const {value} = e.detail;
        this.setData({
            keyword: e.detail.value,
            page: 0,
            isEmpty: false
        }, ()=>{
            if(value) this.loadSearch()
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
                const umaConfig = umaEvent.searchKeyword;
                wx.uma.trackEvent(umaConfig.tag, {content: `${umaConfig.content}${keyword}`, count: `${umaConfig.count}${res.length}`, env: getEnv(wx)});
                if(res.length === 0 && page === 0) {
                    that.setData({
                        isEmpty: true
                    })
                }
                if(res.length){
                    that.setData({
                        searchRes: [...searchRes, ...res],
                        page: page + 1
                    })
                } else {
                    app.toast('已为您加载所有相关内容')
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
        this.clear();
    },

    goToEvaluationDetail(e) {
        const umaConfig = umaEvent.evaluationDetail;
        const {evaluationId, sectionName, evaluationName} = e.currentTarget.dataset;
        const type = sectionName === '最新上架' ? 'showcase' : 'hot';
        wx.navigateTo({
            url: `/pages/station/components/detail/detail?id=${evaluationId}`
        });
        wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin[type], env: getEnv(wx)});
        {
            const isHot = sectionName === '热门测评';
            if(isHot){
                const umaConfig = umaEvent.searchGetInHotMore;
                wx.uma.trackEvent(umaConfig.tag, {name: `${umaConfig.name}`, env: getEnv(wx)});
            } else {
                const umaConfig = umaEvent.searchGetInShowcaseMore;
                wx.uma.trackEvent(umaConfig.tag, {name: `${umaConfig.name}`, env: getEnv(wx)});
            }
        }
    },

    goToMore(e) {
        const {sectionId, sectionName, moreType} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/home/subpages/section/section?sectionId=${sectionId}`
        })
        if(sectionName){
            const umaConfig = umaEvent.searchGetInTypeByHome;
            wx.uma.trackEvent(umaConfig.tag, {name: `${umaConfig.name}${sectionName}`, env: getEnv(wx)});
        } else {
            if(moreType === '最新上架'){
                const umaConfig = umaEvent.searchGetInShowcaseMore;
                wx.uma.trackEvent(umaConfig.tag, {name: `${umaConfig.name}最新上架`, env: getEnv(wx)});
            } else {
                const umaConfig = umaEvent.searchGetInHotMore;
                wx.uma.trackEvent(umaConfig.tag, {name: `${umaConfig.name}${moreType}热门测评`, env: getEnv(wx)});
            }
        }
    },

    goToCustomerService(e) {
        const {isEmpty} = e.currentTarget.dataset;
        if(isEmpty){
            const umaConfig = umaEvent.customerService;
            wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin.search, env: getEnv(wx)});
        }
        wx.navigateTo({
            url: '/pages/customer-service/customer-service'
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
            wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin.search, env: getEnv(wx)});
        }).catch(err=>{
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
