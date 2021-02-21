const app = getApp();
Page({
    data: {
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
        is3rd: app.wx3rdInfo.is3rd,
        is3rdAdmin: app.wx3rdInfo.is3rdAdmin,
        userBaseInfo: {},
        isGetAccessToken: app.checkAccessToken()
    },
    onLoad: function (options) {
        const {isWxWork, isWxWorkAdmin, is3rd, is3rdAdmin} = this.data;
        this.setData({
            is3rdAdmin: app.wx3rdInfo.is3rdAdmin,
            isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
        });
        if (!isWxWork) {
        } else if (isWxWork && isWxWorkAdmin) {

        } else if (isWxWork && !isWxWorkAdmin) {

        }
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
        this.setData({
            isWxWork: app.wxWorkInfo.isWxWork,
            isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
            is3rd: app.wx3rdInfo.is3rd,
            is3rdAdmin: app.wx3rdInfo.is3rdAdmin,
            isGetAccessToken: app.checkAccessToken()
        })
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
