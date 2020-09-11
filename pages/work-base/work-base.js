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
import {timeFormat} from "../../utils/utils";

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
        isWxWorkAdmin: app.wxWorkInfo.isWxWorkAdmin,
        myEvaluation: [],
        evaluationTrack: [],
        reportsList: []
    },

    onLoad: function (option = {id: ""}) {
        const that = this;
        const {isWxWorkAdmin, isWxWork} = this.data;
        if (isWxWork && !isWxWorkAdmin) {
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
        if (!isWxWork) {
            app.doAjax({
                url: 'inventories',
                method: 'get',
                success: function (res) {
                    that.setData({
                        myEvaluation: res
                    });
                }
            });
            app.doAjax({
                url: 'release_records',
                method: 'get',
                data: {
                    isEE: false,
                    page: 1,
                    pageSize: 4,
                },
                success: function (res) {
                    console.log(timeFormat);
                    for (let i = 0; i < res.length; i++) {
                        res[i].createdAt = timeFormat(res[i].createdAt);
                    }
                    console.log(res);
                    that.setData({
                        evaluationTrack: res
                    });
                }
            });
            app.doAjax({
                url: `reports`,
                method: "get",
                data: {
                    isEE: false,
                    page: 1,
                    pageSize: 3
                },
                success: function (res) {
                    that.setData({
                        reportsList: res
                    })
                }
            })
        }
        if(isWxWork && isWxWorkAdmin){
            app.doAjax({
                url: 'inventories',
                method: 'get',
                success: function (res) {
                    that.setData({
                        myEvaluation: res
                    });
                }
            });
            app.doAjax({
                url: 'release_records',
                method: 'get',
                data: {
                    isEE: false,
                    page: 1,
                    pageSize: 4,
                },
                success: function (res) {
                    console.log(timeFormat);
                    for (let i = 0; i < res.length; i++) {
                        res[i].createdAt = timeFormat(res[i].createdAt);
                    }
                    console.log(res);
                    that.setData({
                        evaluationTrack: res
                    });
                }
            });
            app.doAjax({
                url: `reports`,
                method: "get",
                data: {
                    isEE: false,
                    page: 1,
                    pageSize: 3
                },
                success: function (res) {
                    that.setData({
                        reportsList: res
                    })
                }
            })
        }
        if (option.maskTrigger) {
            this.setData({
                maskTrigger: true
            })
        }
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
                // console.log("updateUserMsg",res);
                var userData = res.data;
                if (0 == res.code) {
                    wx.hideLoading();
                    wx.setStorageSync("userInfo", userData);
                    wx.setStorageSync("openId", userData.openid);
                    wx.setStorageSync("unionId", userData.uid);
                    that.changePage();
                }
            }
        });
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
    }
});
