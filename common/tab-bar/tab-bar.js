const app = getApp();
Component({
    data: {
        wxPage: [
            {
                text: "主页",
                normal: '../../images/icon/icon@index-no-active.png',
                active: '../../images/icon/icon@index-active.png',
                path: "../../pages/home/home"
            },
            {
                text: "人岗匹配",
                normal: '../../images/icon/icon@person-job-no-active.png',
                active: '../../images/icon/icon@person-job-active.png',
                path: "../../pages/station/station"
            },
            {
                text: "测评管理",
                normal: '../../images/icon/icon@evaluation-manager-no-active.png',
                active: '../../images/icon/icon@evaluation-manager-active.png',
                path: "../../pages/manager/manager"
            },
            {
                text: "个人中心",
                normal: '../../images/icon/icon@my-no-active.png',
                active: '../../images/icon/icon@my-active.png',
                path: "../../pages/user/user"
            }
        ],
        wxWorkPage: {
            admin: [
                {
                    text: "工作台",
                    normal: '../../images/icon/icon@index-no-active.png',
                    active: '../../images/icon/icon@index-active.png',
                    path: "../../pages/home/home"
                },
                {
                    text: "我的",
                    normal: '../../images/icon/icon@index-no-active.png',
                    active: '../../images/icon/icon@index-active.png',
                    path: "../../pages/home/home"
                },
            ],
            member: [
                {
                    text: "主页",
                    normal: '../../images/icon/icon@index-no-active.png',
                    active: '../../images/icon/icon@index-active.png',
                    path: "../../pages/home/home"
                },
            ]
        },
        WX_WORK: app.WX_WORK,
    },
    properties: {
        active: {
            type: Number,
            value: 0
        }
    },
    methods: {
        onChange(event) {
            const that = this;
            const active = Number(event.detail);
            wx.switchTab({
                url: `${that.data.wxPage[active].path}`
            });
        },
    },
    pageLifetimes: {
        onLoad: function () {
            const { active } = this.properties;
            this.setData({
                active
            });
        },
        onShow: function () {
            const { active } = this.properties;
            this.setData({
                active
            });
        }
    },
    lifetimes: {
        attached() {
            this.setData({
                WX_WORK: app.WX_WORK
            });
            console.log("app.WX_WORK: ",app.WX_WORK)
        }
    }
});
