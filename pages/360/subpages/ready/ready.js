const app = getApp()
Page({
    data: {
        surveyInfo: {
            name: '',
            fbEId: '',
            surveyId: '',
        },
        targetList: []
    },
    onLoad: function (options) {
        const surveyInfo = JSON.parse(options.surveyInfo)
        this.setData({
            surveyInfo: surveyInfo
        })
    },
    onShow() {
        this.getTargetList().then(res => {
            this.setData({
                targetList: res
            })
        }).catch(err => {
            console.error(err)
        })
    },
    start() {
        const surveyInfo = JSON.stringify(this.data.surveyInfo)
        wx.navigateTo({
            url: `/pages/360/subpages/replying/replying?surveyInfo=${surveyInfo}`
        })
    },
    getTargetList() {
        const {surveyId} = this.data.surveyInfo;
        const target = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/360/surveys/${surveyId}/targets`,
                method: 'get',
                success(res) {
                    resolve(res)
                },
                error(err) {
                    reject(err)
                }
            })
        });
        return target;
    }
});
