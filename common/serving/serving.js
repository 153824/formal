import {getEnv, getTag, umaEvent} from "../../uma.config";

const app = getApp();
Component({
    properties: {
        image: {
            type: String,
            value: "https://ihola.luoke101.com/icon%40icon-serving.png"
        },
        right: {
            type: String,
            value: "50rpx"
        },
        bottom: {
            type: String,
            value: "50rpx"
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
        showServing: false,
        isGetAccessToken: app.checkAccessToken(),
        authCodeCounter: 0
    },

    pageLifetimes: {
        show() {
            this.setData({
                isGetAccessToken: app.checkAccessToken(),
            })
        }
    },

    methods: {
        callServing: function (e) {
            const {area} = this.properties;
            this.setData({
                showServing: true
            });
        },
        goToServer() {
            wx.navigateTo({
                url: '/pages/customer-service/customer-service'
            })
        },
        getPhoneNumber(e) {
            const that = this;
            let {authCodeCounter} = this.data;
            if(authCodeCounter > 5){
                return;
            }
            app.getAccessToken(e).then(res=>{
                that.setData({
                    isGetAccessToken: true
                });
                that.goToCustomerService();
                const umaConfig = umaEvent.authPhoneSuccess;
                wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin.contact, env: getEnv(wx), tag: getTag(wx)});
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
    }
});
