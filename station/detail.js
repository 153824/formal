Page({
    data: {},
    onLoad: function (options) {
        const { id } = options;
        wx.reLaunch({
            url: `../pages/station/components/detail/detail?id=${id}`,
        })
    }
});
