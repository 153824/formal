const app = getApp();
Page({
    data: {
        isGetAccessToken: app.checkAccessToken(),
        authCodeCounter: 0
    },
    onLoad: function (options) {},
    getPhoneNumber(e) {
        const that = this;
        let {authCodeCounter} = this.data;
        if(authCodeCounter > 5){
            return;
        }
        app.getAccessToken(e).then(res=>{
            this.goBack();
        }).catch(err=>{
            if(err.code === '401111'){
                app.prueLogin().then(res=>{
                    this.getPhoneNumber(e)
                });
                that.setData({
                    authCodeCounter: authCodeCounter++
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
