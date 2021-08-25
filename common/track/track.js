const app = getApp()
Component({
    properties: {
        evaluationTrack: {
            type: Array,
            value: []
        }
    },
    data: {
        page: 1,
        windowHeight: 0,
        pixelRate: app.globalData.pixelRate
    },
    methods: {
        goToTrackDetail: function (e) {
            const { releaseRecordId } = e.currentTarget.dataset;
            wx.navigateTo({
                url: `/pages/work-base/components/grant/grant?releaseRecordId=${releaseRecordId}`,
            })
        },
        loadEvaluationTrack: function (page) {
            const that = this;
            const {evaluationTrack} = this.data;
            if(!page){
                page = this.data.page;
            }
            app.doAjax({
                url: 'release_records',
                method: 'get',
                data: {
                    isEE: app.wxWorkInfo.isWxWork,
                    page: page,
                    pageSize: 8
                },
                success: function (res) {
                    that.setData({
                        evaluationTrack: evaluationTrack.concat(res.data),
                    });
                    if(res.data.length){
                        that.setData({
                            page
                        })
                    }
                }
            })
        },
        nextPage: function () {
            let {page} = this.data;
            page++;
            this.loadEvaluationTrack(page);
        }
    },
    lifetimes: {
        attached() {
            const systemInfo = wx.getSystemInfoSync();
            this.setData({
                evaluationTrack: this.properties.evaluationTrack,
                windowHeight: systemInfo.windowHeight
            })
        }
    }
});
