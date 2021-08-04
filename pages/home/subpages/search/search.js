import debounce from "../../../../utils/lodash/debounce";
import {umaEvent} from "../../../../uma.config";

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
        size: 10
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
        })
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
        const {evaluationId} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/station/components/detail/detail?id=${evaluationId}`
        })
    },

    goToMore(e) {
        const {sectionId} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/home/subpages/section/section?sectionId=${sectionId}`
        })
    },

    goToCustomerService(e) {
        const {isEmpty} = e.currentTarget.dataset;
        if(isEmpty){
            const umaConfig = umaEvent.customerService;
            wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin.search});
        }
        wx.navigateTo({
            url: '/pages/customer-service/customer-service'
        })
    },

});
