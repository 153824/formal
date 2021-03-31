const app = getApp()
Page({
    data: {
        appTitle:'',
        liner: 'transparent',
        authCodeCounter: 0
    },
    onLoad: function (options) {
        this.getAppTitle()
    },
    wxAuthLogin(e) {
        const that = this;
        let {authCodeCounter} = this.data;
        if(authCodeCounter > 5){
            return;
        }
        app.getAccessToken(e).then(res=>{
            wx.switchTab({
                url: '/pages/work-base/work-base'
            })
        }).catch(err=>{
            if(err.code === '401111'){
                app.prueLogin().then(res=>{
                    this.wxAuthLogin(e)
                });
                that.setData({
                    authCodeCounter: authCodeCounter++
                })
            }
        })
    },
    getAppTitle() {
        const temptation = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/settings/${wx.getAccountInfoSync().miniProgram.appId}/app-name`,
                method: 'GET',
                success(res) {
                    resolve(res)
                },
                error(err) {
                    reject(err)
                }
            })
        });
        temptation.then(res => {
            this.setData({
                appTitle: res
            })
        })
    }
});
