const app = getApp()
Page({
    data: {},
    onLoad: function (options) {},
    goToRebind() {
        const verifyType = 'bound';
        const {isWxWork} = app.wxWorkInfo;
        const url = isWxWork ? `/pages/account/account?verifyType=${verifyType}` : '/pages/auth/auth?type=auth';
        wx.navigateTo({
            url: `/pages/account/account?verifyType=${verifyType}`
        })
    },
    showServing: function () {
        this.selectComponent('#serving').callServing();
    }
});
