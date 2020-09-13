const app = getApp();
Component({
    properties: {
        reportList: {
            type: Array,
            value: []
        },
        type: {
            type: String,
            value: "report-more" //receive-evaluation
        }
    },
    data: {
        reportList: []
    },
    methods: {
        goToReport: function (e) {
            const {receiveRecordId} = e.currentTarget.dataset;
            wx.navigateTo({
                url: `/pages/report/report?receiveRecordId=${receiveRecordId}`
            })
        }
    },
    pageLifetimes: {
        onLoad: function (options) {}
    },
    lifetimes: {
        attached() {
            const that = this;
            const {type} = this.properties;
            if (type === "report-more") {
                app.doAjax({
                    url: `reports`,
                    method: "get",
                    data: {
                        isEE: app.wxWorkInfo.isWxWork,
                    },
                    success: function (res) {
                        that.setData({
                            reportList: res
                        })
                    }
                })
            } else if (type === "receive-evaluation") {
                app.doAjax({
                    url: `reports/accepted_list`,
                    method: "get",
                    success: function (res) {
                        that.setData({
                            reportList: res
                        })
                    }
                })
            }
        }
    }
});
