const app = getApp();
Page({
    data: {},
    onLoad: function (options) {
        const that = this;
        app.doAjax({
            url: `reports`,
            method: "get",
            data: {
                isEE: true,
            },
            success: function (res) {
                that.setData({
                    moreReportsList: res
                })
            }
        })
    }
});
