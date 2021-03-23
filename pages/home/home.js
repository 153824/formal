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
        navigationList: (() => {
            const data = [
                {
                    name: "校招选才",
                    type: "school",
                    picture: "/pages/home/images/home@icon-school.png",
                    liner: "yellow",
                },
                {
                    name: "社招选才",
                    type: "social",
                    picture: "/pages/home/images/home@icon-company.png",
                    liner: "blue",
                },
                {
                    name: "人才盘点",
                    type: "brain",
                    picture: "/pages/home/images/home@icon-manage.png",
                    liner: "green",
                },
                {
                    name: "风险识别",
                    type: "risk",
                    picture: "/pages/home/images/home@icon-risk.png",
                    liner: "orange",
                },
            ]
            return data;
        })(),
    },
    onLoad: function (options) {
        const that = this;
        const {isWxWork} = app.wxWorkInfo;
        const {is3rd} = app.wx3rdInfo;
        if (isWxWork || is3rd) {
            let flag = false
            let url = isWxWork ? "/pages/account/account" : "/pages/auth/auth"
            if (app.checkAccessToken()) {
                url = '/pages/work-base/work-base'
                wx.switchTab({
                    url: url
                });
            } else {
                app.checkUserInfo = (res) => {
                    flag = res && res.tokenInfo
                    if (flag) {
                        url = '/pages/work-base/work-base'
                        wx.switchTab({
                            url: url
                        });
                    } else {
                        wx.navigateTo({
                            url: url
                        });
                    }
                };
            }
            return
        }
        if (!isWxWork && !is3rd) {
            app.checkUserInfo = (userInfo) => {
                if (String(userInfo.isNew) !== 'false') {
                    wx.redirectTo({
                        url: "/pages/preload/preload",
                        success: res => {
                            wx.uma.trackEvent("1607407387532")
                        }
                    });
                }
            };
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
    gotoMore: function (e) {
        const {type} = e.currentTarget.dataset;
        switch (type) {
            case "school":
                try {
                    wx.uma.trackEvent('1605250635717');
                } catch (e) {
                    console.error(e);
                }
                break;
            case "social":
                try {
                    wx.uma.trackEvent('1605250635722');
                } catch (e) {
                    console.error(e);
                }
                break;
            case "brain":
                try {
                    wx.uma.trackEvent('1605250635723');
                } catch (e) {
                    console.error(e);
                }
                break;
            case "risk":
                try {
                    wx.uma.trackEvent('1605250635725');
                } catch (e) {
                    console.error(e);
                }
                break;
        }
        wx.navigateTo({
            url: `/pages/home/components/more/more?type=${type}`,
        });
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
