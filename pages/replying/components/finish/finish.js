// test/finish.js
var app = getApp();
Page({
    data: {},
    onLoad: function (options) {
        var {id, name} = options;
        this.setData({
            id: id,
            name: name
        });
    },
    onShow: function () {
    },
    /**
     * 进入测评管理页面
     */
    toReportDetail: function (e) {
        const {id, name,} = this.data;
        wx.redirectTo({
            url: `../../../report/report?receiveRecordId=${id}`,
        });
        wx.aldstat.sendEvent('查看自己的报告', {
            '测评名称': `名称：${name}`
        });
    },
    onUnload: function () {
    }
});
