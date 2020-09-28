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
    onShow() {
        console.log("receive-evaluation->6: onShow");
    },

})
;
