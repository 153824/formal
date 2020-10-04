/***********************************************************************************************************************
 * @NAME: WEID       /       @DATE: 2020/7/21      /       @DESC: 变量注释模板(新增变量务必添加)
 * shareId: 领取测评ID
 * active: tabbar激活ID
 * isLogin: 是否登录
 * loading: 是否加载中
 * maskTrigger: 遮罩控制器
 * isWxWork: 是否为企业微信
 * isWxWorkAdmin: 是否为企业微信管理员
 * myEvaluation: 我的测评列表
 * evaluationTrack: 测评跟踪列表
 * ********************************************************************************************************************/

const app = getApp();
Page({
    data: {
        shareId: "",
        active: 0,
        isLogin: false,
        loading: true,
        maskTrigger: true,
        titleHeight: app.globalData.titleHeight,
        statusbarHeight: app.globalData.statusbarHeight,
        windowHeight: app.globalData.windowHeight,
        pixelRate: app.globalData.pixelRate,
        phoneModel: app.isIphoneX,
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: wx.getStorageSync('userInfo').isAdmin,
        myEvaluation: [],
        evaluationTrack: [],
        reportsList: [],
        newlyNums: 0,
        userInfo: app.globalData.userInfo || wx.getStorageSync("userInfo"),
        currTeam: app.teamName,
        isIPhoneXModel: app.isIphoneX,
        safeAreaDiff: 0,
        tabBarHeight: 0
    },

    onLoad: function (option={isWxWorkAdmin: false}) {
        const that = this;
        const optionIsWxWorkAdmin = option.isWxWorkAdmin || false;

        if (option.maskTrigger) {
            this.setData({
                maskTrigger: option.maskTrigger
            })
        }
        if (option.msg === 'err') {
            this.setData({
                maskTrigger: true
            });
            return;
        }
        this.setData({
            userInfo: app.globalData.userInfo || wx.getStorageSync("userInfo"),
            isWxWork: app.wxWorkInfo.isWxWork,
            isWxWorkAdmin: optionIsWxWorkAdmin || wx.getStorageSync('userInfo').isAdmin || app.wxWorkInfo.isWxWorkAdmin,
        });
        let {isWxWorkAdmin, isWxWork, isIPhoneXModel} = this.data;
        if (optionIsWxWorkAdmin) {
            isWxWorkAdmin = optionIsWxWorkAdmin;
            this.setData({
                isWxWorkAdmin: isWxWorkAdmin,
                maskTrigger: option.maskTrigger
            })
        }
        wx.getSystemInfo({
            success: function (res) {
                const {isIPhoneXModel} = that.data;
                that.setData({
                    windowHeight: res.windowHeight,
                    safeAreaDiff: isIPhoneXModel ? Math.abs(res.safeArea.height - res.safeArea.bottom) : 0,
                })
            }
        });
        const {windowHeight, safeArea} = wx.getSystemInfoSync();
        const tabBarHeight = Number(wx.getStorageSync("TAB_BAR_HEIGHT"));
        this.setData({
            tabBarHeight: tabBarHeight,
            windowHeight,
            safeAreaDiff: isIPhoneXModel ? Math.abs(safeArea.height - safeArea.bottom) : 0,
        })
    },

    onShow() {
        const that = this;
        const {userInfo, currTeam} = this.data;
        this.setData({
            userInfo: app.globalData.userInfo || wx.getStorageSync("userInfo"),
            isWxWork: app.wxWorkInfo.isWxWork,
            isWxWorkAdmin: wx.getStorageSync('userInfo').isAdmin || app.wxWorkInfo.isWxWorkAdmin,
        });
        let {isWxWorkAdmin, isWxWork} = this.data;
        if (!isWxWork) {
            this.title = this.selectComponent("#title");
            app.getUserInfo(this.title.loadUserMsg.call(this.title._this()));
            const inventoriesPromise = new Promise((resolve, reject) => {
                app.doAjax({
                    url: 'inventories',
                    method: 'get',
                    data: {
                        page: 1,
                        pageSize: 3
                    },
                    noLoading: true,
                    success: function (res) {
                        that.setData({
                            myEvaluation: res.data,
                            myEvaluationCount: res.count
                        });
                        resolve(true)
                    },
                    fail: function (err) {
                        console.error(err);
                        reject(false)
                    }
                });
            });
            const releaseRecordsPromise = new Promise((resolve, reject) => {
                app.doAjax({
                    url: 'release_records',
                    method: 'get',
                    data: {
                        isEE: false,
                        page: 1,
                        pageSize: 3,
                    },
                    noLoading: true,
                    success: function (res) {
                        that.setData({
                            evaluationTrack: res.data,
                            evaluationTrackCount: res.count
                        });
                        resolve(true);
                    },
                    fail: function (err) {
                        console.error(err);
                        reject(false);
                    }
                });
            });
            const reportListPromise = new Promise((resolve, reject) => {
                app.doAjax({
                    url: `reports`,
                    method: "get",
                    data: {
                        isEE: false,
                        page: 1,
                        pageSize: 3
                    },
                    noLoading: true,
                    success: function (res) {
                        that.setData({
                            reportsList: res.data,
                            reportsListCount: res.count
                        });
                        resolve(true);
                    },
                    fail: function (err) {
                        reject(false);
                        console.error(err)
                    }
                });
            });
            Promise.all([inventoriesPromise, releaseRecordsPromise, reportListPromise]).then(res => {
                setTimeout(() => {
                    that.setData({
                        maskTrigger: false
                    })
                }, 888)
            }).catch(err => {
                setTimeout(() => {
                    that.setData({
                        maskTrigger: false
                    })
                }, 888)
                console.error(err);
            });
            this.setData({
                currTeam: app.teamName
            })
        }
        if (isWxWork && isWxWorkAdmin) {
            const getMyEvaluationPromise = new Promise((resolve, reject) => {
                app.doAjax({
                    url: 'inventories',
                    method: 'get',
                    data: {
                        teamId: app.teamId || wx.getStorageSync("GET_MY_TEAM_LIST").objectId,
                        page: 1,
                        pageSize: 3,
                    },
                    noLoading: true,
                    success: function (res) {
                        that.setData({
                            myEvaluation: res.data,
                            myEvaluationCount: res.count
                        });
                        resolve(true);
                    },
                    fail: function (err) {
                        reject(false);
                    }
                });
            });
            const getEvaluationTrack = new Promise((resolve, reject) => {
                app.doAjax({
                    url: 'release_records',
                    method: 'get',
                    data: {
                        isEE: true,
                        page: 1,
                        pageSize: 3,
                    },
                    noLoading: true,
                    success: function (res) {
                        that.setData({
                            evaluationTrack: res.data,
                            evaluationTrackCount: res.count
                        });
                        resolve(true)
                    },
                    fail: function (err) {
                        reject(false)
                    }
                });
            });
            const getReportList = new Promise((resolve, reject) => {
                app.doAjax({
                    url: `reports`,
                    method: "get",
                    data: {
                        isEE: true,
                        page: 1,
                        pageSize: 3
                    },
                    noLoading: true,
                    success: function (res) {
                        that.setData({
                            reportsList: res.data,
                            reportsListCount: res.count
                        })
                        resolve(true);
                    },
                    fail: function (err) {
                        reject(false)
                    }
                })
            });
            Promise.all([getMyEvaluationPromise, getEvaluationTrack, getReportList]).then(res => {
                that.setData({
                    maskTrigger: false
                })
            }).catch(err => {
                that.setData({
                    maskTrigger: false
                })
            })
        }
        if (isWxWork && !isWxWorkAdmin) {
            this.setData({
                maskTrigger: false
            })
        }
    },

    onHide() {
    },

    getUserInfo: function (e) {
        var that = this;
        var userData = e.detail.userInfo;
        if (!userData) {
            wx.showModal({
                title: "授权失败",
                content: "需要授权后才可以开始答题或查看报告列表",
                showCancel: false,
                confirmText: "我知道了",
                confirmColor: "#0099ff"
            });
            return;
        }
        userData.openid = wx.getStorageSync("openId")
        app.doAjax({
            url: "updateUserMsg",
            method: "post",
            data: {
                data: JSON.stringify({
                    wxUserInfo: userData,
                    userCompany: {
                        name: userData.nickName + "的团队"
                    }
                })
            },
            success: function (res) {
                var userData = res.data;
                var globalData = app.globalData.userInfo;
                if (0 == res.code) {
                    wx.hideLoading();
                    app.globalData.userInfo = Object.assign(globalData, userData);
                    wx.setStorageSync("userInfo", Object.assign(globalData, userData));
                    wx.setStorageSync("openId", userData.openid);
                    that.changePage();
                }
            }
        });
    },

    getNewlyReportNums: function (e) {
        const that = this;
        app.doAjax({
            url: 'reports/today_newly',
            method: 'get',
            success: function (res) {
                that.setData({
                    newlyNums: res
                })
            }
        })
    },
    /**
     * 进入测评模拟测试
     */
    toTestIt: function (e) {
        app.isTest = true;
        wx.navigateTo({
            url: './components/guide/guide'
        });
    },

    goToTrackMore: function (e) {
        wx.navigateTo({
            url: "./components/track-more/track-more"
        })
    },

    goToTrackDetail: function (e) {
        const {trackId, trackIndex} = e.currentTarget.dataset;
        const trackInfo = JSON.stringify(this.data.evaluationTrack[trackIndex]);
        wx.navigateTo({
            url: `./components/track-detail/track-detail?trackId=${trackId}&trackInfo=${trackInfo}`,
        })
    },

    goToSharePaper: function (e) {
        const {available, norms, quesCount, estimatedTime, evaluationId, evaluationName, type} = this.data.myEvaluation[e.currentTarget.dataset.index];
        const necessaryInfo = {
            count: available,
            norms: norms,
            quesCount: quesCount,
            estimatedTime: estimatedTime,
            id: evaluationId,
            name: evaluationName,
            isFree: type === "FREE",
            hadBuyout: type === "BY_COUNT" ? false : true,
        };
        if (!available && !necessaryInfo.hadBuyout && !necessaryInfo.isFree) {
            app.toast("测评可用数量不足");
            return;
        }
        wx.navigateTo({
            url: `../station/components/sharePaper/sharePaper?necessaryInfo=${JSON.stringify(necessaryInfo)}`,
        })
    },

    goToEvaluationDetail: function (e) {
        const {evaluationId} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `../station/components/detail/detail?id=${evaluationId}`,
        })
    },

    goToReportMore: function (e) {
        wx.navigateTo({
            url: `./components/report-more/report-more`,
        })
    },

    goToReportDetail: function (e) {
        const receiveRecordId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `../report/report?receiveRecordId=${receiveRecordId}`
        })
    },

    setChildManager: function (e) {
        wx.navigateTo({
            url: "/pages/user/components/myTeam/myTeam"
        })
    },

    setCompanyCert: function (e) {
        wx.navigateTo({
            url: "/pages/work-base/components/teams-cert/teams-cert",
        })
    },

    goToEvaluationMore: function (e) {
        wx.navigateTo({
            url: "/pages/work-base/components/evaluation-more/evaluation-more"
        })
    }
});
