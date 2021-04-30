const app = getApp();
Page({
    data: {
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.checkAdmin(),
        is3rd: app.wx3rdInfo.is3rd,
        is3rdAdmin: app.checkAdmin(),
        userBaseInfo: {},
        isGetAccessToken: app.checkAccessToken(),
        isGetUserInfo: false,
        canIUseGetUserProfile: !!wx.getUserProfile ? true : false
    },
    onLoad: function (options) {
        app.setDataOfPlatformInfo(this);
    },
    onShow() {
        app.setDataOfPlatformInfo(this);
        this.getUserInformation().then(res=>{
            if(res.avatar){
                this.setData({
                    userBaseInfo: res,
                    isGetUserInfo: true,
                });
                return
            }
            this.setData({
                isGetUserInfo: false,
            });
        }).catch(err=>{
            console.error(err)
        });
    },
    getUserInformation() {
        return app.getUserInformation()
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
            return this.getUserInformation()
        }).then(res=>{
            if(res.avatar){
                this.setData({
                    userBaseInfo: res,
                    isGetUserInfo: true,
                });
                return
            }
            this.setData({
                isGetUserInfo: false,
            });
        }).catch(err=>{
            console.error(err)
        })
    },
    getUserProfile() {
        const that = this
        wx.getUserProfile({
            desc: "获取用户信息",
            success: (res) => {
                app.updateUserInfo(res).then(res=>{
                    return that.getUserInformation()
                }).then(res=>{
                    if(res.avatar){
                        that.setData({
                            userBaseInfo: res,
                            isGetUserInfo: true,
                        });
                        return
                    }
                    that.setData({
                        isGetUserInfo: false,
                    });
                }).catch(err=>{
                    console.error(err)
                })
            },
            error: (e) => {
                console.log(e);
            },
            fail: (e) => {
                console.log(e);
            }
        })
    },
    showServing: function () {
        this.selectComponent('#serving').callServing();
    },
});
