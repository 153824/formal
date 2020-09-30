// test/finish.js
var app = getApp();
Page({
    data: {
        mpImg: "../img/mpImg.png",
        isTest: false,
        isMp: false, //是否显示关注公众号
        isSelf: ""
    },
    onLoad: function (options) {
        const id = options.id;
        this.setData({
            isMp: false,
            isTest: app.isTest,
            id: id,
            reportPermit: options.reportPermit,
        });
    },
    onShow: function () {
        const that = this;
        app.doAjax({
            url: 'reports/check_type',
            method: 'get',
            data: {
                receiveRecordId: that.data.id
            },
            success: function (res) {
                that.setData({
                    isSelf: res.data.type
                })
            }
        })
    },
    onUnload() {
        const {isSelf} = this.data;
        if (isSelf && isSelf === "SHARE") {
            wx.navigateTo({
                url: "/pages/user-center/components/receive-evaluations/receive-evaluations"
            })
        }
    },
    /**
     * 申请查看报告
     */
    toApply: function (e) {
        const that = this;
        if (wx.requestSubscribeMessage) {
            wx.requestSubscribeMessage({
                tmplIds: [
                    "Aw5JEz2yLyNc_opz2W6ketKPTlEC_q0fA2eQAYVPC4k"
                ],
                success: function () {
                    toNext();
                },
                fail: function () {
                    toNext();
                }
            });
        } else {
            toNext();
        }

        function toNext() {
            const {id} = that.data;
            app.doAjax({
                url: `reports/${id}`,
                method: "put",
                data: {
                    type: 'apply'
                },
                success: function (ret) {
                    that.setData({
                        isMp: true
                    });
                }
            });
        }
    },
    /**
     * 进入报告详情
     */
    toDetail: function (e) {
        const {id, isSelf} = this.data;
        wx.navigateTo({
            url: `/pages/report/report?receiveRecordId=${id}&isSelf=${isSelf}`
        });
    },

})
