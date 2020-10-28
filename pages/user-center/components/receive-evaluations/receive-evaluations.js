import debounce from "../../../../utils/lodash/debounce";

const app = getApp();
Page({
    data: {
        redirect: ""
    },
    onLoad(options={redirect: ""}) {
        if(options.redirect){
            this.setData({
                redirect: options.redirect
            })
        }
    },
    onShow() {},
    onUnload() {
        const {redirect} = this.data;
        if(redirect){
            switch (redirect) {
                case "user-center":
                    wx.switchTab({
                        url: "/pages/user-center/user-center"
                    });
                    break;
                default:
                    break;
            }
        }
    }
})
;

