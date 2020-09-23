const app = getApp();
Page({
    data: {
        moreReportsList: [],
        page: 1
    },
    onLoad: function (options) {
        this.loadReportList()
    },

    loadReportList: function (page) {
        const that = this;
        const {moreReportsList} = this.data;
        if(!page){
            page = this.data.page;
        }
        app.doAjax({
            url: `reports`,
            method: "get",
            data: {
                isEE: app.wxWorkInfo.isWxWork,
                page: page
            },
            success: function (res) {
                that.setData({
                    moreReportsList: moreReportsList.concat(res.data),
                    page
                })
            }
        })
    },

    nextPage: function () {
        let page = this.data.page;
        page++;
        this.loadReportList(page);
    },
});
