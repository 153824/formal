const app = getApp();
Page({
    data: {
        page: 0,
        tickets: [],
        isEmpty: false,
    },
    onLoad: function (options) {
        this.loadTickets();
    },
    loadTickets() {
        const that = this;
        const {tickets, page} = this.data;
        app.doAjax({
            url: 'wework/vouchers',
            method: 'GET',
            data: {
                page: page + 1,
                size: 10
            },
            success(res) {
                const {empty, page} = res;
                if (!empty) {
                    const targetTickets = [...tickets, ...res.items]
                    console.log(targetTickets);
                    that.setData({
                        page,
                        tickets: targetTickets,
                        isEmpty: empty
                    });
                } else {
                    app.toast("已为您加载所有相关内容");
                }
            },
            fail() {

            }
        })
    },
    goToNext() {
        this.loadTickets();
    }
});
