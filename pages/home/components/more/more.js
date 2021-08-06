import {getEnv, getTag, umaEvent} from "../../../../uma.config";

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

    },
    onHide() {
        const {type} = this.data;

    },
    goBack() {
        const {type} = this.data;
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
        const {type} = this.data;
        this.goToCustomerService();
        const umaConfig = umaEvent.customerService;
        wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin[type], env: getEnv(wx), tag: getTag(wx)});
    },
    goToCustomerService() {
        wx.navigateTo({
            url: '/pages/customer-service/customer-service',
        });
    }
});
