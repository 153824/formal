const app = getApp();
Page({
    data: {
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
        userInfo: wx.getStorageSync("userInfo") || app.globalData.userInfo || app.globalData.userMsg
    },
    onLoad: function (options) {
        const {isWxWork, isWxWorkAdmin} = this.data;
        if (!isWxWork) {
            console.log("this.data.userInfo: ",this.data.userInfo)
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
    },
    goToAddGroup: function () {
        wx.navigateTo({
            url: "/pages/user/components/addGroup/addGroup"
        })
    },
    goToServingClient: function () {
        wx.navigateTo({
            url: "/pages/user-center/components/serving-client/serving-client"
        })
    }
});
