const app = getApp();
Page({
    data: {
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
        userInfo: wx.getStorageSync("userInfo") || wx.getStorageSync("USER_DETAIL") || app.globalData.userInfo || app.globalData.userMsg
    },
    onLoad: function (options) {
        const {isWxWork, isWxWorkAdmin} = this.data;
        this.setData({
            isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
            userInfo: wx.getStorageSync("userInfo") || wx.getStorageSync("USER_DETAIL") || app.globalData.userInfo || app.globalData.userMsg
        });
        if (!isWxWork) {
            console.log("this.data.userInfo: ",this.data.userInfo)
        } else if (isWxWork && isWxWorkAdmin) {

        } else if (isWxWork && !isWxWorkAdmin) {

        }

    },
    onShow() {
        this.setData({
            userInfo:  wx.getStorageSync("userInfo") || wx.getStorageSync("USER_DETAIL") || app.globalData.userInfo || app.globalData.userMsg,
            isWxWork: app.wxWorkInfo.isWxWork,
            isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
        })
    },
    goToReceiveReports: function () {
        wx.navigateTo({
            url: './components/receive-reports/receive-reports'
        })
    },
    goToReceiveEvaluation: function () {
        // wx.navigateTo({
        //     url: '/pages/work-base/components/member-report-list/member-report-list?navigationText=0'
        // })
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
    getUserInfo: function(e) {
        var that = this;
        var userInfo = e.detail.userInfo;
        console.log("userInfo: ",userInfo);
        if (!userInfo) {
            console.error("获取用户资料失败", e);
            return;
        }
        userInfo["openid"] = wx.getStorageSync("openId") || app.globalData.userMsg.openid;
        app.doAjax({
            url: "updateUserMsg",
            method: "post",
            data: {
                data: JSON.stringify({
                    wxUserInfo: userInfo,
                    userCompany: {
                        name: userInfo.nickName + "的团队"
                    }
                }),
            },
            success: function(res) {
                res = res.data;
                const localUserInfo = wx.getStorageSync("userInfo");
                const localUserDetail = wx.getStorageSync("USER_DETAIL");
                app.globalData.userInfo = Object.assign(app.globalData.userInfo,localUserInfo,localUserDetail,res);
                wx.setStorageSync("userInfo",app.globalData.userInfo);
                wx.setStorageSync("USER_DETAIL",app.globalData.userInfo);
                const userInfo = Object.assign({},app.globalData.userInfo);
                that.setData({
                    userInfo: wx.setStorageSync("userInfo",app.globalData.userInfo) || userInfo
                });
                app.addNewTeam(that.onShow);
                that.onShow();
            }
        });
    },
});
