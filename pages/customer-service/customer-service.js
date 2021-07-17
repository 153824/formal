const plugin = requirePlugin("chatbot");

Page({
    data: {},
    onLoad: function (options) {},
    getQueryCallback: function(e) {
        console.log(e);
    },
    goBackHome: function () {
        // wx.navigateBack({
        //   delta: 1
        // })
    },
    back:function(e) {
        this.goBackHome()
    },
    onShareAppMessage:function(e) {
        console.log(e)
    }
});
