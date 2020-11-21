const app = getApp();
Component({
    data: {
        wxPage: [
            {
                text: "主页",
                normal: '../../images/icon/icon@index-no-active.png',
                active: '../../images/icon/icon@index-active.png',
                path: "/pages/home/home"
            },
            {
                text: "人岗匹配",
                normal: '../../images/icon/icon@person-job-no-active.png',
                active: '../../images/icon/icon@person-job-active.png',
                path: "/pages/station/station"
            },
            {
                text: "工作台",
                normal: '../../images/icon/icon@evaluation-manager-no-active.png',
                active: '../../images/icon/icon@evaluation-manager-active.png',
                path: "/pages/work-base/work-base"
            },
            {
                text: "个人中心",
                normal: '../../images/icon/icon@my-no-active.png',
                active: '../../images/icon/icon@my-active.png',
                path: "/pages/user-center/user-center"
            }
        ],
        wxWorkPage: {
            admin: [
                {
                    text: "工作台",
                    normal: '../../images/icon/icon@evaluation-manager-no-active.png',
                    active: '../../images/icon/icon@evaluation-manager-active.png',
                    path: "/pages/work-base/work-base"
                },
                {
                    text: "我的",
                    normal: '../../images/icon/icon@my-no-active.png',
                    active: '../../images/icon/icon@my-active.png',
                    path: "/pages/user-center/user-center"
                },
            ],
            member: [
                {
                    text: "测评任务",
                    normal: '../../images/icon/icon@evaluation-manager-no-active.png',
                    active: '../../images/icon/icon@evaluation-manager-active.png',
                    path: "/pages/work-base/work-base"
                },
                {
                    text: "个人中心",
                    normal: '../../images/icon/icon@my-no-active.png',
                    active: '../../images/icon/icon@my-active.png',
                    path: "/pages/user-center/user-center"
                },
            ]
        },
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
    },
    properties: {
        active: {
            type: Number,
            value: 0
        },
        morePath: {
            type: "String",
            value: ""
        }
    },
    methods: {
        onChange(event) {
            const that = this;
            const {isWxWork, isWxWorkAdmin} = this.data;
            const active = Number(event.detail);
            if (!isWxWork) {
                wx.switchTab({
                    url: `${that.data.wxPage[active].path}`
                });
                try {
                    wx.uma.trackEvent("1601368351375", {"导航栏名称": `${that.data.wxPage[active].text}`});
                } catch (e) {
                    console.error("tab-bar.js -> 85", e)
                }
            } else if (isWxWork && isWxWorkAdmin) {
                wx.switchTab({
                    url: `${that.data.wxWorkPage.admin[active].path}`
                });
            } else {
                try {
                    wx.switchTab({
                        url: `${that.data.wxWorkPage.member[active].path}`
                    });
                } catch (e) {

                }
            }
        },
    },
    pageLifetimes: {
        show: function () {
            const that = this;
            if (!app.globalData.userInfo && !wx.getStorageSync("userInfo")) {
                app.checkUserInfo = (userInfo) => {
                    that.setData({
                        isWxWork: userInfo.isWxWork,
                        isWxWorkAdmin: userInfo.isAdmin,
                    });
                }
            } else {
                that.setData({
                    isWxWork: app.wxWorkInfo.isWxWork,
                    isWxWorkAdmin: wx.getStorageSync("userInfo").isAdmin || app.wxWorkInfo.isWxWorkAdmin,
                });
            }
            wx.createSelectorQuery().in(this).select("#tabbar").boundingClientRect().exec(res => {
                wx.setStorageSync("TAB_BAR_HEIGHT", res[0].height)
            });
        }
    },
    lifetimes: {
        ready() {
        },
        created() {

        },
        attached() {
            const that = this;
            if (!app.globalData.userInfo && !wx.getStorageSync("userInfo")) {
                app.checkUserInfo = (userInfo) => {
                    that.setData({
                        isWxWork: userInfo.isWxWork,
                        isWxWorkAdmin: userInfo.isAdmin,
                    });
                }
            } else {
                that.setData({
                    isWxWork: app.wxWorkInfo.isWxWork,
                    isWxWorkAdmin: wx.getStorageSync("userInfo").isAdmin || app.wxWorkInfo.isWxWorkAdmin,
                });
            }
        }
    }
});
