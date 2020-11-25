const app = getApp()
Page({
    data: {
        statusbarHeight: app.globalData.statusbarHeight,
        titleHeight: app.globalData.titleHeight,
        type: "",
        liner: "",
        startTime: 0
    },
    onLoad: function (options) {
        if (options && options.type) {
            let liner = "liner-lightpink";
            switch (options.type) {
                case "school":
                    liner = "liner-lightgreen";
                    break;
                case "social":
                    liner = "liner-lightpink";
                    break;
                case "brain":
                    liner = "liner-lightblue";
                    break;
                case "risk":
                    liner = "liner-lightorange";
                    break;
            }
            this.setData({
                type: options.type,
                liner: liner,
                startTime: new Date().getTime()
            });
            this._loadURLs(options.type);
        }
    },
    onShow() {
        try {
            wx.uma.trackEvent('1605666642970');
        } catch (e) {
            console.error(e);
        }
    },
    onHide() {
        const {type} = this.data;
        wx.uma.trackEvent("1606288433288",{
            type: type,
        });
    },
    goBack() {
        const {type} = this.data;
        switch (type) {
            case "school":
                try {
                    wx.uma.trackEvent('1605250635728');
                } catch (e) {
                    console.error(e);
                }
                break;
            case "social":
                try {
                    wx.uma.trackEvent('1605250635731');
                } catch (e) {
                    console.error(e);
                }
                break;
            case "brain":
                try {
                    wx.uma.trackEvent('1605250635734');
                } catch (e) {
                    console.error(e);
                }
                break;
            case "risk":
                try {
                    wx.uma.trackEvent('1605250635737');
                } catch (e) {
                    console.error(e);
                }
                break;
        }
        wx.switchTab({
            url: "/pages/home/home"
        })
    },
    _loadURLs: function (type) {
        const that = this;
        app.doAjax({
            method: "get",
            url: "guidance/urls",
            data: {
                type: type,
            },
            success: (res) => {
                const {general, url} = res;
                that.setData({
                    general: general,
                    url: url
                })
            }
        })
    },
    goToWebView: function (e) {
        const {general, url, type} = this.data;
        const targetURL = e.currentTarget.dataset.url;
        const isGeneral = targetURL === general ? true : false;
        switch (type) {
            case "school":
                if (isGeneral) {
                    try {
                        wx.uma.trackEvent('1605250635726');
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    try {
                        wx.uma.trackEvent('1605250635727');
                    } catch (e) {
                        console.error(e);
                    }
                }
                break;
            case "social":
                if (isGeneral) {
                    try {
                        wx.uma.trackEvent('1605250635729');
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    try {
                        wx.uma.trackEvent('1605250635730');
                    } catch (e) {
                        console.error(e);
                    }
                }
                break;
            case "brain":
                if (isGeneral) {
                    try {
                        wx.uma.trackEvent('1605250635732');
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    try {
                        wx.uma.trackEvent('1605250635733');
                    } catch (e) {
                        console.error(e);
                    }
                }
                break;
            case "risk":
                if (isGeneral) {
                    try {
                        wx.uma.trackEvent('1605250635735');
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    try {
                        wx.uma.trackEvent('1605250635736');
                    } catch (e) {
                        console.error(e);
                    }
                }
                break;
        }
        wx.setStorageSync("webView_Url", targetURL);
        wx.navigateTo({
            url: '/common/webView',
        });
    },
});
