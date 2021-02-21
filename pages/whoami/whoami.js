const app = getApp();
Page({
    data: {
        isGetAccessToken: app.checkAccessToken()
    },
    onLoad: function (options) {},
    getPhoneNumber(e) {
        app.getAccessToken(e).then(res=>{
            this.goBack();
        }).catch(err=>{})
    },
    goBack(){
        wx.navigateBack({
            delta: -1
        })
    }
});
