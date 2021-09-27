import debounce from "../../utils/lodash/debounce"
const app = getApp()
Component({
    properties: {
        evaluationTrack: {
            type: Array,
            value: []
        },
        hasSearch: {
            type: Boolean,
            value: false
        }
    },
    data: {
        page: 1,
        pixelRate: app.globalData.pixelRate,
        keyword: ''
    },
    methods: {
        goToTrackDetail: function (e) {
            const { releaseRecordId } = e.currentTarget.dataset;
            wx.navigateTo({
                url: `/pages/work-base/components/grant/grant?releaseRecordId=${releaseRecordId}`,
            })
        },
        loadEvaluationTrack: function (page) {
            const that = this;
            const {evaluationTrack,keyword} = this.data;
            if(!page){
                page = this.data.page;
            }
            app.doAjax({
                url: 'release_records',
                method: 'get',
                data: {
                    isEE: app.wxWorkInfo.isWxWork,
                    page: page,
                    pageSize: 8,
                    keyword
                },
                success: function (res) {
                    that.setData({
                        evaluationTrack: evaluationTrack.concat(res.data),
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
            let {page} = this.data;
            page++;
            this.loadEvaluationTrack(page);
        },
        search: debounce(function (e) {
            console.log(e);
            this.setData({
                page: 1,
                evaluationTrack: [],
                keyword: e.detail.value
            },()=>{
                this.loadEvaluationTrack()
            })
        },500, {
            leading: false,
            trailing: true
        })
    },
    lifetimes: {
        attached() {
            this.setData({
                evaluationTrack: this.properties.evaluationTrack
            })
        }
    }
});
