const app = getApp();
Page({
    data: {
        active: 0,
        moreReportsList: [],
    },
    onLoad: function (options) {
        const that = this;
        const {shareAt,releaseRecordId,tabIndex} = options;
        app.doAjax({
           url: 'reports/accepted_list',
           method: 'get',
           success: function (res) {
               this.setData({
                   moreReportsList: res
               })
           }
        });
        // if(shareAt&&releaseRecordId){
        //     app.doAjax({
        //         url: 'release_records/accept',
        //         method: 'post',
        //         data: {
        //             sharedAt: shareAt,
        //             releaseRecordId: releaseRecordId
        //         }
        //     })
        // }else{
        //
        // }
        app.doAjax({
            url: "release_records/accepted_list",
            method: 'get',
            success: function(res) {
                console.log("doAjax： ",res);
                that.setData({
                    evaluationTrack: res
                })
            }
        });
    },
});
