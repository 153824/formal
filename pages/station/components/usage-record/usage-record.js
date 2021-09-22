Page({
    data: {
        evaluationId: ''
    },
    onLoad: function (options) {

    },
    goToEvaluationDetail() {
        const {evaluationId} = this.data;
        wx.navigateTo({
            url: `/pages/station/components/detail/detail?id=${evaluationId}`
        });
    },
    goToGenerate() {
        const necessaryInfo = {
            evaluationId: '',
            norms: '',
        };
        wx.navigateTo({
            url: `/pages/station/components/generate/generate?necessaryInfo=${JSON.stringify(necessaryInfo)}`,
        });
    }
});
