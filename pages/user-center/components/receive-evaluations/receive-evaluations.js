import debounce from "../../../../utils/lodash/debounce";

const app = getApp();
Page({
    onLoad(options) {
        if(options.targetPath){
            this.setData({
                targetPath: options.targetPath
            })
        }
    },
    onShow() {},
    onUnload() {
        wx.switchTab({
            url: "/pages/user-center/user-center"
        })
    }
})
;

