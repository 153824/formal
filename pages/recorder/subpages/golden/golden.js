const app = getApp();
Page({
    data: {
        redirect: '',
        goldenText: ''
    },
    onLoad: function (options={redirect: {}}) {
        let redirect = JSON.parse(options.redirect)
        this.setData({
            redirect,
        })
        this.getGolden(redirect.receiveRecordId);
    },
    goToReplying() {
        const {url, evaluationId, receiveRecordId, isChapter} = this.data.redirect;
        const targetURL = isChapter ? `${url}?receiveRecordId=${receiveRecordId}&evaluationId=${evaluationId}` : `${url}?receiveRecordId=${receiveRecordId}`
        wx.redirectTo({
            url: targetURL
        });
    },
    getGolden(receiveRecordId) {
        const that = this;
        app.doAjax({
            url: `../wework/evaluations/${receiveRecordId}/synopsis`,
            method: 'GET',
            success(res) {
                that.setData({
                    goldenText: res.commitment
                })
            },
        })
    }
});
