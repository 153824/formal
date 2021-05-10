const app = getApp()
Page({
    data: {
        boundInfo: {}
    },
    onLoad: function (options) {
        this.setData({
            boundInfo: JSON.parse(options.boundInfo) || {}
        })
    },
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
