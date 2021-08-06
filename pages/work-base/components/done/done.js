// test/finish.js
import {getEnv, getTag, umaEvent} from "../../../../uma.config";

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
        targetURL: "/pages/home/home",
        evaluationName: "",
    },
    onLoad: function (options) {
        const {receiveRecordId, evaluationId} = options;
        this.setData({
            isMp: false,
            isTest: app.isTest,
            receiveRecordId: receiveRecordId,
            evaluationId: evaluationId
        });
        if(receiveRecordId){
            this._checkedReceiveInfo(receiveRecordId);
            this._checkType(receiveRecordId);
        }
    },
    onShow: function () {
    },
    onHide() {
    },
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
        const umaConfig = umaEvent.getInReport;
        const {receiveRecordId, isSelf, evaluationName} = this.data;
        wx.navigateTo({
            url: `/pages/report/report?receiveRecordId=${receiveRecordId}&isSelf=${isSelf}`
        });
        wx.uma.trackEvent(umaConfig.tag, {"来源": umaConfig.origin.self, "测评名称": `${evaluationName}`, "环境": getEnv(wx), "用户场景": getTag(wx)});
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
        const {evaluationId} = this.data;
        app.doAjax({
            url: 'reports/check_type',
            method: 'get',
            data: {
                receiveRecordId: receiveRecordId
            },
            success: function (res) {
                const isSelf = res.data.type;
                if (isSelf && isSelf === "SHARE") {
                    targetURL = "/pages/user-center/components/receive-evaluations/receive-evaluations?redirect=user-center";
                } else {
                    targetURL = `/pages/station/components/detail/detail?id=${res.data.evaluationId}`;
                }
                _this.setData({
                    isSelf: isSelf,
                    targetURL: targetURL,
                    evaluationName: res.data.evaluationName
                })
            }
        })
    }

})
