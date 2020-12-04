// store/sharePaper.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        retData: {
            img: ""
        },
        maxCount: 0,
        evaluationId: 0,
        evaluationName: '',
        count: 1,
        reportMeet: 1,
        startTime: "",
        endTime: "",
        statusbarHeight: app.globalData.statusbarHeight,
        titleHeight: app.globalData.titleHeight,
        loading: "loading...",
        dropDownOps: [],
        dropdownValue: 0,
        isWxWork: false,
        dispatchInfo: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const {necessaryInfo} = options;
        const {count = 0, id = "", name = "", hadBuyout = false, isFree = false, norms = "", quesCount = 0, estimatedTime = 7} = JSON.parse(necessaryInfo);
        this.setData({
            maxCount: count,
            evaluationId: id,
            evaluationName: name,
            hadBuyout: hadBuyout,
            isFree: isFree,
            norms: norms,
            quesCount: quesCount,
            estimatedTime: estimatedTime
        });
        this.setData({
            isWxWork: app.wxWorkInfo.isWxWork
        });
        let storageInfo = wx.getStorageInfoSync().keys;
        let departInfo = wx.getStorageSync(`checked-depart-info-${id}`);
        const reg = /^checked-depart-info-.*/ig;
        storageInfo.forEach((item, key) => {
            if (reg.test(item) && !departInfo) {
                wx.removeStorageSync(item);
            }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        const {evaluationId,isWxWork} = this.data;
        const dropDownOps = wx.getStorageSync(`checked-depart-info-${evaluationId}`);
        if (dropDownOps && isWxWork) {
            this.selectComponent("#drop-item").toggle(false);
            this.loadDispatchInfo(dropDownOps.value);
            this.setData({
                dropDownOps: [dropDownOps],
                dropdownValue: dropDownOps.value
            });
        }
    },
    changeCount: function (e) {
        const that = this;
        const t = e.currentTarget.dataset.t;
        let {maxCount = 0, count, hadBuyout, isFree} = that.data;
        if (t == 1) {
            count -= 1;
        } else if (t == 2) {
            count += 1;
        } else {
            count = e.detail.value;
        }
        if (count > parseInt(maxCount) && !hadBuyout && !isFree) {
            that.setData({
                count: maxCount
            });
            app.toast("最大可选择数量为" + maxCount);
            return;
        }
        if (count < 1) {
            count = 0;
        }
        let countStr = count + "";
        if (countStr.startsWith("0") && countStr.length > 1) {
            countStr = countStr.substring(1, countStr.length);
        }
        count = Number(countStr);
        that.setData({
            count: count
        });
    },
    changeReportMeet: function (e) {
        const {canRead} = e.currentTarget.dataset;
        this.setData({
            reportMeet: canRead
        });
    },
    toSharePaper: function () {
        const that = this;
        let {count, evaluationName, norms, evaluationId, hadBuyout, isFree, maxCount, reportMeet, quesCount, estimatedTime} = that.data;
        let costNum = count;
        if (!costNum && !hadBuyout && !isFree) {
            return;
        }
        if (costNum > maxCount && !hadBuyout && !isFree) {
            app.toast("测评可用数量不足");
            return;
        }
        try {
            wx.uma.trackEvent('1602212964270', {name: evaluationName, isFree: isFree})
        } catch (e) {

        }
        const releaseInfo = {
            evaluationId: evaluationId,
            normId: norms[0].normId,
            permitSetting: reportMeet === 1 ? "LOOSE" : "STRICT",
            releaseCount: costNum,
            entrance: "WECHAT_MA"
        };
        if(this.data.isWxWork){
            try {
                releaseInfo.deptId = wx.getStorageSync(`checked-depart-info-${evaluationId}`).value;
            }catch (e) {
                throw e;
            }
            releaseInfo.entrance = "WEWORK_MA";
        }
        app.doAjax({
            url: "../wework/evaluations/share/qr_code",
            method: "post",
            data: releaseInfo,
            success: function (res) {
                that.setData({
                    sharePaperInfo: res
                });
            }
        })
    },
    /**
     * 隐藏分享码
     */
    closeQrCode: function (e) {
        const that = this;
        wx.redirectTo({
            url: `../../../work-base/components/track-detail/track-detail?trackId=${that.data.sharePaperInfo.releaseRecordId}`
        })
    },

    saveImage: function () {
        const {sharePaperInfo} = this.data;
        wx.previewImage({
            urls: [sharePaperInfo.invitationImgUrl]
        })
    },

    saveToAlbum: function () {
        let {img} = this.data.sharePaperInfo;
        wx.downloadFile({
            url: img,
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

    open: function () {
        this.selectComponent("#drop-item").toggle(false);
        const {evaluationId} = this.data;
        wx.navigateTo({
            url: `/pages/station/components/depart/depart?evaluationId=${evaluationId}`,
        })
    },

    loadDispatchInfo(departmentId){
        const _this = this;
        const {evaluationId} = this.data;
        app.doAjax({
            url: `wework/evaluations/${evaluationId}/inventory/available/ma`,
            method: "get",
            data: {
                evaluationId: evaluationId,
                departmentId: departmentId
            },
            success: (res)=>{
                _this.setData({
                    dispatchInfo: res
                })
            }
        })
    },

    onShareAppMessage(options) {
        const {evaluationName} = this.data;
        const {img, smallImg = "",invitationImgUrl} = this.data.sharePaperInfo;
        return {
            title: `您有一个测评邀请，请尽快作答`,
            path: `/common/webView?img=${invitationImgUrl}&title=true`,
            imageUrl: smallImg,
        }
    }
})
