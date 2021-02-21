/***********************************************************************************************************************
 * @NAME: WEID       /       @DATE: 2020/8/27      /       @DESC: 变量注释模板(新增变量务必添加)
 * statusbarHeight: 系统状态栏高度
 * titleHeight: 小程序标题栏高度
 * teamId: 团队ID
 * isIos: 是否为IOS
 * userInfo: 用户基本信息
 * teamNames: 团队名称队列
 * ********************************************************************************************************************/
const app = getApp();
Component({
    properties: {
        url: {
            value: "",
            type: String,
        },
        type: {
            value: "status-bar",
            type: String
        },
        liner: {
            value: "liner-lightgreen",
            type: String,
        },
        time: {
            value: 0,
            type: String
        },
        moreType: {
            value: "",
            type: String
        }
    },
    data: {
        statusbarHeight: app.globalData.statusbarHeight,
        titleHeight: app.globalData.titleHeight,
        teamId: "",
        isIos: false,
        showAddNewTeam: false,
        userInfo: app.globalData.userInfo,
        teamNames: [],
        loading: false,
        titleLoading: true,
        visibility: (() => {
            if (wx.getStorageSync('userInfo') && wx.getStorageSync('userInfo').tokenInfo && wx.getStorageSync('userInfo').tokenInfo.accessToken) {
                return 'visible';
            } else {
                return 'hidden';
            }
        })(),
        teamMap: [],
        checkedTeam: 0
    },
    methods: {
        getTeamList() {
            app.getTeamList().then(res => {
                let checkedTeam = 0;
                res.forEach((item, index) => {
                    if(item.isLoginTeam){
                        checkedTeam = index;
                    }
                });
                this.setData({
                    teamMap: res,
                    checkedTeam
                })
            }).catch(err => {
                console.error(err);
            })
        },
        goToBack: function () {
            let text = "";
            let time = 0;
            const {moreType, startTime} = this.properties;
            switch (moreType) {
                case "school":
                    text = "校招选才";
                    try {
                        wx.uma.trackEvent('1605666894656');
                    } catch (e) {
                        console.error(e);
                    }
                    break;
                case "social":
                    text = "社招选才"
                    try {
                        wx.uma.trackEvent('1605666964014');
                    } catch (e) {
                        console.error(e);
                    }
                    break;
                case "brain":
                    text = "人才盘点";
                    try {
                        wx.uma.trackEvent('1605666990624');
                    } catch (e) {
                        console.error(e);
                    }
                    break;
                case "risk":
                    text = "风险识别";
                    try {
                        wx.uma.trackEvent('1605667029152');
                    } catch (e) {
                        console.error(e);
                    }
                    break;
            }
            if (startTime) {
                time = (new Date().getTime() - startTime) / 1000;
            }
            try {
                wx.uma.trackEvent('1605666844223', {name: text, time: time,});
            } catch (e) {
                console.error(e);
            }
            wx.switchTab({
                url: "/pages/home/home"
            })
        },
        goToPage: function () {
            const {url} = this.properties;
            wx.reLaunch({
                url
            })
        }
    },

    lifetimes: {
        created: function () {
            wx.getSystemInfoSync({
                success: res => {
                    this.setData({
                        statusbarHeight: res.statusBarHeight,
                    });
                }
            });
        }
    },
    pageLifetimes: {
        show() {
            if (wx.getStorageSync('userInfo') && wx.getStorageSync('userInfo').tokenInfo && wx.getStorageSync('userInfo').tokenInfo.accessToken) {
                this.getTeamList();
                this.setData({
                    visibility: 'visible',
                })
            }
        }
    }
});
