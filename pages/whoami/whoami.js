const app = getApp();
Page({
    data: {
        isGetAccessToken: app.checkAccessToken()
    },
    onLoad: function (options) {},
    getPhoneNumber(e) {
        app.getAccessToken(e).then(res=>{
            this.goBack();
        }).catch(err=>{
            if(err.code === '40111'){
                app.getAuthCode().then(res=>{
                    this.getPhoneNumber(e)
                })
            }
        })
    },
    goBack(){
        wx.navigateBack({
            delta: -1
        })
    }
});
