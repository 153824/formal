const app = getApp();
Page({
    data: {
        keyword: '销售',
        scrollTop: 0,
        offsetTop: 0,
        isFixed: false,
        isEmpty: false,
        tagSection: [],
        typeSection: []
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
        this.setData({
            isFixed: e.detail.isFixed
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

    goToEvaluationDetail(e) {
        const {evaluationId} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/station/components/detail/detail?id=${evaluationId}`
        })
    }
});
