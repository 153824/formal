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
        titleLoading: true
    },
    methods: {
        /**
         * @Description:  加载用户信息,是否开启缓存
         * @author: WE!D
         * @name:  loadUserMsg
         * @args:  cacheTrigger为boolean控制是否开启缓存
         * @return:  none
         * @date: 2020/8/27
         */
        loadUserMsg: function (cacheTrigger = true,reLaunchTrigger) {
            const userData = app.globalData.userInfo || wx.getStorageSync("userInfo");
            this.setData({
                userInfo: userData
            });
            this.getMyTeamList(cacheTrigger,reLaunchTrigger);
        },

        /**
         * @Description:  获取团队列表
         * @author: WE!D
         * @name:  getMyTeamList
         * @args:  cacheTrigger为boolean控制是否开启缓存
         * @return:  none
         * @date: 2020/8/27
         */
        getMyTeamList: function (cacheTrigger, reLaunchTrigger = false) {
            const that = this;
            app.getMyTeamList(function (list) {
                const teamNames = [];
                list.forEach(function (node) {
                    teamNames.push(node.name);
                });
                app.teamName = list[0].name;
                that.setData({
                    teamId: app.teamId,
                    teamRole: app.teamRole,
                    nowTeam: list[0],
                    teamList: list,
                    selTeam: 0,
                    teamNames: teamNames,
                });
                if(reLaunchTrigger){
                    setTimeout(()=>{
                        wx.reLaunch({
                            url: `../../pages/${that.properties.url}?loadingTrigger=true`,
                        })
                    },500)
                }
                setTimeout(() => {
                    that.setData({
                        titleLoading: false
                    })
                }, 300)
            }, cacheTrigger);
        },

        /**
         * @Description:  切换团队
         * @author: WE!D
         * @name:  changeTeam
         * @args:  e视图层传参
         * @return:  none
         * @date: 2020/8/27
         */
        changeTeam: function (e) {
            const that = this;
            const {value} = e.detail;
            const {teamList} = this.data;
            const nowTeam = teamList[value];
            if (!nowTeam) {
                return;
            }
            app.teamId = nowTeam.objectId;
            app.teamName = nowTeam.name;
            app.teamRole = nowTeam.role;
            app.globalData.team = nowTeam;
            app.globalData.selTeam = value;
            wx.setStorageSync("MY_TEAM_ID", app.teamId);
            this.setData({
                nowTeam: nowTeam,
                selTeam: value,
                teamId: app.teamId,
                teamRole: app.teamRole,
                titleLoading: true
            });
            this.loadUserMsg(false,true);
            // setTimeout(()=>{
            //     wx.reLaunch({
            //         url: `../../pages/${that.properties.url}?loadingTrigger=true`,
            //     })
            // },500)
        },

        getUserInfo: function (e) {
            var that = this;
            var userInfo = e.detail.userInfo;
            if (!userInfo) {
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
                    app.globalData.userInfo.nickname = userInfo.nickName;
                    try {
                        const isBindPromise = new Promise(function (resolve, reject) {
                            resolve(app.addNewTeam(app.getUserInfo.call(that.loadUserMsg)));
                        });
                        isBindPromise.then(() => {
                            info.isBind = true;
                            that.setData({
                                userInfo: info
                            });
                            that.getMyTeamList(false, true);
                        }).catch((err) => {
                            console.log(err);
                        })
                    } catch (e) {
                        console.error("At common/title/title 140, ", e);
                    }
                }
            });
        },

        /**
         * @Description:  对外暴露this
         * @author: WE!D
         * @name:  _this
         * @args:
         * @return:  this
         * @date: 2020/8/27
         */
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
