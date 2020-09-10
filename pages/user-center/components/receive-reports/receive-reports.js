const app = getApp();
Page({
    data: {
        active: 0,
        moreReportsList: [],
    },
    onLoad: function (options) {
        const that = this;
        app.doAjax({
           url: 'reports/accepted_list',
           method: 'get',
           success: function (res) {
               this.setData({
                   moreReportsList: res
               })
           }
        });
    }
});
