const app = getApp();
Page({
    data: {
        moreEvaluationTrack: []
    },
    onLoad: function (options) {
        const that = this;
        app.doAjax({
            url: 'release_records',
            method: 'get',
            data: {
                isEE: true,
                page: 1,
                pageSize: 4,
            },
            success: function (res) {
                that.setData({
                    moreEvaluationTrack: res
                });
            }
        })
    },
    goToTrackDetail: function (e) {
        const { trackId,trackIndex } = e.currentTarget.dataset;
        const trackInfo = JSON.stringify(this.data.moreEvaluationTrack[trackIndex]);
        wx.navigateTo({
            url: `/pages/work-base/components/track-detail/track-detail?trackId=${trackId}&trackInfo=${trackInfo}`,
        })
    }
});
