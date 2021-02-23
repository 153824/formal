const app = getApp()
Page({
    data: {
        appTitle:''
    },
    onLoad: function (options) {
        this.getAppTitle()
    },
    wxAuthLogin(e) {
        app.updateUserMobileByWeWork(e).then(res=>{
            wx.switchTab({
                url: "/pages/work-base/work-base"
            });
        }).catch(err=>{
            console.error(err);
            app.toast('授权手机号失败')
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
