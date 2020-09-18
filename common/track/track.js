Component({
    properties: {
        evaluationTrack: {
            type: Array,
            value: []
        }
    },
    data: {},
    methods: {
        goToTrackDetail: function (e) {
            const { trackId,trackIndex } = e.currentTarget.dataset;
            const trackInfo = JSON.stringify(this.data.evaluationTrack[trackIndex]);
            wx.navigateTo({
                url: `/pages/work-base/components/track-detail/track-detail?trackId=${trackId}&trackInfo=${trackInfo}`,
            })
        }
    },
});
