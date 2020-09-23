const app = getApp();
Page({
    data: {
        evaluationTrack: [],
        page: 1
    },
    onLoad: function (options) {
        this.loadEvaluationTrack();
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
                    page
                });
            }
        })
    },
    nextPage: function () {
        let page = this.data;
        page++;
        this.loadEvaluationTrack(page);
    }
});
