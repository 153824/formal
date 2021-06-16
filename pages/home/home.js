const app = getApp();
Page({
    data: {
        teamRole: app.teamRole,
        showTopGift: false,
        showGiftDlg: false,
        statusbarHeight: app.globalData.statusbarHeight,
        titleHeight: app.globalData.titleHeight,
        isIos: app.isIos,
        loading: true,
        mobile: "18559297592",
        wechat: "haola72",
        active: 0,
        column: [],
        trigger: true,
    },
    init() {
        if(app.checkAccessToken()){
            const {isWxWork} = app.wxWorkInfo;
            const {is3rd} = app.wx3rdInfo;
            const isWxWorkAdmin = wx.getStorageSync('userInfo').isAdmin;
            const isWxWorkSuperAdmin = wx.getStorageSync('userInfo').isSuperAdmin;
            this.check({
                isWxWork,
                isWxWorkAdmin,
                is3rd,
                isWxWorkSuperAdmin
            })
        }else{
            app.checkUserInfo=(res)=>{
                this.check({
                    isWxWork: res.isWxWork,
                    isWxWorkAdmin: res.isAdmin,
                    is3rd: res.is3rd,
                    isWxWorkSuperAdmin: res.isSuperAdmin
                })
            };
        }
    },
    check({isWxWork, isWxWorkAdmin, isWxWorkSuperAdmin, is3rd}) {
        const that = this;
        if (is3rd || isWxWork && isWxWorkAdmin && !isWxWorkSuperAdmin) {
            let flag = false
            let url = isWxWork ? "/pages/account/account" : "/pages/auth/auth?type=auth"
            if (app.checkAccessToken()) {
                url = '/pages/work-base/work-base'
                wx.switchTab({
                    url: url
                });
            } else {
                wx.navigateTo({
                    url: url
                });
            }
            return
        }
        if (!is3rd || isWxWork && isWxWorkSuperAdmin) {
            console.log('isWxWorkSuperAdmin: ', isWxWorkSuperAdmin);
            let homePagesPromiseList = [];
            const homePagesPromise = new Promise(function (resolve, reject) {
                app.doAjax({
                    url: "homePages",
                    method: "get",
                    noLoading: true,
                    success: function (res) {
                        resolve(res.resultObject);
                    },
                    fail: function (err) {
                        reject(err)
                    }
                });
            });
            homePagesPromise.then(res => {
                that.setData(res);
                homePagesPromiseList = res.column.map((v, k) => {
                    return new Promise((resolve, reject) => {
                        app.doAjax({
                            url: `homePages/columns/${v.column_id}/evaluations`,
                            method: "get",
                            noLoading: true,
                            success: function (res) {
                                resolve({columnId: v.column_id, data: res.data});
                            },
                            fail: function (err) {
                                reject(err);
                            }
                        });
                    })
                });
                return Promise.all(homePagesPromiseList)
            }).then(res => {
                const {column} = that.data;
                const targetColumn = column;
                for (let i = 0; i < res.length; i++) {
                    for (let j = 0; j < column.length; j++) {
                        if (res[i].columnId === targetColumn[j].column_id) {
                            targetColumn[j]["data"] = res[i].data || [];
                        }
                    }
                }
                that.setData({
                    column: targetColumn,
                });
                setTimeout(() => {
                    that.setData({
                        loading: false
                    })
                }, 500);
            }).catch(err => {
                setTimeout(() => {
                    that.setData({
                        loading: false
                    })
                }, 500);
            });
        }
    },
    onLoad: function () {
        this.init();
    },
    onShow: function () {
        app.freeTickId = "";
        try {
            wx.uma.trackEvent("1601368297264")
        } catch (e) {
            console.error("home.js -> 109", e);
        }
    },
    onHide: function () {
    },

    onShareAppMessage(options) {
        return app.defaultShareObj;
    },

    navWebView: function (e) {
        const {url, name} = e.currentTarget.dataset;
        try {
            wx.uma.trackEvent('1601368427999', {"文章名称": name})
        } catch (e) {
            console.error('home.js -> 134', e)
        }
        wx.setStorageSync("webView_Url", url);
        wx.navigateTo({
            url: '../../common/webView',
        });
    },
    /**继续体验 */
    goToReplying: function (e) {
        const {t} = e.target.dataset;
        if (t === '2') {
            wx.setStorageSync("hideLastTestMind", true);
            this.setData({
                oldShareInfo: ""
            });
            return;
        }
        const {id} = this.data.oldShareInfo;
        wx.navigateTo({
            url: '../test/guide?id=' + id
        });
    },
    gotoDetail: function (e) {
        const {id} = e.currentTarget.dataset;
        if (id.startsWith("http")) {
            wx.setStorageSync("webView_Url", id);
            wx.navigateTo({
                url: '../../common/webView',
            });
            return;
        }
        wx.navigateTo({
            url: `../station/components/detail/detail?id=${id}`,
            success: function () {
            }
        });
    },
    goToAll(e) {
        const {columnId} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/home/subpages/all?columnId=${columnId}`
        })
    },
    callServing: function (e) {
        this.setData({
            showServing: true
        });
    },
    hideServing: function (e) {
        this.setData({
            showServing: false
        });
    },
    copyIt: function () {
        const {wechat} = this.data;
        wx.setClipboardData({
            data: wechat,
            success(res) {
            }
        });
    },
    changePage: function (e) {
        const {name, url, tab, n} = e.currentTarget.dataset;
        if (url) {
            if (url.indexOf('http') != -1) {
                wx.setStorageSync("webView_Url", url);
                wx.navigateTo({
                    url: '../common/webView',
                });
            } else {
                const {detail} = e;
                try {
                    wx.uma.trackEvent('1601368400960', {"测评名称": name})
                } catch (e) {
                    console.error('home.js -> 136', e)
                }
                if ((!detail || !detail.encryptedData) && n == "getPhoneNumber") return;
                if (detail && detail.encryptedData) {
                    const iv = detail.iv;
                    const encryptedData = detail.encryptedData;
                    if (encryptedData) {
                        const userMsg = app.globalData.userMsg || {};
                        userMsg["iv"] = iv;
                        userMsg["encryptedData"] = encryptedData;
                        app.doAjax({
                            url: "updatedUserMobile",
                            data: userMsg,
                            noLoading: true,
                            success: function (res) {
                                app.getUserInfo();
                            }
                        });
                    }
                }
                wx.navigateTo({
                    url: url
                });
            }
        }
        if (tab) {
            wx.switchTab({
                url: tab
            });
        }
        this.setData({
            showTopGift: true,
            showGiftDlg: false
        });
    },
    onUnload() {
        const {isWxWork, is3rd} = app.wxWorkInfo;
        if (isWxWork || is3rd) {
            this.setData({
                loading: true,
                trigger: false
            });
        }
    }
});
