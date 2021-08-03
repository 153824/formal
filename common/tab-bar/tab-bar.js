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
            superAdmin: [
                {
                    text: "主页",
                    normal: '../../images/icon/icon@index-no-active.png',
                    active: '../../images/icon/icon@index-active.png',
                    path: "/pages/home/home"
                },
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
        wx3rdPage: {
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
        isWxWorkAdmin: app.checkAdmin(),
        isWxWorkSuperAdmin: app.checkSuperAdmin(),
        is3rd: app.wx3rdInfo.is3rd,
        is3rdAdmin: app.checkAdmin(),
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
            const {isWxWork, isWxWorkAdmin, isWxWorkSuperAdmin, is3rd, is3rdAdmin} = this.data;
            const active = Number(event.detail);
            if (!isWxWork && !is3rd) {
                wx.switchTab({
                    url: `${that.data.wxPage[active].path}`
                });
            } else if (isWxWork && isWxWorkAdmin && !isWxWorkSuperAdmin) {
                wx.switchTab({
                    url: `${that.data.wxWorkPage.admin[active].path}`
                });
            } else if (isWxWork && !isWxWorkAdmin && !isWxWorkSuperAdmin) {
                wx.switchTab({
                    url: `${that.data.wxWorkPage.member[active].path}`
                });
            } else if (isWxWork && isWxWorkAdmin && isWxWorkSuperAdmin) {
                wx.switchTab({
                    url: `${that.data.wxWorkPage.superAdmin[active].path}`
                });
            } else if (is3rd && is3rdAdmin){
                wx.switchTab({
                    url: `${that.data.wx3rdPage.admin[active].path}`
                });
            } else if (is3rd && !is3rdAdmin){
                wx.switchTab({
                    url: `${that.data.wx3rdPage.member[active].path}`
                });
            }
        },
    },
    pageLifetimes: {
        show: function () {
            app.setDataOfPlatformInfo(this);
            setTimeout(()=>{
                wx.createSelectorQuery().in(this).select("#tabbar").boundingClientRect().exec(res => {
                    wx.setStorageSync("TAB_BAR_HEIGHT", res[0].height)
                });
            }, 0);
        }
    },
    lifetimes: {
        ready() {
        },
        created() {

        },
        attached() {
            app.setDataOfPlatformInfo(this);
        }
    }
});
