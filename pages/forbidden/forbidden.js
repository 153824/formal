const app = getApp();
Page({
    data: {
        isWxWork: app.wxWorkInfo.isWxWork
    },
    onLoad: function (options) {
        this.setData({
            isWxWork: app.wxWorkInfo.isWxWork
        });
        if(wx.canIUse("hideHomeButton")){
            wx.hideHomeButton();
        }
    }
});
