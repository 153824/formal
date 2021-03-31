const app = getApp();
Page({
    data: {
        phone: "",
        binding: [],
        isWxWork: false,
        isWxWorkAdmin: false,
        is3rd: false,
        is3rdAdmin: false
    },
    onLoad: function (options) {
        this.getBindInfo();
        app.setDataOfPlatformInfo(this);
    },
    goToBound() {
        const {phone} = this.data;
        const {isWxWork} = this.data;
        if(!isWxWork && !phone){
            wx.navigateTo({
                url: "/pages/auth/auth"
            });
            return
        }
        const verifyType = phone ? 'unbound' : 'bound';
        const url = phone ? `/pages/account/subpages/verify/verify?verifyType=${verifyType}&phone=${phone}` : `/pages/account/account?verifyType=${verifyType}`
        wx.navigateTo({
            url
        })
    },
    getBindInfo() {
        const that = this;
        app.doAjax({
            url: 'wework/users/bindInfo',
            method: 'GET',
            success(res){
                that.setData({
                    phone: res.phone,
                    binding: res.binding
                })
            }
        });
    }
});
