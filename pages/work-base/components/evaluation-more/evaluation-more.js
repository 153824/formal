const app = getApp();
Page({
    data: {},
    onLoad: function (options) {
        const that = this;
        const getMyEvaluationPromise = new Promise((resolve, reject) => {
            app.doAjax({
                url: 'inventories',
                method: 'get',
                data: {
                    teamId: app.teamId || wx.getStorageSync("GET_MY_TEAM_LIST").objectId
                },
                noLoading: true,
                success: function (res) {
                    that.setData({
                        myEvaluation: res
                    });
                    resolve(true);
                },
                fail: function (err) {
                    reject(false);
                }
            });
        });
    }
});
