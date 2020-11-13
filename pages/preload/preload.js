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
        ]
    },
    onLoad: function (options) {
    },
    goToHome: function () {
        try {
            wx.uma.trackEvent('1605250635742');
        } catch (e) {
            console.error(e);
        }
        wx.navigateTo({
            url: "/pages/home/home"
        })
    },
    getPhoneNumber: function (e) {
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
        let detail = e.detail;
        let iv = detail.iv;
        let encryptedData = detail.encryptedData;
        if (encryptedData) {
            let userMsg = app.globalData.userMsg || {};
            userMsg["iv"] = iv;
            userMsg["encryptedData"] = encryptedData;
            app.doAjax({
                url: "updatedUserMobile",
                data: userMsg,
                success: function (res) {
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
                    wx.redirectTo({
                        url: url,
                    });
                }
            });
        }else{
            try {
                wx.uma.trackEvent('1605250635745');
            } catch (e) {
                console.error(e);
            }
        }
    },
});
