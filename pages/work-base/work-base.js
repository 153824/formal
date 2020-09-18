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
        maskTrigger: false,
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
        safeAreaDiff: 0
    },

    onLoad: function (option = {id: "",isWxWorkAdmin: false,maskTrigger: false}) {
        const that = this;
        const optionIsWxWorkAdmin = option.isWxWorkAdmin || false;
        let {isWxWorkAdmin, isWxWork} = this.data;
        if(optionIsWxWorkAdmin){
            isWxWorkAdmin = optionIsWxWorkAdmin;
            this.setData({
                isWxWorkAdmin: isWxWorkAdmin,
                maskTrigger: option.maskTrigger
            })
        }
        if (!isWxWork) {
            this.title = this.selectComponent("#title");
            app.getUserInfo(this.title.loadUserMsg.call(this.title._this()));
            const inventoriesPromise = new Promise((resolve, reject) => {
                app.doAjax({
                    url: 'inventories',
                    method: 'get',
                    noLoading: true,
                    success: function (res) {
                        if(res.length > 3){
                            res = res.slice(0,3)
                        }
                        that.setData({
                            myEvaluation: res
                        });
                        resolve(true)
                    },
                    fail: function (err) {
                        console.error(err)
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
                        pageSize: 4,
                    },
                    noLoading: true,
                    success: function (res) {
                        if(res.length > 3){
                            res = res.slice(0,3)
                        }
                        that.setData({
                            evaluationTrack: res
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
                        if(res.length > 3){
                            res = res.slice(0,3)
                        }
                        that.setData({
                            reportsList: res
                        })
                        resolve(true);
                    },
                    fail: function (err) {
                        reject(false);
                        console.error(err)
                    }
                });
            });
            Promise.all([inventoriesPromise,releaseRecordsPromise,reportListPromise]).then(res=>{
                setTimeout(()=>{
                    that.setData({
                        maskTrigger: false
                    })
                },888)
            }).catch(err=>{
                setTimeout(()=>{
                    that.setData({
                        maskTrigger: false
                    })
                },888)
                console.error(err);
            });
            this.setData({
                currTeam: app.teamName
            })
        }
        if(isWxWork && isWxWorkAdmin){
            const getMyEvaluationPromise = new Promise((resolve, reject) => {
                app.doAjax({
                    url: 'inventories',
                    method: 'get',
                    data: {
                        teamId: app.teamId || wx.getStorageSync("GET_MY_TEAM_LIST").objectId
                    },
                    noLoading: true,
                    success: function (res) {
                        if(res.length > 3){
                            res = res.splice(0,0,3)
                        }
                        console.log("res: ",res);
                        that.setData({
                            myEvaluation: res
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
                        pageSize: 4,
                    },
                    noLoading: true,
                    success: function (res) {
                        for (let i = 0; i < res.length; i++) {
                            res[i].createdAt = timeFormat(res[i].createdAt);
                        }
                        if(res.length > 3){
                            res = res.slice(0,3)
                        }
                        that.setData({
                            evaluationTrack: res
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
                        if(res.length > 3){
                            res = res.slice(0,3)
                        }
                        that.setData({
                            reportsList: res
                        })
                        resolve(true);
                    },
                    fail: function (err) {
                        reject(false)
                    }
                })
            });
            Promise.all([getMyEvaluationPromise,getEvaluationTrack,getReportList]).then(res=>{
                that.setData({
                    maskTrigger: false
                })
            }).catch(err=>{
                that.setData({
                    maskTrigger: false
                })
            })
        }
        if (isWxWork && !isWxWorkAdmin) {
            setTimeout(()=>{
                that.setData({
                    maskTrigger: false
                })
            },555);
            if (option.id) {
                app.shareId = option.id;
            }
            const userInfo = wx.getStorageSync("userInfo");
            if (userInfo && userInfo.avatar) {
                this.setData({
                    isLogin: true
                });
                return;
            }
            if (app.shareId) {
                wx.reLaunch({
                    url: "./components/guide/guide?id=" + app.shareId
                });
                app.shareId = null;
                return;
            }
        }
        // if (!isWxWork) {
        //     this.title = this.selectComponent("#title");
        //     app.getUserInfo(this.title.loadUserMsg.call(this.title._this()));
        //     const inventoriesPromise = new Promise((resolve, reject) => {
        //         app.doAjax({
        //             url: 'inventories',
        //             method: 'get',
        //             success: function (res) {
        //                 if(res.length > 3){
        //                     res = res.slice(0,3)
        //                 }
        //                 that.setData({
        //                     myEvaluation: res
        //                 });
        //                 resolve(true)
        //             },
        //             fail: function (err) {
        //                 console.error(err)
        //                 reject(false)
        //             }
        //         });
        //     });
        //     const releaseRecordsPromise = new Promise((resolve, reject) => {
        //         app.doAjax({
        //             url: 'release_records',
        //             method: 'get',
        //             data: {
        //                 isEE: false,
        //                 page: 1,
        //                 pageSize: 4,
        //             },
        //             success: function (res) {
        //                 if(res.length > 3){
        //                     res = res.slice(0,3)
        //                 }
        //                 that.setData({
        //                     evaluationTrack: res
        //                 });
        //                 resolve(true);
        //             },
        //             fail: function (err) {
        //                 console.error(err);
        //                 reject(false);
        //             }
        //         });
        //     });
        //     const reportListPromise = new Promise((resolve, reject) => {
        //         app.doAjax({
        //             url: `reports`,
        //             method: "get",
        //             data: {
        //                 isEE: false,
        //                 page: 1,
        //                 pageSize: 3
        //             },
        //             success: function (res) {
        //                 if(res.length > 3){
        //                     res = res.slice(0,3)
        //                 }
        //                 that.setData({
        //                     reportsList: res
        //                 })
        //                 resolve(true);
        //             },
        //             fail: function (err) {
        //                 reject(false);
        //                 console.error(err)
        //             }
        //         });
        //     });
        //     Promise.all([inventoriesPromise,releaseRecordsPromise,reportListPromise]).then(res=>{
        //         setTimeout(()=>{
        //             that.setData({
        //                 maskTrigger: false
        //             })
        //         },888)
        //     }).catch(err=>{
        //         setTimeout(()=>{
        //             that.setData({
        //                 maskTrigger: false
        //             })
        //         },888)
        //         console.error(err);
        //     });
        //     this.setData({
        //         currTeam: app.teamName
        //     })
        // }
        // if(isWxWork && isWxWorkAdmin){
        //     const getMyEvaluationPromise = new Promise((resolve, reject) => {
        //         app.doAjax({
        //             url: 'inventories',
        //             method: 'get',
        //             success: function (res) {
        //                 if(res.length > 3){
        //                     res = res.splice(0,0,3)
        //                 }
        //                 console.log("res: ",res);
        //                 that.setData({
        //                     myEvaluation: res
        //                 });
        //                 resolve(true);
        //             },
        //             fail: function (err) {
        //                 reject(false);
        //             }
        //         });
        //     });
        //     const getEvaluationTrack = new Promise((resolve, reject) => {
        //         app.doAjax({
        //             url: 'release_records',
        //             method: 'get',
        //             data: {
        //                 isEE: true,
        //                 page: 1,
        //                 pageSize: 4,
        //             },
        //             success: function (res) {
        //                 for (let i = 0; i < res.length; i++) {
        //                     res[i].createdAt = timeFormat(res[i].createdAt);
        //                 }
        //                 if(res.length > 3){
        //                     res = res.slice(0,3)
        //                 }
        //                 that.setData({
        //                     evaluationTrack: res
        //                 });
        //                 resolve(true)
        //             },
        //             fail: function (err) {
        //                 reject(false)
        //             }
        //         });
        //     });
        //     const getReportList = new Promise((resolve, reject) => {
        //         app.doAjax({
        //             url: `reports`,
        //             method: "get",
        //             data: {
        //                 isEE: true,
        //                 page: 1,
        //                 pageSize: 3
        //             },
        //             success: function (res) {
        //                 if(res.length > 3){
        //                     res = res.slice(0,3)
        //                 }
        //                 that.setData({
        //                     reportsList: res
        //                 })
        //                 resolve(true);
        //             },
        //             fail: function (err) {
        //                 reject(false)
        //             }
        //         })
        //     });
        //     Promise.all([getMyEvaluationPromise,getEvaluationTrack,getReportList]).then(res=>{
        //         that.setData({
        //             maskTrigger: false
        //         })
        //     }).catch(err=>{
        //         that.setData({
        //             maskTrigger: false
        //         })
        //     })
        // }
        // if (isWxWork && !isWxWorkAdmin) {
        //     setTimeout(()=>{
        //         that.setData({
        //             maskTrigger: false
        //         })
        //     },555);
        //     if (option.id) {
        //         app.shareId = option.id;
        //     }
        //     const userInfo = wx.getStorageSync("userInfo");
        //     if (userInfo && userInfo.avatar) {
        //         this.setData({
        //             isLogin: true
        //         });
        //         return;
        //     }
        //     if (app.shareId) {
        //         wx.reLaunch({
        //             url: "./components/guide/guide?id=" + app.shareId
        //         });
        //         app.shareId = null;
        //         return;
        //     }
        // }
        wx.getSystemInfo({
            success: function (res) {
                console.log("wx.getSystemInfo: ",res);
                const { isIPhoneXModel } = that.data;
                that.setData({
                    windowHeight: res.windowHeight,
                    safeAreaDiff: isIPhoneXModel  ? Math.abs(res.safeArea.height  - res.safeArea.bottom) : 0,
                })
            }
        });
        const tabBarHeight =  wx.getStorageSync("TAB_BAR_HEIGHT");
        console.log("tabBarHeight: ",tabBarHeight);
        this.setData({
            tabBarHeight: tabBarHeight,
        })
    },

    onShow() {},

    onHide() {},

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
                // console.log("updateUserMsg",res);
                var userData = res.data;
                var globalData = app.globalData.userInfo;
                if (0 == res.code) {
                    wx.hideLoading();
                    app.globalData.userInfo = Object.assign(globalData,userData);
                    wx.setStorageSync("userInfo", Object.assign(globalData,userData));
                    wx.setStorageSync("openId", userData.openid);
                    // wx.setStorageSync("unionId", userData.uid);
                    that.changePage();
                }
            }
        });
    },

    getNewlyReportNums: function(e) {
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

    changePage: function (e) {
        var that = this;
        app.isTest = false;
        if (app.shareId) { //跳转到答题界面
            wx.reLaunch({
                url: "./components/guide/guide?id=" + app.shareId
            });
            app.shareId = null;
        } else {
            wx.reLaunch({
                url: "./components/member-report-list/member-report-list"
            });
        }
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
        const { trackId,trackIndex } = e.currentTarget.dataset;
        const trackInfo = JSON.stringify(this.data.evaluationTrack[trackIndex]);
        wx.navigateTo({
            url: `./components/track-detail/track-detail?trackId=${trackId}&trackInfo=${trackInfo}`,
        })
    },

    goToSharePaper: function (e) {
        const {available,norms,quesCount,estimatedTime,evaluationId,evaluationName,type} = this.data.myEvaluation[e.currentTarget.dataset.index];
        const necessaryInfo = {
            count: available,
            norms: norms,
            quesCount: quesCount,
            estimatedTime: estimatedTime,
            id: evaluationId,
            name: evaluationName,
            isFree: false,
            hadBuyout: type === "BY_COUNT" ? false : true,
        };
        wx.navigateTo({
            url: `../station/components/sharePaper/sharePaper?necessaryInfo=${JSON.stringify(necessaryInfo)}`,
        })
    },

    goToEvaluationDetail: function (e) {
        const { evaluationId } = e.currentTarget.dataset;
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
            url: "/pages/user/components/teams/teams"
        })
    },

    goToEvaluationMore: function (e) {
        wx.navigateTo({
            url: "/pages/work-base/components/evaluation-more/evaluation-more"
        })
    }
});
