import debounce from "../../utils/lodash/debounce";
import {getEnv, getTag, Tracker, umaEvent} from "../../uma.config";

const app = getApp();
Component({
    properties: {
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
        },
    },
    data: {
        reportList: [],
        page: 1,
        pixelRate: app.globalData.pixelRate,
        searchReportList: [],
        keyword: "",
        searchPage: 1,
        evaluationGroup: [
            {
                id: '',
                name: '全部测评'
            },
            {
                id: '5f6d5db901f500c06fbe0f4b',
                name: '设计师测评'
            },
            {
                id: '5f6d5db901f500c06fbe0f4c',
                name: '基层管理特质'
            },
            {
                id: '5f6d5db901f500c06fbe06267',
                name: '设计师测评'
            },
            {
                id: '5f6d5db901f500c06fbe0f9d',
                name: '基层管理特质'
            },
            {
                id: '5f6d5db901f500c06fbe0f8w',
                name: '设计师测评'
            },
            {
                id: '5f6d5db901f500c06fbe0f3w',
                name: '基层管理特质'
            },
            {
                id: '5f6d5db901f500c06fbe0f4v',
                name: '设计师测评'
            },
            {
                id: '5f6d5db901f500c06fbe0f4m',
                name: '基层管理特质'
            },
            {
                id: '5f6d5db901f500c06fbe0f4p',
                name: '设计师测评'
            },
            {
                id: '5f6d5db901f500c06fbe0f4c',
                name: '基层管理特质'
            },
            {
                id: '5f6d5db901f500c06fbe0f4p',
                name: '设计师测评'
            },
            {
                id: '5f6d5db901f500c06fbe0f4c',
                name: '基层管理特质'
            },
            {
                id: '5f6d5db901f500c06fbe0f4p',
                name: '设计师测评'
            },
            {
                id: '5f6d5db901f500c06fbe0f4c',
                name: '基层管理特质'
            },
            {
                id: '5f6d5db901f500c06fbe0f4p',
                name: '设计师测评'
            },
            {
                id: '5f6d5db901f500c06fbe0f4c',
                name: '基层管理特质'
            }
        ],
        selectEvaluation: {
            id: '',
            name: '全部测评'
        }
    },
    methods: {
        goToReport: function (e) {
            const {reportList} = this.data;
            const {type} = this.properties;
            const {receiveRecordId, index} = e.currentTarget.dataset;
            wx.navigateTo({
                url: `/pages/report/report?receiveRecordId=${receiveRecordId}`
            })
            if(type === "receive-evaluation"){
                const umaConfig = umaEvent.getInReport;
                try{
                    new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.share, name: `${reportList[index].evaluation}`});
                }
                catch (e) {
                    console.log('友盟数据统计',e);
                }
            }
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
            this.searchReport({detail: e.currentTarget.dataset.keyword},false);
        },

        clearContent: function () {
            const {keyword} = this.data;
            if (!keyword) {
                this.setData({
                    reportList: []
                })
            }
        },

        searchReport: debounce(function (e,clean=true) {
            const that = this;
            let {searchPage, searchReportList} = this.data;
            if(clean){
                searchReportList = [];
            }
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
                throw e;
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
                    } else {
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
            if (!keyword) {
                const page = 1;
                this.loadReportList(page);
            }
        },

        onEvaluationTap() {
            const {isShowEvaluationSelect} = this.data;
            this.setData({
                isShowEvaluationSelect: !isShowEvaluationSelect
            })
        },

        selectEvaluation(e) {
            this.setData({
                selectEvaluation: e.currentTarget.dataset.item
            })
            this.hideSelect()
        },

        hideSelect() {
            this.setData({
                isShowEvaluationSelect: false
            })
        }
    },
    pageLifetimes: {
        show: function () {
        },
        hide() {
        }
    },
    lifetimes: {
        attached() {
            const that = this;
            const {type, title} = this.properties;
            const systemInfo = wx.getSystemInfoSync();
            this.setData({
                windowHeight: systemInfo.windowHeight
            });
            if (type === "report-more") {
                this.loadReportList();
                wx.setNavigationBarTitle({
                    title: title
                });
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
        },
        detached() {
            this.setData({
                reportList: []
            })
        }
    }
});
