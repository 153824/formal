import {timeFormat} from "../../../../utils/utils";

const app = getApp();
Page({
    data: {
        moreEvaluationTrack: []
    },
    onLoad: function (options) {
        const that = this;
        app.doAjax({
            url: 'release_records',
            method: 'get',
            data: {
                isEE: true,
                page: 1,
                pageSize: 4,
            },
            success: function (res) {
                for (let i = 0; i < res.length; i++) {
                    res[i].createdAt = timeFormat(res[i].createdAt);
                }
                that.setData({
                    moreEvaluationTrack: res
                });
            }
        })
    }
});
