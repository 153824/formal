const app = getApp();
Page({
    data: {},
    onLoad: function (options) {
        const that = this;
        app.doAjax({
            url: 'release_records',
            method: 'get',
            data: {
                isEE: app.wxWorkInfo.isWxWork,
            },
            success: function (res) {
                that.setData({
                    evaluationTrack: res
                });
            }
        })
    },
});
