// test/finish.js
var app = getApp();
Page({
    data: {
        mpImg: "../img/mpImg.png",
        isTest: false,
        isMp: false, //是否显示关注公众号
        isSelf: "",
        reportPermit: "",
        receiveRecordId: "",
        evaluationId: "",
        targetURL: ""
    },
    onLoad: function (options) {
        const {receiveRecordId,evaluationId} = options;
        this.setData({
            isMp: false,
            isTest: app.isTest,
            receiveRecordId: receiveRecordId,
            evaluationId: evaluationId
        });
        this._checkedReceiveInfo(receiveRecordId);
        this._checkType(receiveRecordId);
    },
    onShow: function () {},
    onHide() {},
    onUnload() {

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
            const {receiveRecordId} = that.data;
            app.doAjax({
                url: `reports/${receiveRecordId}`,
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
        const {receiveRecordId, isSelf} = this.data;
        wx.navigateTo({
            url: `/pages/report/report?receiveRecordId=${receiveRecordId}&isSelf=${isSelf}`
        });
    },

    _checkedReceiveInfo: function (receiveRecordId) {
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

    _checkType: function (receiveRecordId) {
        let targetURL = "";
        const _this = this;
        const {isSelf,evaluationId} = this.data;
        app.doAjax({
            url: 'reports/check_type',
            method: 'get',
            data: {
                receiveRecordId: receiveRecordId
            },
            success: function (res) {
                if (isSelf && isSelf === "SHARE") {
                    targetURL = "/pages/user-center/components/receive-evaluations/receive-evaluations?redirect=user-center";
                } else {
                    targetURL = `/pages/station/components/detail/detail?id=${evaluationId}`;
                }
                _this.setData({
                    isSelf: res.data.type,
                    targetURL: targetURL
                })
            }
        })
    }

})
