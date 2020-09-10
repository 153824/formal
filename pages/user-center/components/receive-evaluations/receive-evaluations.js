const app = getApp();
Page({
    data: {
        myEvaluation: []
    },
    onLoad: function (options) {
        const that = this;
        app.doAjax({
            url: 'inventories',
            method: 'get',
            success: function (res) {
                that.setData({
                    myEvaluation: res
                });
            }
        });
    }
});
