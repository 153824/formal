const app = getApp()
Page({
    data: {
        appTitle:'',
        liner: 'transparent',
    },
    onLoad: function (options) {
        this.getAppTitle()
    },
    async wxAuthLogin(e) {
        app.getAccessToken(e).then(res=>{
            wx.switchTab({
                url: '/pages/work-base/work-base'
            })
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
