const app = getApp();
Page({
    data: {
        choose: [
            {
                text: "我想了解员工心理健康状态/任职风险",
                type: "risk"
            },
            {
                text: "我想测试员工的岗位胜任力",
                type: "social"
            },
            {
                text: "我想开展人才盘点",
                type: "brain"
            },
            {
                text: "我想快速筛选校招中的高潜人才",
                type: "school"
            },
        ],
        authCodeCounter: 0
    },
    onLoad: function (options) {
        wx.uma.trackEvent("1607407387531")
    },
    onHide() {
        wx.uma.trackEvent("1606213423182")
    },
    goToHome: function () {
        try {
            wx.uma.trackEvent('1605250635742');
        } catch (e) {
            console.error(e);
        }
        wx.switchTab({
            url: "/pages/home/home"
        })
    },
    getPhoneNumber: function (e) {
        const that = this;
        let {authCodeCounter} = this.data;
        const {type} = e.currentTarget.dataset;
        let url = `/pages/home/components/more/more?type=${type}`;
        this.setData({
            active: type
        });
        try {
            wx.uma.trackEvent('1605250635743');
        } catch (e) {
            console.error(e);
        }
        if(authCodeCounter > 5){
            return;
        }
        app.getAccessToken(e).then(res=>{
            that.getNewerTicket();
            try {
                wx.uma.trackEvent('1605250635744');
            } catch (e) {
                console.error(e);
            }
            switch (type) {
                case "school":
                    try {
                        wx.uma.trackEvent('1605250635738');
                    } catch (e) {
                        console.error(e);
                    }
                    break;
                case "social":
                    try {
                        wx.uma.trackEvent('1605250635739');
                    } catch (e) {
                        console.error(e);
                    }
                    break;
                case "brain":
                    try {
                        wx.uma.trackEvent('1605250635740');
                    } catch (e) {
                        console.error(e);
                    }
                    break;
                case "risk":
                    try {
                        wx.uma.trackEvent('1605250635741');
                    } catch (e) {
                        console.error(e);
                    }
                    break;
            }
            wx.navigateTo({
                url: url,
            });
        }).catch(err=>{
            that.setData({
                active: ""
            });
            try {
                wx.uma.trackEvent('1605250635745');
            } catch (e) {
                console.error(e);
            }
            if(err.code === '40111'){
                app.getAuthCode().then(res=>{
                    this.getPhoneNumber(e)
                });
                that.setData({
                    authCodeCounter: authCodeCounter++
                })
            }
            console.error(err);
        });
    },

    getNewerTicket: function (e) {
        app.doAjax({
            url: "drawNoviceVoucher",
            method: "post",
            data: {},
            success: function (ret) {
                app.toast("恭喜！成功领取新人券");
            },
            error: function (res) {
                app.toast(res.msg);
            }
        });
    },

});
