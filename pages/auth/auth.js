import {switchTabPages} from "./const/switchPage";
const app = getApp();
Page({
    data: {
        appTitle:'',
        liner: 'transparent',
        authCodeCounter: 0,
        isWxWork: app.wxWorkInfo.isWxWork,
        type: 'auth'
    },

    onLoad: function (options) {
        const {isWxWork} = app.wxWorkInfo;
        this.setData({
            type: options.type || 'auth'
        });
        if(isWxWork && options.type !== 'getToken'){
            wx.navigateTo({
                url: '/pages/account/account'
            });
            return;
        }
        this.getAppTitle()
    },

    wxAuthLogin(e) {
        if(app.wxWorkInfo.isWxWork){
            return;
        }
        const that = this;
        let {authCodeCounter} = this.data;
        if(authCodeCounter > 5){
            return;
        }
        app.getAccessToken(e).then(res=>{
            wx.switchTab({
                url: '/pages/work-base/work-base'
            })
        }).catch(err=>{
            if(err.code === '401111'){
                app.prueLogin().then(res=>{
                    this.wxAuthLogin(e)
                });
                that.setData({
                    authCodeCounter: authCodeCounter++
                })
            }
        })
    },

    getAppTitle() {
        const temptation = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/settings/${wx.getAccountInfoSync().miniProgram.appId}/app-name`,
                method: 'GET',
                success(res) {
                    resolve(res)
                },
                error(err) {
                    reject(err)
                }
            })
        });
        temptation.then(res => {
            this.setData({
                appTitle: res
            })
        })
    },

    prueLogin() {
        const pages = getCurrentPages();
        app.prueLogin().then(res=>{
            if(pages.length === 0){
                wx.reLaunch({
                    url: `/pages/work-base/work-base`
                });
                return;
            }
            for(let i = pages.length - 1;i >= 0;i--){
                if(pages[i].route.indexOf('pages/auth/auth') === -1){
                    console.log(pages[i]);
                    const options = pages[i].options;
                    const optionKeys = Object.keys(pages[i].options);
                    let query = '?';
                    optionKeys.forEach((item, key)=>{
                        query = `${query}${item}=${options[item]}${key===optionKeys.length ? '' : '&'}`
                    });
                    if(switchTabPages.includes(`${pages[i].route}`)){
                        wx.reLaunch({
                            url: `/${pages[i].route}${query}`
                        });
                        return;
                    } else {
                        wx.reLaunch({
                            url: `/${pages[i].route}${query}`
                        });
                        return;
                    }
                }
            }
        })
    }
});
