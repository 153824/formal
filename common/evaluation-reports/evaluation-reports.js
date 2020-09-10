const app = getApp();
Component({
    properties: {
        reportList: {
            type: Array,
            value: []
        }
    },
    data: {
        reportList: []
    },
    methods: {},
    pageLifetimes: {
        onLoad: function (options) {
            const that = this;
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
        }
    }
});
