Component({
    properties: {
        evaluationId: String,
        title: String,
        topic: String,
        tip: String,
        cover: String,
        tag: String,
        isRichTextModel: {
            type: Boolean,
            default: false
        }
    },
    data: {},
    methods: {
        goToEvaluationDetail(e) {
            const {evaluationId} = e.currentTarget.dataset;
            wx.navigateTo({
                url: `/pages/station/components/detail/detail?id=${evaluationId}`
            })
        }
    }
});
