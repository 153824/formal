const app = getApp();
Page({
    data: {
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.checkAdmin(),
        is3rd: app.wx3rdInfo.is3rd,
        is3rdAdmin: app.checkAdmin(),
        userBaseInfo: {},
        isGetAccessToken: app.checkAccessToken()
    },
    onLoad: function (options) {
        app.setDataOfPlatformInfo(this);
        app.getUserInformation().then(res=>{
            if(res.avatar || res.nickname){
                this.setData({
                    userBaseInfo: res
                })
            }
        }).catch(err=>{
            console.error(err)
        })

    },
    onShow() {
        app.setDataOfPlatformInfo(this);
    },
    goToReceiveReports: function () {
        wx.navigateTo({
            url: './components/receive-reports/receive-reports'
        })
    },
    goToReceiveEvaluation: function () {
        wx.navigateTo({
            url: '/pages/user-center/components/receive-evaluations/receive-evaluations'
        })
    },
    goToAddGroup: function () {
        wx.navigateTo({
            url: "/pages/user/components/addGroup/addGroup"
        })
    },
    goToServingClient: function () {
        wx.navigateTo({
            url: "/pages/user-center/components/serving-client/serving-client"
        })
    },
    goToSetting() {
        wx.navigateTo({
            url: "/pages/user-center/components/setting/setting"
        })
    },
    getUserInfo: function(e) {
        app.updateUserInfo(e).then(res=>{
            this.setData({
                userBaseInfo: res
            })
        }).catch(err=>{
            console.error(err)
        })
    },
    showServing: function () {
        this.selectComponent('#serving').callServing();
    }
});
