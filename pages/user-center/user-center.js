const app = getApp();
Page({
    data: {
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
        userInfo: wx.getStorageSync("userInfo") || wx.getStorageSync("USER_DETAIL") || app.globalData.userInfo || app.globalData.userMsg
    },
    onLoad: function (options) {
        const {isWxWork, isWxWorkAdmin} = this.data;
        this.setData({
            isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
            userInfo: wx.getStorageSync("userInfo") || wx.getStorageSync("USER_DETAIL") || app.globalData.userInfo || app.globalData.userMsg
        });
        if (!isWxWork) {
        } else if (isWxWork && isWxWorkAdmin) {

        } else if (isWxWork && !isWxWorkAdmin) {

        }

    },
    onShow() {
        this.setData({
            userInfo:  wx.getStorageSync("userInfo") || wx.getStorageSync("USER_DETAIL") || app.globalData.userInfo || app.globalData.userMsg,
            isWxWork: app.wxWorkInfo.isWxWork,
            isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
        })
    },
    goToReceiveReports: function () {
        wx.navigateTo({
            url: './components/receive-reports/receive-reports'
        })
    },
    goToReceiveEvaluation: function () {
        wx.navigateTo({
            url: '/pages/user-center/components/receive-evaluations/receive-evaluations'
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
    },
    getUserInfo: function(e) {
        const that = this;
        app.getUserAuth(e).then(res=>{
            const userInfo = Object.assign({},app.globalData.userInfo);
            that.setData({
                userInfo: wx.getStorageSync("userInfo") || userInfo
            });
            app.addNewTeam(that.onShow);
            that.onShow();
        }).catch(err=>{
            console.error(err)
        })
    },
    showServing: function () {
        this.selectComponent('#serving').callServing();
    }
});
