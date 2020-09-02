Page({
    data: {},
    onLoad: function (options) {
        const { id="5efed573b1ef0200062a85f7" } = options;
        wx.reLaunch({
            url: `../pages/station/components/detail/detail?id=${id}`,
        })
    }
});
