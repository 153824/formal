const app = getApp();
Component({
    properties: {
        inviteInfo: {
            type: Object,
            value: {}
        },
        qrcode: {
            type: String,
            value: ""
        },
        releaseRecordId: {
            type: String,
            value: ""
        }
    },
    data: {
        isWxWork: app.wxWorkInfo.isWxWork,
        is3rd: app.wx3rdInfo.is3rd,
        isShow: false
    },
    methods: {
        showQRCode() {
            this.setData({
                isShow: true
            })
        },
        hideQRCode() {
            const that = this;
            this.setData({
                isShow: false
            })
            if(getCurrentPages()[getCurrentPages().length - 1].route === 'pages/station/components/generate/generate'){
                wx.redirectTo({
                    url: `/pages/work-base/components/grant/grant?releaseRecordId=${that.properties.releaseRecordId}`
                })
            }
        },
        saveToAlbum() {
            let {qrcode} = this.properties;
            wx.downloadFile({
                url: qrcode,
                success: res => {
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: res => {
                            wx.showModal({
                                title: "保存成功",
                                icon: "none"
                            })
                        },
                        fail: err => {
                            wx.showModal({
                                title: "保存失败",
                                icon: "none"
                            })
                        }
                    });
                },
                fail: err => {
                    wx.showModal({
                        title: "下载图片失败",
                        icon: "none"
                    })
                }
            })
        },
    },
    lifetimes: {
        attached() {
            this.setData({
                isWxWork: app.wxWorkInfo.isWxWork,
                is3rd: app.wx3rdInfo.is3rd,
            })
        }
    }
});
