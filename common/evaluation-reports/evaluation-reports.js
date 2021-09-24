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
        evaluationGroup: [],
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

        loadEvaluationGroup() {
            const {keyword} = this.data;
            const p = new Promise((resolve, reject) => {
                app.doAjax({
                    url: 'wework/evaluations/list_by_teamId',
                    method: 'GET',
                    data: {
                        keyword: keyword
                    },
                    success(res) {
                        resolve(res)
                    },
                    error(err) {
                        reject(err)
                    }
                })
            })
            return p;
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
            let {searchPage, searchReportList, selectEvaluation} = this.data;
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
                    evaluationId: selectEvaluation.id
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

        async onEvaluationTap() {
            const {isShowEvaluationSelect} = this.data;
            if(!isShowEvaluationSelect){
                const res = await this.loadEvaluationGroup()
                this.setData({
                    isShowEvaluationSelect: !isShowEvaluationSelect,
                    evaluationGroup: [{id: '', name: '全部测评'}, ...res]
                })
            }
        },

        selectEvaluation(e) {
            const {keyword} = this.data;
            this.setData({
                selectEvaluation: e.currentTarget.dataset.item,
                searchReportList: [],
                searchPage: 1
            },()=>{
                this.searchReport({detail: keyword},false);
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
