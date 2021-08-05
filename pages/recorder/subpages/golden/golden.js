import {getEnv, umaEvent} from "../../../../uma.config";

const app = getApp();
Page({
    data: {
        redirect: '',
        goldenText: '',
        isSelf: ''
    },
    onLoad: function (options={redirect: {}}) {
        const that = this;
        let redirect = JSON.parse(options.redirect)
        this.setData({
            redirect,
        })
        app.checkOfferType(redirect.receiveRecordId).then(res=>{
            that.setData({
                isSelf: res.type
            })
        })
        this.getGolden(redirect.receiveRecordId);
    },
    goToReplying() {
        const {isSelf} = this.data;
        const {url, evaluationId, receiveRecordId, isChapter} = this.data.redirect;
        const targetURL = isChapter ? `${url}?receiveRecordId=${receiveRecordId}&evaluationId=${evaluationId}` : `${url}?receiveRecordId=${receiveRecordId}`
        wx.redirectTo({
            url: targetURL
        });
        const type = isSelf.toLowerCase() === 'self' ? 'self' : 'scan';
        const umaConfig = umaEvent.agreeGolden;
        wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin[type], env: getEnv(wx)});
    },
    getGolden(receiveRecordId) {
        const that = this;
        app.doAjax({
            url: `../wework/evaluations/${receiveRecordId}/synopsis`,
            method: 'GET',
            success(res) {
                that.setData({
                    goldenText: res.commitment
                })
            },
        })
    }
});
