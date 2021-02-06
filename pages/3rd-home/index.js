const app = getApp()
Page({
    data: {},
    onLoad: function (options) {

    },
    wxAuthLogin(e) {
        console.log(app);
        app.updateUserMobileByWeWork(e).then(res=>{
            wx.switchTab({
                url: "/pages/work-base/work-base"
            });
        }).catch(err=>{
            console.error(err);
            app.toast('授权手机号失败')
        })
    }
});
