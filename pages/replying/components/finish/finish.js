// test/finish.js
var app = getApp();
Page({
    data: {
        isSelf: false
    },
    onLoad: function (options) {
        var {id, name} = options;
        this.setData({
            id: id,
            name: name
        });
    },
    onShow: function () {
        const that = this;
        app.doAjax({
            url: 'reports/check_type',
            method: 'get',
            data: {
                receiveRecordId: that.data.id
            },
            success: function (res) {
                that.setData({
                    isSelf: res.data.type
                })
            }
        })
    },
    /**
     * 进入测评管理页面
     */
    toReportDetail: function (e) {
        const {id, name, isSelf} = this.data;
        wx.navigateTo({
            url: `/pages/report/report?receiveRecordId=${id}&isSelf=${isSelf}`,
        });
        wx.aldstat.sendEvent('查看自己的报告', {
            '测评名称': `名称：${name}`
        });
    },
    onUnload: function () {
        const {isSelf} = this.data;
        if (isSelf && isSelf === "SELF") {
            wx.reLaunch({
                url: `/pages/work-base/work-base`,
            });
        }
    }
});
