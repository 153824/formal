import {getEnv, umaEvent} from "../../uma.config";

/***********************************************************************************************************************
 * @NAME: WEID       /       @DATE: 2020/7/21      /       @DESC: 变量注释模板(新增变量务必添加)
 * shareId: 领取测评ID
 * active: tabbar激活ID
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
        loading: true,
        maskTrigger: true,
        titleHeight: app.globalData.titleHeight,
        statusbarHeight: app.globalData.statusbarHeight,
        windowHeight: app.globalData.windowHeight,
        pixelRate: app.globalData.pixelRate,
        phoneModel: app.isIphoneX,
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.checkAdmin(),
        isWxWorkSuperAdmin: app.checkSuperAdmin(),
        is3rd: app.wx3rdInfo.is3rd,
        is3rdAdmin: app.checkAdmin(),
        myEvaluation: [],
        evaluationTrack: [],
        reportsList: [],
        newlyNums: 0,
        userInfo: app.globalData.userInfo || wx.getStorageSync("userInfo"),
        isIPhoneXModel: app.isIphoneX,
        safeAreaDiff: 0,
        tabBarHeight: 0,
        logo: wx.getExtConfigSync().logo,
        isGetAccessToken: app.checkAccessToken(),
        showEditDialog: false,
        editedTeamName: '',
        companyName: '好啦访客',
        authCodeCounter: 0,
    },

    onLoad: function (option) {
        const that = this;
        wx.getSystemInfo({
            success: function (res) {
                const {isIPhoneXModel} = that.data;
                that.setData({
                    windowHeight: res.windowHeight,
                    safeAreaDiff: isIPhoneXModel ? Math.abs(res.safeArea.height - res.safeArea.bottom) : 0,
                })
            }
        });
        if (!app.checkAccessToken() && (app.wxWorkInfo.isWxWork || app.wx3rdInfo.is3rd)) {
            wx.navigateTo({
                url: '/pages/auth/auth?type=auth'
            });
            return;
        }
        app.setDataOfPlatformInfo(this);
    },

    onShow() {
        let {isIPhoneXModel} = this.data;
        const {windowHeight, safeArea} = wx.getSystemInfoSync();
        const tabBarHeight = Number(wx.getStorageSync("TAB_BAR_HEIGHT"));
        this.setData({
            tabBarHeight: tabBarHeight,
            windowHeight,
            safeAreaDiff: isIPhoneXModel ? Math.abs(safeArea.height - safeArea.bottom) : 0,
        })
        if (!app.checkAccessToken() && (app.wxWorkInfo.isWxWork || app.wx3rdInfo.is3rd)) {
            return;
        }
        app.setDataOfPlatformInfo(this);
        const that = this;
        let {isWxWorkAdmin, isWxWork, is3rd, is3rdAdmin} = this.data;
        if (!app.checkAccessToken()) {
            this.setData({
                maskTrigger: false
            })
            return;
        }
        if (!isWxWork && !is3rd) {
            // TODO UM埋点，跟踪哪个用户使用哪份常模
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
        }
        if (isWxWork && isWxWorkAdmin) {
            const getMyEvaluationPromise = new Promise((resolve, reject) => {
                app.doAjax({
                    url: 'inventories/we_work',
                    method: 'get',
                    data: {
                        funcCode: "evaluationManage",
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
        if (is3rd && is3rdAdmin) {
            const getMyEvaluationPromise = new Promise((resolve, reject) => {
                app.doAjax({
                    url: 'inventories/we_work',
                    method: 'get',
                    data: {
                        funcCode: "evaluationManage",
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
        if (is3rd && !is3rdAdmin) {
            this.setData({
                maskTrigger: false
            })
        }
        if (app.checkAccessToken()) {
            console.log('work-base->getTeamList')
            app.getTeamList().then(res => {
                console.log(res);
                let companyName = '';
                res.forEach((item, index) => {
                    if (item.isLoginTeam) {
                        companyName = item.shortName
                    }
                });
                that.setData({
                    companyName
                })
            }).catch(err => {
                console.error(err);
            });
        }
        this.setData({
            isGetAccessToken: app.checkAccessToken()
        })
    },

    onHide() {
    },

    editTeamName() {
        this.setData({
            showEditDialog: true
        });
    },

    saveTeamName() {
        const {editedTeamName} = this.data;
        app.doAjax({
            url: 'wework/teams/name',
            method: 'POST',
            data: {
                name: editedTeamName
            },
            success(res) {
                app.toast('修改成功！')
                wx.reLaunch({
                    url: '/pages/work-base/work-base'
                })
            }
        })
    },

    getPhoneNumber(e) {
        const that = this;
        let {authCodeCounter} = this.data;
        if (authCodeCounter > 5) {
            return
        }

        app.getAccessToken(e)
            .then(res => {
                wx.reLaunch({
                    url: '/pages/home/home'
                })
            })
            .catch(err => {
                console.error(err);
                if (err.code === '401111') {
                    app.prueLogin().then(res => {
                        this.getPhoneNumber(e)
                    });
                    that.setData({
                        authCodeCounter: authCodeCounter++
                    })
                }
            })
    },

    getUserInfo: function (e) {
        const flag = Object.keys(e.detail.userInfo).length > 0;
        if (!flag) {
            wx.showModal({
                title: "授权失败",
                content: "需要授权后才可以开始答题或查看报告列表",
                showCancel: false,
                confirmText: "我知道了",
                confirmColor: "#0099ff"
            });
            return;
        }
        app.updateUserInfo(e).then(res => {
        }).catch(err => {
            console.error(err);
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
        const {
            available,
            norms,
            quesCount,
            estimatedTime,
            evaluationId,
            evaluationName,
            type
        } = this.data.myEvaluation[e.currentTarget.dataset.index];
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
        if (!available && !necessaryInfo.hadBuyout && !necessaryInfo.isFree && !this.data.isWxWork && !this.data.is3rd) {
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
        const umaConfig = umaEvent.evaluationDetail;
        wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin.bench, env: getEnv(wx)});
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
