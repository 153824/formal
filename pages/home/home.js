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
        column: []
    },
    onLoad: function (options,name) {
        wx.hideTabBar({
            animation: true
        });
        if( options.loadingTrigger ){
            this.setData({
                loading: true
            })
        }
        wx.hideTabBar({
            animation: true
        });
        const that = this;
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
                // wx.showTabBar({
                //     animation: true,
                // });
                that.setData({
                    loading: false
                })
            }, 500);
        }).catch(err => {
            setTimeout(() => {
                // wx.showTabBar({
                //   animation: true,
                // });
                that.setData({
                    loading: false
                })
            }, 500);
        });
    },
    onShow: function () {
        const that = this;
        app.freeTickId = "";
        if (!app.isLogin) {
            app.checkUser = function () {
                that.onShow();
                app.checkUser = null;
            };
            return;
        }
        this.title = this.selectComponent("#title");
        app.getUserInfo(this.title.loadUserMsg.call(this.title._this()));
    },
    onHide: function () {},

    onShareAppMessage(options) {
        return app.defaultShareObj;
    },

    navWebView: function (e) {
        const url = e.currentTarget.dataset.url;
        wx.setStorageSync("webView_Url", url);
        wx.navigateTo({
            url: '../../common/webView',
        });
        wx.aldstat.sendEvent('首页点击推荐阅读', {
            '文章名称': '名称：' + url
        });
    },

    changePage: function (e) {
        const { name,url,tab,n } = e.currentTarget.dataset;
        if (url) {
            if (url.indexOf('http') != -1) {
                wx.setStorageSync("webView_Url", url);
                wx.navigateTo({
                    url: '../common/webView',
                });
            } else {
                const { detail } = e;
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
                wx.aldstat.sendEvent('首页进入测评详情', {
                    '测评名称': '名称：' + name
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
    /**继续体验 */
    goToReplying: function (e) {
        const { t } = e.target.dataset;
        if (t === '2') {
            this.setData({
                oldShareInfo: ""
            });
            return;
        }
        const { id } = this.data.oldShareInfo;
        wx.navigateTo({
            url: '../test/guide?id=' + id
        });
    },
    gotoDetail: function (e) {
        const { id } = e.currentTarget.dataset;
        if (id.startsWith("http")) {
            wx.setStorageSync("webView_Url", id);
            wx.navigateTo({
                url: '../../common/webView',
            });
            wx.aldstat.sendEvent('查看Banner详情', {
                'Banner名称': 'id' + id
            });
            return;
        }
        wx.navigateTo({
            url: `../station/components/detail/detail?id=${id}`,
            success: function () {
                wx.aldstat.sendEvent('查看Banner详情', {
                    'Banner名称': 'id' + id
                });
            }
        });


    },
    gotoMore: function (e) {
        const {id, name} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `../station/components/more/more?id=${id}&title=${name}`,
            success: () => {
                wx.aldstat.sendEvent('导航点击', {
                    '导航名称': '名称：' + name
                });
            }
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
        const { wechat } = this.data;
        wx.setClipboardData({
            data: wechat,
            success(res) {}
        });
    },
});
