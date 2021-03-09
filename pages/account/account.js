const app = getApp();
import {verifyPhoneFormat,isComplete} from '../../utils/utils';
Page({
    data: {
        phone: '',
        isDisabled: true,
        isWrong: false
    },
    onLoad: function (options) {
    },
    onChange(e) {
        console.log(e.detail);
        if(isComplete(e.detail, 11)){
            console.log(verifyPhoneFormat(e.detail));
            if(verifyPhoneFormat(e.detail)){
                this.setData({
                    isDisabled: false,
                    isWrong: false
                })
            }
            if(!verifyPhoneFormat(e.detail)){
                this.setData({
                    isDisabled: true,
                    isWrong: true
                })
            }
        }
        if(!isComplete(e.detail, 11)){
            this.setData({
                isDisabled: true,
                isWrong: false
            })
        }
        this.setData({
            phone: e.detail
        })
    },
    sendSMSCode() {
        const {phone} = this.data;
        app.getSMSCode(phone).then(res=>{
            wx.navigateTo({
                url: `/pages/account/subpages/verify/verify?phone=${phone}`
            })
        }).catch(err=>{
            console.error(err);
        });
    },
});
