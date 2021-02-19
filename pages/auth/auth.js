const app = getApp()
Page({
    data: {},
    onLoad: function (options) {},
    wxAuthLogin(e) {
        const that = this;
        app.updateUserMobileByWeWork(e).then(res => {
            return that.wxAuthUserInfo()
        }).then(res => {
            return that.getUserAuth(res)
        }).then(res => {
            wx.switchTab({
                url: "/pages/work-base/work-base"
            });
        }).catch(err => {
            console.error(err);
            app.toast('授权手机号失败')
        })
    },
    wxAuthUserInfo() {
        const userInfoPromise = new Promise((resolve, reject) => {
            wx.getUserInfo({
                success: result => {
                    resolve(result)
                },
                fail: err => {
                    reject(err)
                }
            })
        });
        return userInfoPromise;
    },
    getUserAuth(e) {
        return app.getUserAuth(e)
    }
});
