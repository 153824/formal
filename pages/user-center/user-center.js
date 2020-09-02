const app = getApp();
Page({
    data: {
        active: 1,
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
    },
    onLoad: function (options) {
        this.setData({
            isWxWork: app.wxWorkInfo.isWxWork,
            isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
        });
    }
});
