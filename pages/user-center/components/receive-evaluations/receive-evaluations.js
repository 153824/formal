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
})
;

