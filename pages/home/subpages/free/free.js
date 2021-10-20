const {getFreeEvaluation} = require("../../../../api/home");
Page({
    data: {
        columnId: '616e89add045b16da4f09987',
        evaluations: [],
        page: 1,
        size: 10
    },
    onLoad: async function (options) {
        await this.loadEvaluation()
    },
    async loadEvaluation() {
        const data = {
            columnId: this.data.columnId,
            page: 1,
            size: 10
        }
        const res = await getFreeEvaluation(data)
        this.setData({
            evaluations: [...res]
        })
    },
    async next() {
        const {evaluations, page, size} = this.data;
        const data = {
            columnId: this.data.columnId,
            page: page + 1,
            size
        }
        const res = await getFreeEvaluation(data) || []
        if(res.length) {
            this.setData({
                evaluations: [...evaluations, ...res],
                page: page + 1,
            })
        }
    }
});
