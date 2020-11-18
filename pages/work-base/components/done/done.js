// test/finish.js
var app = getApp();
Page({
    data: {
        mpImg: "../img/mpImg.png",
        isTest: false,
        isMp: false, //是否显示关注公众号
        isSelf: "",
        reportPermit: ""
    },
    onLoad: function (options) {
        const receiveRecordId = options.receiveRecordId;
        this.setData({
            isMp: false,
            isTest: app.isTest,
            receiveRecordId: receiveRecordId,
        });
        this._checkedReceiveInfo(receiveRecordId);
    },
    onShow: function () {
        const {receiveRecordId} = this.data;
        this._checkType(receiveRecordId);
    },
    onUnload() {
        const {isSelf} = this.data;
        if (isSelf && isSelf === "SHARE") {
            wx.navigateTo({
                url: "/pages/user-center/components/receive-evaluations/receive-evaluations?redirect=user-center"
            })
        }
    },
    /**
     * 申请查看报告
     */
    toApply: function (e) {
        const that = this;
        const appId = wx.getAccountInfoSync().miniProgram.appId;
        let tmplIds = ['hw3Sa5T2AsPgHudjlhOIbFuA7Wn9pFyOFYAJAl0vdu8'];
        if (appId === 'wx85cde7d3e8f3d949') {
            tmplIds = ['TbdAz-JlO7o1Vw7J_iCznnkhUViAobPvyEz--L9WLRQ']
        }
        if (wx.requestSubscribeMessage) {
            wx.requestSubscribeMessage({
                // hw3Sa5T2AsPgHudjlhOIbFuA7Wn9pFyOFYAJAl0vdu8 - 悠悠测评
                // TbdAz-JlO7o1Vw7J_iCznnkhUViAobPvyEz--L9WLRQ - 好啦测评
                tmplIds,
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

    _checkedReceiveInfo: function(receiveRecordId) {
        const _this = this;
        app.doAjax({
            url: `wework/evaluations/receive_info/${receiveRecordId}`,
            method: "get",
            success: function (res) {
                _this.setData({
                    reportPermit: res.reportPermit
                });
            }
        })
    },

    _checkType: function(receiveRecordId) {
        const _this = this;
        app.doAjax({
            url: 'reports/check_type',
            method: 'get',
            data: {
                receiveRecordId: receiveRecordId
            },
            success: function (res) {
                _this.setData({
                    isSelf: res.data.type
                })
            }
        })
    }

})
