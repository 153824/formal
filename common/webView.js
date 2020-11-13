// common/webView.js
Page({
    data: {
        url: ""
    },
    onLoad: function (options) {
        var url = wx.getStorageSync("webView_Url");
        const title = options.title || false;
        if (title) {
            wx.setNavigationBarTitle({
                title: "测评邀请函"
            })
        }
        console.log(options);
        this.setData({
            url: options.img || url
        });
        // wx.removeStorageSync("webView_Url");
    },
    onReady: function () {

    }
})
