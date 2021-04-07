const app = getApp();
Page({
    data: {
        code: '',
        isDisabled: false,
        phone: '18150378337',
        authCodeCounter: 0,
        timeData: {},
        time: 60000,
        showCountDown: true,
        verifyType: 'login',
        isWxWork: app.wxWorkInfo.isWxWork,
        isWxWorkAdmin: app.checkAdmin(),
        is3rd: app.wx3rdInfo.is3rd,
        is3rdAdmin: app.checkAdmin(),
        isGetAccessToken: app.checkAccessToken()
    },
    onLoad: function (options) {
        const {verifyType, phone} = options;
        this.setData({
            phone: phone,
            verifyType: verifyType ? verifyType : 'login',
        });
        app.setDataOfPlatformInfo(this)
        if(phone){
            this.getSMSCode()
        }
    },
    getCode(e) {
        this.setData({
            code: e.detail
        })
    },
    verifyLoginSMSCode() {
        const that = this;
        let {authCodeCounter} = this.data;
        if (authCodeCounter > 5) {
            return;
        }
        this.getAccessToken().catch(err => {
            console.error('getAccessToken: ',err.code);
            if (err.code === '401111') {
                app.prueLogin().then(res => {
                    that.verifyLoginSMSCode()
                });
                that.setData({
                    authCodeCounter: authCodeCounter++
                });
            }
        });
    },
    getAccessToken() {
        const {code, phone} = this.data;
        return app.getAccessTokenOfWeWork({code, phone}).then(res => {
            wx.switchTab({
                url: '/pages/work-base/work-base'
            })
        })
    },
    getSMSCode() {
        const {phone} = this.data;
        app.getSMSCode(phone).then(res => {
            // app.toast('验证码发送成功~')
        }).catch(err => {
            console.error(err)
        });
        this.setData({
            showCountDown: true
        })
    },
    onTimeChange(e) {
        this.setData({
            timeData: e.detail,
        });
    },
    onTimeFinish() {
        this.setData({
            showCountDown: false
        })
    },
    verifyUnboundSMSCode() {
        const {phone, code, is3rd, isWxWork} = this.data;
        app.doAjax({
            url: 'wework/users/phone/unbinding',
            method: 'PUT',
            data: {
                smsCode: code,
                phone
            },
            success(res) {
                if (isWxWork) {
                    wx.navigateTo({
                        url: '/pages/account/account'
                    })
                } else if (is3rd) {
                    wx.navigateTo({
                        url: '/pages/auth/auth'
                    })
                } else {
                    wx.switchTab({
                        url: '/pages/home/home'
                    })
                }
            },
            error(err) {
                console.error('verifyUnboundSMSCode: ', err)
            }
        })
    }

});
