// common/serving/serving.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        image: {
            type: String,
            value: "https://ihola.luoke101.com/icon%40icon-serving.png"
        },
        mobile: {
            type: String,
            value: "18559297592"
        },
        wechat: {
            type: String,
            value: "haola72"
        },
        right: {
            type: String,
            value: "50rpx"
        },
        bottom: {
            type: String,
            value: "50rpx"
        },
        type: {
            type: String,
            value: "circle"
        },
        area: {
            type: String,
            value: "home"
        },
        visibility: {
            type: String,
            value: 'visible'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        showServing: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        callServing: function (e) {
            const {area} = this.properties;
            switch (area) {
                case 'home':
                    try {
                        wx.uma.trackEvent('1601368464246');
                    } catch (e) {

                    }
                    break;
                case 'station':
                    try {
                        wx.uma.trackEvent('1602210565877');
                    } catch (e) {

                    }
                    break;
                case 'detail':
                    try {
                        wx.uma.trackEvent('1602213266068');
                    } catch (e) {

                    }
                    break;
            }
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
            var wechat = this.properties.wechat;
            wx.setClipboardData({
                data: wechat,
                success(res) {

                }
            });
        },
        callIt: function () {
            var phoneNumber = this.properties.mobile;
            wx.makePhoneCall({
                phoneNumber: phoneNumber //仅为示例，并非真实的电话号码
            })
        },
        hideDlg: function () {
            this.setData({
                showServing: false
            });
        }
    }
});
