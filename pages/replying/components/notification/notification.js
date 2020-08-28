Page({
    data: {
        trigger: true
    },
    onLoad: function (options) {
        this.setData({
            paperId: options.pid,
            id: options.id
        })
    },
    closeNotification: function () {
        const that = this;
        this.setData({
            trigger: false
        });
        wx.redirectTo({
            url: `../../../station/components/detail/detail?id=${that.data.paperId}`
        })
    },
    goToReplying: function () {
        const that = this;
        wx.redirectTo({
          url: '../../replying?pid=' + that.data.paperId + '&id=' + that.data.id
        });
    }
});
