import debounce from "../../utils/lodash/debounce";

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
        },
        title: {
            type: String,
            value: ""
        },
        search: {
            type: String,
            value: ""
        }
    },
    data: {
        reportList: [],
        page: 1,
        pixelRate: app.globalData.pixelRate,
        searchReportList: [],
        keyword: "",
        searchPage: 1
    },
    methods: {
        goToReport: function (e) {
            const {receiveRecordId} = e.currentTarget.dataset;
            wx.navigateTo({
                url: `/pages/report/report?receiveRecordId=${receiveRecordId}`
            })
        },

        loadReportList: function (page) {
            if (this.properties.type === "receive-evaluation") {
                return;
            }
            const that = this;
            const {reportList} = this.data;
            if (!page) {
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
                    if (res.data.length) {
                        that.setData({
                            reportList: reportList.concat(res.data),
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

        searchNextPage: function (e) {
            let searchPage = this.data.searchPage;
            searchPage++;
            this.setData({
                searchPage,
            });
            this.searchReport({detail: e.currentTarget.dataset.keyword});
        },

        clearContent: function () {
            const {keyword} = this.data;
            if (!keyword) {
                this.setData({
                    reportList: []
                })
            }
        },

        searchReport: debounce(function (e) {
            console.log(e);
            const that = this;
            let {searchPage, searchReportList} = this.data;
            try {
                if (!e.detail) {
                    that.setData({
                        searchReportList: [],
                        keyword: "",
                        searchPage: 1
                    });
                    this.loadReportList();
                    return;
                } else {
                    that.setData({
                        keyword: e.detail
                    });
                }
            } catch (e) {

            }
            app.doAjax({
                url: `reports`,
                method: "get",
                data: {
                    isEE: app.wxWorkInfo.isWxWork,
                    page: searchPage,
                    pageSize: 8,
                    keyword: e.detail,
                },
                success: function (res) {
                    if (!res.data.length && !searchReportList.length) {
                        that.setData({
                            searchReportList: [],
                            searchPage: 1
                        });
                        app.toast("未搜索到相关内容");
                    } else if (!res.data.length && searchReportList.length) {
                        searchPage--;
                        that.setData({
                            searchReportList: searchReportList,
                            searchPage: searchPage
                        });
                        app.toast("已为您加载所有相关内容");
                    }else{
                        that.setData({
                            searchReportList: searchReportList.concat(res.data),
                            searchPage
                        });
                    }
                }
            })
        }, 700, {trailing: true, leading: false}),

        getReportListAgain: function () {
            const {keyword} = this.data;
            if(!keyword){
                const page = 1;
                this.loadReportList(page);
            }
        }
    },
    pageLifetimes: {
        show: function () {
            this.loadReportList();
        }
    },
    lifetimes: {
        attached() {
            const that = this;
            const {type, title} = this.properties;
            const systemInfo = wx.getSystemInfoSync();
            this.setData({
                windowHeight: systemInfo.windowHeight
            })
            if (type === "report-more") {
                wx.setNavigationBarTitle({
                    title: title
                });
                // this.loadReportList();
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
