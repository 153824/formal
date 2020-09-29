const app = getApp();
Page({
    data: {
        active: 0,
        moreReportsList: [],
    },
    onLoad: function (options) {
        const that = this;
        const {shareAt,releaseRecordId,tabIndex} = options;
        app.doAjax({
            url: "release_records/accepted_list",
            method: 'get',
            success: function(res) {
                that.setData({
                    evaluationTrack: res
                })
            }
        });
    },
});
