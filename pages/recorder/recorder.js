const app = getApp();
Page({
    data: {
        username: "",
        eduArr: [
            '小学',
            '初中',
            '高中',
            '中技（中专 / 技校 / 职高）',
            '大专',
            '本科',
            '硕士研究生',
            'MBA',
            '博士研究生'
        ],
        birthday: '1995-01',
        education: -1,
        sex: ["男", "女"],
        checkedSex: 0,
        isGetPhone: false,
        phoneNumber: "微信一键授权",
        verify: false
    },

    onLoad: function (options) {
        const {releaseRecordId = ""} = options;
        if (releaseRecordId) {
            this.setData({
                releaseRecordId: releaseRecordId,
            })
        }
        this._checkUserIsAuthPhone();
    },

    userInput: function (e) {
        const value = e.detail.value;
        const name = e.currentTarget.dataset.n;
        const o = {};
        o[name] = value;
        this.setData(o);
    },

    sexInput: function (e) {
        const {value} = e.detail;
        this.setData({
            checkedSex: value,
        })
    },

    getPhoneNumber: function (e) {
        const that = this;
        const {isGetPhone,} = this.data;
        if (this.data.isSelf === 'SHARE') {
            try {
                wx.uma.trackEvent('1602215557718')
            } catch (e) {

            }
        }
        if (app.wxWorkInfo.isWxWork) {
            app.doAjax({
                url: 'wework/auth/mobile',
                method: "post",
                data: {
                    userId: wx.getStorageSync("userInfo").id,
                    teamId: wx.getStorageSync("userInfo").teamId,
                },
                success: function (res) {
                    that.setData({
                        isGetPhone: true,
                        phoneNumber: res.phone || '微信一键授权'
                    });
                },
                fail: function (err) {
                    app.toast(err.msg)
                }
            })
        } else {
            if (!isGetPhone) {
                const detail = e.detail;
                const iv = detail.iv;
                const encryptedData = detail.encryptedData;
                if (encryptedData) {
                    const userMsg = app.globalData.userMsg || {};
                    userMsg["iv"] = iv;
                    userMsg["encryptedData"] = encryptedData;
                    app.doAjax({
                        url: "updatedUserMobile",
                        data: userMsg,
                        success: function (ret) {
                            if (that.data.isSelf === 'SHARE') {
                                try {
                                    wx.uma.trackEvent('1602216242156')
                                } catch (e) {

                                }
                            }
                            app.doAjax({
                                url: `wework/users/${app.globalData.userMsg.id || app.globalData.userInfo.id}`,
                                method: "get",
                                data: {
                                    openid: wx.getStorageSync("openId"),
                                },
                                success: function (res) {
                                    that.setData({
                                        isGetPhone: true,
                                        phoneNumber: res.phone || '微信一键授权'
                                    });
                                }
                            });
                        }
                    });
                }
            }
        }
    },

    _checkEvaluationType: function () {
        const _this = this;
        const {receiveRecordId} = this.data;
        app.doAjax({
            url: 'reports/check_type',
            method: 'get',
            data: {
                receiveRecordId: receiveRecordId
            },
            success: function (res) {
                _this.setData({
                    isSelf: res.data.type
                });
            }
        });
    },

    _checkUserIsAuthPhone: function (userId) {
        const _this = this;
        const {receiveRecordId = ""} = this.data;
        if (!userId) {
            console.log("app.globalData.userInfo: ", app.globalData.userInfo);
            userId = (wx.getStorageSync("userInfo") || app.globalData.userInfo || app.globalData.userMsg).id;
        }
        app.doAjax({
            url: `wework/evaluations/fetch/info/participant/${userId}`,
            method: "get",
            data: {
                receiveRecordId: receiveRecordId
            },
            success: function (res) {
                const {phone} = res;
                if (phone) {
                    _this.setData({
                        isGetPhone: true,
                        phoneNumber: phone
                    })
                }
            }
        })
    },

    _checkUserInfo: function () {
        const that = this;
        const data = that.data;
        const {username, birthday, education, phoneNumber, isGetPhone} = data;
        if (!username || !(/^[\u4E00-\u9FA5A-Za-z]+$/.test(username))) {
            app.toast("请输入正确的姓名！");
            return false;
        }
        if (education == -1) {
            app.toast("请选择学历信息！");
            return false;
        }
        if (!birthday) {
            app.toast("请选择出生年月！");
            return false;
        }
        if (phoneNumber.length < 11) {
            app.toast("请授权手机号码！");
            return false;
        }
        if (!isGetPhone) {
            app.toast("请再次授权手机号！");
            return false;
        }
        return true;
    },

    _pushMessagesFetched: function (receiveRecordId) {
        if (!receiveRecordId) {
            console.error("消息推送，缺少receiveRecordId");
            return;
        }
        const messagesPromise = new Promise(((resolve, reject) => {
            app.doAjax({
                url: "messages/fetched",
                method: "post",
                data: {
                    receiveRecordId: receiveRecordId
                },
                success: function (res) {
                    resolve({status: true});
                    console.log("消息推送成功！");
                },
                fail: function (err) {
                    resolve({status: false});
                    console.error("消息推送失败", err);
                }
            })
        }));
        return messagesPromise;
    },

    _fetchVerify: function () {
        const _this = this;
        const {releaseRecordId, username, birthday, sex, phoneNumber, checkedSex, eduArr, education} = this.data;
        const educationName = eduArr[education];
        const gender = sex[checkedSex];
        const verifyPromise = new Promise(((resolve, reject) => {
            app.doAjax({
                url: "wework/evaluations/fetch/verify",
                method: "post",
                data: {
                    releaseRecordId: releaseRecordId,
                    username: username,
                    birthday: birthday,
                    gender: gender,
                    educationName: educationName,
                    phone: phoneNumber,
                },
                success: function (res) {
                    const {msg} = res;
                    if(msg === "MISMATCHED"){
                        app.toast("该名字不在邀请名单中");
                    }
                    if(msg === "UNAVAILABLE"){
                        app.toast("分享已失效");
                        wx.switchTab({
                            url: "/pages/home/home"
                        })
                    }
                    const {evaluationId} = res;
                    const receiveRecordId = res.receiveRecordId || _this.data.receiveRecordId;
                    const url = `/pages/work-base/components/answering/answering?evaluationId=${evaluationId}&receiveRecordId=${receiveRecordId}`;
                    _this.setData({
                        receiveRecordId: res.receiveRecordId
                    });
                    resolve({receiveRecordId});
                    wx.redirectTo({
                        url: url
                    })
                },
                fail: function (err) {
                    const {msg} = err;
                    if(msg === "MISMATCHED"){
                        app.toast("该名字不在邀请名单中");
                    }
                    if(msg === "UNAVAILABLE"){
                        app.toast("分享已失效");
                        wx.switchTab({
                            url: "/pages/home/home"
                        })
                    }
                    reject({receiveRecordId: ""});
                }
            });
        }));
        return verifyPromise;
    },

    submit: function () {
        if (!this._checkUserInfo) {
            return;
        } else {
            this._fetchVerify().then(res=>{this._pushMessagesFetched(res.receiveRecordId)}).catch(err=>{throw err});
        }
    }
});
