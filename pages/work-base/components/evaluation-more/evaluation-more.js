const app = getApp();
Page({
    data: {
        page: 1,
        myEvaluation: [],
        pixelRate: app.globalData.pixelRate,
        windowHeight: 0,
        isWxWork: app.wxWorkInfo.isWxWork,
        is3rd: app.wx3rdInfo.is3rd
    },
    onLoad: function (options) {
        this.loadMyEvaluation();
        const systemInfo = wx.getSystemInfoSync();
        this.setData({
            windowHeight: systemInfo.windowHeight,
        })
    },

    loadMyEvaluation: function(page){
        const that = this;
        const {myEvaluation} = this.data;
        const getMyEvaluationPromise = new Promise((resolve, reject) => {
            if(!page){
                page = this.data.page;
            }
            app.doAjax({
                url: 'inventories',
                method: 'get',
                data: {
                    teamId: app.teamId || wx.getStorageSync("GET_MY_TEAM_LIST").objectId,
                    page: page,
                    pageSize: 8,
                },
                noLoading: true,
                success: function (res) {
                    that.setData({
                        myEvaluation: myEvaluation.concat(res.data),
                    });
                    if(res.data.length){
                       that.setData({
                           page
                       })
                    }
                    resolve(true);
                },
                fail: function (err) {
                    reject(false);
                }
            });
        });
    },

    nextPage: function (res) {
        let {page} = this.data;
        page++;
        this.loadMyEvaluation(page);
    },

    goToSharePaper: function (e) {
        const {norms, evaluationId} = this.data.myEvaluation[e.currentTarget.dataset.index];
        const necessaryInfo = {
            evaluationId: evaluationId,
            norms,
        };
        wx.navigateTo({
            url: `/pages/station/components/generate/generate?necessaryInfo=${JSON.stringify(necessaryInfo)}`,
        });
    },

    goToEvaluationDetail: function (e) {
        const {evaluationId} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/station/components/detail/detail?id=${evaluationId}`,
        })
    },
});
