import throttle from "../../utils/lodash/throttle";

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
        // isGetPhone: false,
        // phoneNumber: "微信一键授权",
        verify: false,
        isWxWork: false,
        isWxWorkAdmin: false,
        is3rd: false,
        is3rdAdmin: false,
        authCodeCounter: 0
    },

    onLoad: function (options) {
        const {releaseRecordId = ""} = options;
        const {isWxWork} = this.data;
        if (releaseRecordId) {
            this.setData({
                releaseRecordId: releaseRecordId,
            })
        }
        app.setDataOfPlatformInfo(this);
        // if(isWxWork){
        //     this.setData({
        //         phoneNumber:
        //     })
        // }
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
        let {authCodeCounter} = this.data;
        if(authCodeCounter > 5){
            return;
        }
        app.getAccessToken(e).then(res=>{
            // this.setData({
            //     isGetPhone: true,
            //     phoneNumber: res.phone
            // })
        }).catch(err=>{
            if(err.code === '401111'){
                app.prueLogin().then(res=>{
                    this.getPhoneNumber(e)
                });
                that.setData({
                    authCodeCounter: authCodeCounter++
                })
            }
        })
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
        const {receiveRecordId} = this.data;
        if (!userId) {
            userId = (wx.getStorageSync("userInfo") || app.globalData.userInfo || app.globalData.userMsg).id;
        }
        app.doAjax({
            url: `wework/evaluations/fetch/info/participant`,
            method: "get",
            data: {
                receiveRecordId: receiveRecordId || ""
            },
            success: function (res) {
                const {educationName, username, phone, birthday} = res;
                const {eduArr} = _this.data;
                const localUserInfo = wx.getStorageSync("userBaseInfo")
                if (!birthday) {
                    res.birthday = "1995-01"
                }
                if (!username) {
                    try {
                        res.username = localUserInfo && localUserInfo.nickname ? localUserInfo.nickname : '' ;
                    } catch (e) {
                        console.error(e)
                    }
                }
                // if (!phone) {
                //     res.phone = "微信一键授权";
                // }else{
                //     _this.setData({
                //         phoneNumber: res.phone,
                //         isGetPhone: true
                //     })
                // }
                if (educationName) {
                    eduArr.forEach((item, key) => {
                        if (item === educationName) {
                            res.education = key;
                        }
                    })
                }
                _this.setData({
                    ...res,
                })
            },
            fail: function (err) {
                app.toast(err);
                throw err;
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
        // if (phoneNumber.length < 11) {
        //     app.toast("请授权手机号码！");
        //     return false;
        // }
        // if (!isGetPhone) {
        //     app.toast("请再次授权手机号！");
        //     return false;
        // }
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
                    // phone: phoneNumber,
                },
                success: function (res) {
                    const {msg} = res;
                    if (msg === "MISMATCHED") {
                        app.toast("该名字不在邀请名单中");
                    }
                    if (msg === "UNAVAILABLE") {
                        app.toast("分享已失效");
                        wx.switchTab({
                            url: "/pages/home/home"
                        })
                    }
                    const {evaluationId} = res;
                    const receiveRecordId = res.receiveRecordId || _this.data.receiveRecordId;
                    const url = `/pages/work-base/components/chapter/chapter?evaluationId=${evaluationId}&receiveRecordId=${receiveRecordId}`;
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
                    if (msg === "MISMATCHED") {
                        app.toast("该名字不在邀请名单中");
                    }
                    if (msg === "UNAVAILABLE") {
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

    _preloadUserInfo: function () {
        const userId = app.globalData.userInfo.id || wx.getStorageSync("userInfo").id;
        const preloadInfo = new Promise((resolve, reject) => {
            const _this = this;
            app.doAjax({
                url: `wework/evaluations/fetch/info/participant/${userId}`,
                data: {
                    receiveRecordId: ""
                },
                success: function (res) {
                    const result = res;
                    const {educationName, username} = res;
                    const {eduArr} = _this.data;
                    const copy = {
                        username: "",
                        // phone: "",
                        birthday: "",
                        educationName: "",
                        gender: "",
                        education: -1
                    };
                    if (!username) {
                        reject(copy);
                        return;
                    }
                    if (educationName) {
                        eduArr.forEach((item, key) => {
                            if (item === educationName) {
                                result.education = key;
                            }
                        })
                    }
                    resolve(result);
                },
                fail: function (err) {
                    reject(err);
                }
            })
        });
        return preloadInfo;
    },

    getUserInfo(e) {
        app.updateUserInfo(e).then(res=>{
            this.submit()
        }).catch(err=>{
            console.error(err)
        })
    },

    submit: function () {
        if (!this._checkUserInfo) {
            return;
        } else {
            this._fetchVerify().then(res => {
                try {
                    wx.uma.trackEvent('1602216442285');
                } catch (e) {
                    console.error(e)
                }
                this._pushMessagesFetched(res.receiveRecordId)
            }).catch(err => {
                throw err
            });
        }
    }
});
