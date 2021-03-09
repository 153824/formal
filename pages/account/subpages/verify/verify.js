const app = getApp();
Page({
    data: {
        code: '',
        isDisabled: false,
        phone: '18150378337',
        authCodeCounter: 0,
        timeData: {},
        time: 6000,
        showCountDown: true
    },
    onLoad: function (options) {
        this.setData({
            phone: options.phone
        })
    },
    getCode(e) {
        this.setData({
            code: e.detail
        })
    },
    verifySMSCode() {
        const that = this;
        let {authCodeCounter} = this.data;
        console.log('authCodeCounter: ', authCodeCounter);
        if (authCodeCounter > 5) {
            return;
        }
        this.getAccessToken().catch(err => {
            if (err.code === '40111') {
                app.getAuthCode().then(res => {
                    this.verifySMSCode()
                });
                console.log(authCodeCounter++);
                that.setData({
                    authCodeCounter: authCodeCounter++
                });
            }
        });
    },
    getAccessToken() {
        const {code, phone} = this.data;
        return app.getAccessTokenOfWeWork({code, phone}).then(res => {
            wx.navigateTo({
                url: '/page/home/home'
            })
        })
    },
    getSMSCode() {
        const {phone} = this.data;
        app.getSMSCode(phone).then(res=>{
            app.toast('success')
        }).catch(err=>{
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
});
