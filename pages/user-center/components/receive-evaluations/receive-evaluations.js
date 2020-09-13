const app = getApp();
Page({
    data: {
        myEvaluation: []
    },
    onLoad: function (options) {
        const that = this;
        app.doAjax({
            url: 'receive_records',
            method: 'get',
            success: function (res) {
                that.setData({
                    evaluationTask: res
                });
            }
        });
    },
    onShow() {
        app.doAjax({
            url: 'receive_records',
            method: 'get',
            success: function (res) {
                that.setData({
                    evaluationTask: res
                });
            }
        });
    },
    goToAnswering: function (e) {
        const {evaluationTask} = this.data;
        const {receiveRecordId, evaluationId, evaluationIndex} = e.currentTarget.dataset;
        console.log(evaluationId);
        if (evaluationTask[evaluationIndex].status.toLowerCase() === 'finished') {
            app.toast("已完成！");
            return;
        }
        wx.navigateTo({
            url: `/pages/work-base/components/answering/answering?receiveRecordId=${receiveRecordId}&pid=${evaluationId}`
        })
    }
});
