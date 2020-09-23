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
        reportList: [],
        page: 1,
        pixelRate: app.globalData.pixelRate
    },
    methods: {
        goToReport: function (e) {
            const {receiveRecordId} = e.currentTarget.dataset;
            wx.navigateTo({
                url: `/pages/report/report?receiveRecordId=${receiveRecordId}`
            })
        },

        loadReportList: function (page) {
            if(this.properties.type === "receive-evaluation"){
                return;
            }
            const that = this;
            const {reportList} = this.data;
            if(!page){
                page = this.data.page;
            }
            app.doAjax({
                url: `reports`,
                method: "get",
                data: {
                    isEE: app.wxWorkInfo.isWxWork,
                    page: page,
                    pageSize: 8
                },
                success: function (res) {
                    that.setData({
                        reportList: reportList.concat(res.data),
                    });
                    if(res.data.length){
                        that.setData({
                            page
                        })
                    }
                }
            })
        },

        nextPage: function () {
            let page = this.data.page;
            page++;
            this.loadReportList(page);
        },
    },
    pageLifetimes: {
        onLoad: function (options) {}
    },
    lifetimes: {
        attached() {
            const that = this;
            const {type} = this.properties;
            const systemInfo = wx.getSystemInfoSync();
            this.setData({
                windowHeight: systemInfo.windowHeight
            })
            if (type === "report-more") {
                this.loadReportList();
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
