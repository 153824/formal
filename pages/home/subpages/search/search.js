Page({
    data: {
        keyword: '销售',
        scrollTop: 0,
        offsetTop: 0,
        isFixed: false,
        isEmpty: false
    },

    onLoad: function (options) {

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
});
