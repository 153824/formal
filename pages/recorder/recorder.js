import throttle from "../../utils/lodash/throttle";
import {getEnv, getTag, Tracker, umaEvent} from "../../uma.config";

const app = getApp();
Page({
    data: {
        username: "",
        eduArr: [
            '小学',
            '初中',
            '高中',
            '中专',
            '大专',
            '本科',
            '硕士',
            '博士',
            '其他'
        ],
        birthday: '1995-01',
        education: -1,
        sex: ["男", "女"],
        checkedSex: -1,
        // isGetPhone: false,
        // phoneNumber: "微信一键授权",
        verify: false,
        isWxWork: false,
        isWxWorkAdmin: false,
        is3rd: false,
        is3rdAdmin: false,
        authCodeCounter: 0,
        canIUseGetUserProfile: wx.getUserProfile ? true : false,
        maxDate: `${new Date().getFullYear()}-${new Date().getMonth()+1 > 9 ? new Date().getMonth()+1 > 9 : '0' + (new Date().getMonth()+1)}`
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

    _checkUserIsAuthPhone: function (userId) {
        const _this = this;
        const {receiveRecordId} = this.data;
        if (!userId) {
            userId = (wx.getStorageSync("userInfo") || app.globalData.userInfo || app.globalData.userMsg).userId;
        }
        app.doAjax({
            url: `wework/evaluations/fetch/info/participant`,
            method: "get",
            data: {
                receiveRecordId: receiveRecordId || ""
            },
            success: function (res) {
                const {educationName, username, phone, birthday, gender} = res;
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
                if(gender){
                    _this.setData({
                        checkedSex: gender === '男' ? 0 : 1,
                    })
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
                    var url = ''
                    new Promise((resolve, reject) => {
                        app.doAjax({
                            url: `../wework/evaluations/${receiveRecordId}/check_if_chapter_enabled`,
                            method: 'GET',
                            success(res){
                                resolve(res);
                            },
                            error(err){
                                reject(err);
                            }
                        })
                    }).then(res => {
                        if(res){
                            url = `/pages/work-base/components/chapter/chapter`;
                        }else{
                            url = `/pages/work-base/components/answering/answering`
                        }
                        _this.setData({
                            receiveRecordId: res.receiveRecordId
                        });
                        let targetURL = {
                            isChapter: url.indexOf('chapter') > -1,
                            url: url,
                            evaluationId: evaluationId,
                            receiveRecordId: receiveRecordId,
                        }
                        targetURL = JSON.stringify(targetURL);
                        resolve({receiveRecordId});
                        const goldenURL = `/pages/recorder/subpages/golden/golden?redirect=${targetURL}`;
                        console.log('goldenURL: ',goldenURL);
                        wx.redirectTo({
                            url: goldenURL,
                        })
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

    getUserInfo(e) {
        app.updateUserInfo(e).then(res=>{
            this.submit();
            const umaConfig = umaEvent.authUserInfoSuccess;
            try{
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.record});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }).catch(err=>{
            console.error(err)
        })
    },

    getUserProfile() {
        const that = this
        wx.getUserProfile({
            desc: "获取用户信息",
            success: (res) => {
                app.updateUserInfo(res).then(res=>{
                    that.submit()
                }).catch(err=>{
                    console.error(err)
                })
            },
            error: (e) => {
                console.log(e);
            },
            fail: (e) => {
                console.log(e);
            }
        })
    },

    submit: function () {
        if (this._checkUserInfo) this._fetchVerify()
    }
});
