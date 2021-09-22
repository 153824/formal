import debounce from "../../../../utils/lodash/debounce";
import {getEnv, getTag, Tracker, umaEvent} from "../../../../uma.config";

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
        let value = e.detail.value;
        value = value ? value : this.data.keyword;
        this.setData({
            page: 0,
            isEmpty: false,
            searchRes: [],
            isConfirm: true
        }, () => {
            if (value) this.loadSearch();
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
                try{
                    const umaConfig = umaEvent.searchByKeyword;
                    new Tracker(wx).generate(umaConfig.tag, {content: `${keyword}`, count: `${res.length}`,});
                }
                catch (e) {
                    console.log('友盟数据统计',e);
                }
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
        try{
            new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin[type], name: evaluationName});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
        {
            const isHot = sectionName === '热门测评';
            console.log({name: `${evaluationName}`, env: getEnv(wx), tag: getTag(wx)})
            if (isHot) {
                const umaConfig = umaEvent.searchGetInHotEvaluation;
                try{
                    new Tracker(wx).generate(umaConfig.tag, {name: `${evaluationName}`});
                }
                catch (e) {
                    console.log('友盟数据统计',e);
                }
            } else {
                const umaConfig = umaEvent.searchGetInShowcaseEvaluation;
                try{
                    new Tracker(wx).generate(umaConfig.tag, {name: `${evaluationName}`});
                }
                catch (e) {
                    console.log('友盟数据统计',e);
                }
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
            try{
                new Tracker(wx).generate(umaConfig.tag, {section: `${sectionName}`,});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        } else {
            if (moreType === '最新上架') {
                const umaConfig = umaEvent.searchGetInShowcaseMore;
                try{
                    new Tracker(wx).generate(umaConfig.tag);
                }
                catch (e) {
                    console.log('友盟数据统计',e);
                }
            } else {
                const umaConfig = umaEvent.searchGetInHotMore;
                try{
                    new Tracker(wx).generate(umaConfig.tag);
                }
                catch (e) {
                    console.log('友盟数据统计',e);
                }
            }
        }
    },

    goToCustomerService(e) {
        const {isEmpty} = e.currentTarget.dataset;
        if (isEmpty) {
            try{
                const umaConfig = umaEvent.customerService;
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.search});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
        app.openContactService()
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
            try{
                const umaConfig = umaEvent.authPhoneSuccess;
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.search});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
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
        if(authCodeCounter <= 0){
            try{
                const umaConfig = umaEvent.authPhoneCount;
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.search});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
    },
});
