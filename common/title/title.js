// common/title/title.js
const app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        url: {
            type: String,
            value: "index/index"
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        statusbarHeight: app.globalData.statusbarHeight,
        titleHeight: app.globalData.titleHeight,
        showDlg: false,
        teamId: "",
        isIos: false,
        showLogin: false,
        vip0: false,
        vip1: false,
        vip2: false,
        vip3: false,
        vip4: false,
        showAddNewTeam: false,
        userInfo: app.globalData.userInfo,
        teamNames: []
    },

    /**
     * 组件的方法列表
     */
    methods: {
        loadUserMsg: function () {
            var userData = app.globalData.userInfo || wx.getStorageSync("userInfo");
            var teamData = app.globalData.team || userData;
            this.setData({
                userInfo: userData
            });
            this.getMyTeamList();
        },
        changePage: function (e) { //页面跳转
            var d = e.currentTarget.dataset;
            if (d.n && d.n == "teams") {
                //企业认证
                wx.setStorageSync("oldTeamMsg", this.data.nowTeam.certConfig);
            }
            app.changePage(d.url, d.tab);
        },
        /**
         * 获取微信用户信息
         */
        getUserInfo: function (e) {
            var that = this;
            var userInfo = e.detail.userInfo;
            if (!userInfo) {
                console.error("获取用户资料失败", e);
                return;
            }
            userInfo["openid"] = wx.getStorageSync("openId") || app.globalData.userMsg.openid;
            userInfo["unionid"] = wx.getStorageSync("unionId") || app.globalData.userMsg.unionid;
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
                success: function (res) {
                    let info = that.data.userInfo;
                    that.hideLoginDlg();
                    app.globalData.userInfo.nickname = userInfo.nickName;
                    const isBindPromise = new Promise(function (resolve, reject) {
                        resolve(app.addNewTeam(app.getUserInfo(that.loadUserMsg)));
                    });
                    isBindPromise.then(() => {
                        info.isBind = true;
                        that.setData({
                            userInfo: info
                        });
                        that.getMyTeamList();
                    }).catch((err) => {
                        console.error(err);
                    })
                }
            });
        },
        /**
         * 显示登陆弹窗
         */
        showLoginDlg: function (e) {
            this.setData({
                showLogin: true
            });
        },
        /**
         * 隐藏登陆弹窗
         */
        hideLoginDlg: function (e) {
            this.setData({
                showLogin: false
            });
        },
        /**
         * 获取团队列表
         */
        getMyTeamList: function (e) {
            var that = this;
            app.getMyTeamList(function (list) {
                var teamNames = [];
                list.forEach(function (node) {
                    teamNames.push(node.name);
                });
                that.setData({
                    teamId: app.teamId,
                    teamRole: app.teamRole,
                    nowTeam: list[0],
                    teamList: list,
                    selTeam: 0,
                    teamNames: teamNames
                });
            });
        },
        /**
         * 切换团队
         */
        changeTeam: function (e) {
            var that = this;
            var val = e.detail.value;
            var data = this.data;
            var teamList = data.teamList;
            var nowTeam = teamList[val];
            if (!nowTeam) {
                //创建新团队
                this.setData({
                    showAddNewTeam: true
                });
                return;
            }
            app.teamId = nowTeam.objectId;
            app.teamName = nowTeam.name;
            app.teamRole = nowTeam.role;
            app.globalData.team = nowTeam;
            app.globalData.selTeam = val;
            wx.setStorageSync("myTeamId", app.teamId);
            this.setData({
                nowTeam: nowTeam,
                selTeam: val,
                teamId: app.teamId,
                teamRole: app.teamRole,
            });
            this.loadUserMsg();
            wx.switchTab({
                url: `../${that.properties.url}`,
                success: function (e) {
                    var page = getCurrentPages().pop();
                    if (page === "undefined" || page === "null") {
                        return;
                    }
                    page.onShow();
                }
            })
        },
        /**
         * 退出团队
         */
        outTeam: function () {
            var that = this;
            wx.showModal({
                title: '退出团队提醒',
                content: '确认退出该团队？',
                success: function (ret) {
                    if (ret.confirm) {
                        app.doAjax({
                            url: "updateTeamMember",
                            data: {
                                id: app.teamId,
                                type: 7
                            },
                            method: "POST",
                            success: function () {
                                that.onShow();
                            }
                        });
                    }
                }
            });
        },
        /**
         * 显示权限说明弹窗
         */
        toShowDlg: function () {
            this.setData({
                showDlg: true
            });
        },
        /**
         * 隐藏权限说明弹窗
         */
        hideDlg: function () {
            this.setData({
                showDlg: false
            });
        },
        _this: function () {
            return this;
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
    }
});
