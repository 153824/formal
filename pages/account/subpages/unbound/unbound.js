Page({
    data: {},
    onLoad: function (options) {},
    goToRebind() {
        const verifyType = 'bound';
        wx.navigateTo({
            url: `/pages/account/account?verifyType=${verifyType}`
        })
    }
});
