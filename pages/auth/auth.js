const app = getApp()
Page({
    data: {},
    onLoad: function (options) {},
    wxAuthLogin(e) {
        app.updateUserMobileByWeWork(e)
    }
});
