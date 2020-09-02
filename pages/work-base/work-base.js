const app = getApp();
Page({
    data: {
        shareId: "",
        active: 0,
        isLogin: false,
        loading: true,
        maskTrigger: false,
        reportListTrigger: false,
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin
    },

    onLoad: function(option={id:""}) {
        const { isWxWorkAdmin,isWxWork } = this;
        if( option.id ){
            app.shareId = option.id;
        }
        if( option.maskTrigger ){
            this.setData({
                maskTrigger: true
            })
        }
        if ( app.shareId && this.data.isWxWork ) { //跳转到答题界面
            wx.reLaunch({
                url: "./components/guide/guide?id=" + app.shareId
            });
            app.shareId = null;
            return;
        }
        const userInfo = wx.getStorageSync("userInfo");
        if (userInfo && userInfo.avatar) {
            this.setData({
                isLogin: true
            });
            if(isWxWork && !isWxWorkAdmin){
                this.setData({
                    reportListTrigger: true,
                });
            }
            return;
        }
    },

    getUserInfo: function(e) {
        var that = this;
        var userData = e.detail.userInfo;
        if (!userData) {
            wx.showModal({
                title: "授权失败",
                content: "需要授权后才可以开始答题或查看报告列表",
                showCancel: false,
                confirmText: "我知道了",
                confirmColor: "#0099ff"
            });
            return;
        }
        userData.openid = wx.getStorageSync("openId")
        app.doAjax({
            url: "updateUserMsg",
            method: "post",
            data: {
                data: JSON.stringify({
                    wxUserInfo: userData,
                    userCompany: {
                        name: userData.nickName + "的团队"
                    }
                })
            },
            success: function(res) {
                // console.log("updateUserMsg",res);
                var userData = res.data;
                if (0 == res.code) {
                    wx.hideLoading();
                    wx.setStorageSync("userInfo", userData);
                    wx.setStorageSync("openId", userData.openid);
                    wx.setStorageSync("unionId", userData.uid);
                    that.changePage();
                }
            }
        });
    },

    changePage: function(e) {
        var that = this;
        app.isTest = false;
        if (app.shareId) { //跳转到答题界面
            wx.reLaunch({
                url: "./components/guide/guide?id=" + app.shareId
            });
            app.shareId = null;
        } else {
            wx.reLaunch({
                url: "./components/report-list/report-list"
            });
        }
    },
    /**
     * 进入测评模拟测试
     */
    toTestIt: function(e) {
        app.isTest = true;
        wx.navigateTo({
            url: './components/guide/guide'
        });
    }
});
