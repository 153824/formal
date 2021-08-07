const app = getApp();
Page({
    data: {
        sectionId: "",
        evaluations: [],
        page: 0,
        size: 10
    },
    onLoad: function (options={sectionId: ""}) {
        this.setData({
            sectionId: options.sectionId
        })
        this.loadEvaluation();
    },

    loadEvaluation(){
        const that = this;
        const {page, size, evaluations, sectionId} = this.data;
        app.doAjax({
            url: `../wework/homepages/evaluations/${sectionId}`,
            method: 'GET',
            data: {
                page: page + 1,
                size
            },
            success(res) {
                if(!!res.length){
                    that.setData({
                        evaluations: [...evaluations, ...res],
                        page: page + 1
                    })
                }
            }
        })
    }
});
