const app = getApp();
Page({
    data: {
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
    },
    onLoad: function (options) {
        const {isWxWork, isWxWorkAdmin} = this.data;
        if (!isWxWork) {

        } else if (isWxWork && isWxWorkAdmin) {

        } else if (isWxWork && !isWxWorkAdmin) {

        }
    },
    goToReceiveReports: function () {
        wx.navigateTo({
            url: './components/receive-reports/receive-reports'
        })
    },
    goToReceiveEvaluation: function () {
        wx.navigateTo({
            url: './components/receive-evaluations/receive-evaluations'
        })
    }
});
