import {getEnv, getTag, Tracker, umaEvent} from "../../uma.config";
import {loadSubscriber} from "../../api/home";

const app = getApp();
Page({
    data: {
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.checkAdmin(),
        isWxWorkSuperAdmin: app.checkSuperAdmin(),
        is3rd: app.wx3rdInfo.is3rd,
        is3rdAdmin: app.checkAdmin(),
        userBaseInfo: {},
        isGetAccessToken: app.checkAccessToken(),
        isGetUserInfo: false,
        canIUseGetUserProfile: !!wx.getUserProfile ? true : false,
        version: wx.getAccountInfoSync().miniProgram.version,
        subscriberInfo: {
            activated: false,
            hide: false,
            owned: false,
        }
    },
    onLoad: function (options) {
        app.setDataOfPlatformInfo(this);
    },
    async onShow() {
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
        await this.getSubscriber()
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
    goToTicketCenter() {
        wx.navigateTo({
            url: "/pages/user-center/components/ticket-center/ticket-center"
        })
    },
    goToSetting() {
        if(!app.checkAccessToken()){
            wx.navigateTo({
                url: '/pages/auth/auth?type=auth'
            })
        }
        wx.navigateTo({
            url: "/pages/user-center/components/setting/setting"
        })
    },
    getUserInfo: function(e) {
        app.updateUserInfo(e).then(res=>{
            const umaConfig = umaEvent.authUserInfoSuccess;
            try{
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.mine});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
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
                    const umaConfig = umaEvent.authUserInfoSuccess;
                    try{
                        new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.mine});
                    }
                    catch (e) {
                        console.log('友盟数据统计',e);
                    }
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
    goToServing: function () {
        try {
            const umaConfig = umaEvent.customerService;
            new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.mine});
        }
        catch (e) {
            console.log("友盟数据统计：", e)
        }
        app.openContactService()
    },

    goToFree() {
        wx.navigateTo({
            url: '/pages/home/subpages/free/free'
        })
    },

    getFree() {

    },

    async getSubscriber(token) {
        const {activated, hide, owned} = await loadSubscriber({accessToken: token})
        this.setData({
            subscriberInfo: {activated, hide, owned}
        })
    },
});
