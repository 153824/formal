import {getEnv, getTag, umaEvent} from "../../../../uma.config";

const app = getApp();
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
        smallImg: "",
        dropDownOps: [],
        dropdownValue: 0,
        isWxWork: false,
        is3rd: false,
        dispatchInfo: {},
        defaultDeptId: "",
        rootBindTpDepartId: 1,
        bindTpDepartId: 1,
        corpid: "",
        openDataKey: new Date().getTime(),
        availableVoucher: 0,
        availableInventory: 0,
        useVoucher: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const {necessaryInfo} = options;
        const {
            count = 0,
            id = "",
            name = "",
            isFree = false,
            norms = "",
            quesCount = 0,
            estimatedTime = 7,
            avaliableVoucher = 0,
            avaliableInventory = 0,
            useVoucher
        } = JSON.parse(necessaryInfo);
        this.setData({
            maxCount: count,
            evaluationId: id,
            evaluationName: name,
            isFree: isFree,
            norms: norms,
            quesCount: quesCount,
            estimatedTime: estimatedTime,
            avaliableVoucher,
            avaliableInventory,
            useVoucher
        });
        this.setData({
            is3rd: app.wx3rdInfo.is3rd,
            isWxWork: app.wxWorkInfo.isWxWork,
            reportMeet: app.wxWorkInfo.isWxWork || app.wx3rdInfo.is3rd ? 2 : 1,
        });
        let targetBindTpDepartId = '';
        let storageInfo = wx.getStorageInfoSync().keys;
        let departInfo = wx.getStorageSync(`checked-depart-info-${id}`) || {};
        const reg = /^checked-depart-info-.*/ig;
        storageInfo.forEach((item, key) => {
            if (reg.test(item) && !departInfo) {
                wx.removeStorageSync(item);
            }
        });
        if(this.data.isWxWork){
            this._loadRootDepart().then(res => {
                const {label, value, bindTpDepartId} = res.data[0];
                console.log(label, value);
                targetBindTpDepartId = bindTpDepartId;
                this.setData({
                    dropDownOps: [
                        {
                            text: label,
                            value: value,
                        }
                    ],
                    dropdownValue: value,
                    defaultDeptId: value,
                    corpid: res.corpId
                })
                if(departInfo && departInfo.bindTpDepartId){
                    targetBindTpDepartId = departInfo.bindTpDepartId
                }
                this.setData({
                    bindTpDepartId: targetBindTpDepartId
                })
                this.loadDispatchInfo(value);
            }).catch(err=>{
                console.error(err)
            })
        }
        this._loadEvaluationDetail(id);
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
        const {evaluationId, isWxWork, is3rd} = this.data;
        const dropDownOps = wx.getStorageSync(`checked-depart-info-${evaluationId}`);
        if (dropDownOps && (isWxWork || is3rd)) {
            this._loadRootDepart()
                .then(res=>{
                    this.setData({
                        corpid: res.corpId
                    })
                    return this.loadDispatchInfo(dropDownOps.value);
                })
                .then(res=>{
                    try{
                        this.setData({
                            dropDownOps: [dropDownOps],
                            dropdownValue: dropDownOps.value,
                            bindTpDepartId: isWxWork ? dropDownOps.bindTpDepartId || res.data[0].bindTpDepartId : ''
                        });
                    }
                    catch (e) {

                    }
                })
        }
    },

    onHide() {
        this.selectComponent("#drop-item").toggle(false);
    },

    onUnload() {
        const {evaluationId} = this.data;
        try {
            wx.removeStorageSync(`checked-depart-info-${evaluationId}`);
        }
        catch (e) {
            console.error(e);
        }
    },

    changeCount: function (e) {
        const that = this;
        const t = e.currentTarget.dataset.t;
        let {maxCount = 0, count, isFree} = that.data;
        if (t == 1) {
            count -= 1;
        } else if (t == 2) {
            count += 1;
        } else {
            count = e.detail.value;
        }
        if (count > parseInt(maxCount) && !isFree) {
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
        let {
            count,
            evaluationName,
            norms,
            evaluationId,
            isFree,
            maxCount,
            reportMeet,
            dispatchInfo,
            isWxWork,
            is3rd,
            defaultDeptId,
            useVoucher
        } = that.data;
        let costNum = count;
        if (!costNum && !isFree) {
            return;
        }
        if (!isWxWork && !is3rd && costNum > maxCount && !isFree) {
            console.error(JSON.stringify({
                isWxWork,
                isFree: isFree,
                costNum,
                maxCount,
            }))
            app.toast("测评可用数量不足!!");
            return;
        }
        if ((isWxWork || is3rd) && !isFree && !dispatchInfo.total) {
            console.error(JSON.stringify({
                isWxWork,
                is3rd,
                isFree: isFree,
                inventory: dispatchInfo.total
            }))
            app.toast("测评可用数量不足!");
            return;
        }
        const releaseInfo = {
            evaluationId: evaluationId,
            normId: norms[0].normId,
            permitSetting: Number(reportMeet) === 1 ? "LOOSE" : "STRICT",
            releaseCount: costNum,
            entrance: "WECHAT_MA",
            useVoucher: true
        };
        if (this.data.isWxWork || this.data.is3rd) {
            try {
                releaseInfo.deptId = wx.getStorageSync(`checked-depart-info-${evaluationId}`).value || defaultDeptId;
            } catch (e) {
                throw e;
            }
            releaseInfo.entrance = "WEWORK_MA";
            releaseInfo.useVoucher = wx.getStorageSync('userInfo').isSuperAdmin;
        }
        app.doAjax({
            url: "wework/evaluations/share/qr_code",
            method: "post",
            data: releaseInfo,
            success: function (res) {
                that.setData({
                    sharePaperInfo: res
                });
            }
        });
        const umaConfig = umaEvent.generateInvite;
        const currentRoute = getCurrentPages()[getCurrentPages().length - 2].route;

        if(umaConfig.route.bench.includes(currentRoute)){
            wx.uma.trackEvent(umaConfig.tag, {"来源": umaConfig.origin.bench, "测评名称": `${evaluationName}`, "环境": getEnv(wx), "用户场景": getTag(wx)})
        } else {
            wx.uma.trackEvent(umaConfig.tag, {"来源": umaConfig.origin.detail, "测评名称": `${evaluationName}`, "环境": getEnv(wx), "用户场景": getTag(wx)})
        }
    },
    /**
     * 隐藏分享码
     */
    closeQrCode: function (e) {
        const that = this;
        wx.redirectTo({
            url: `../../../work-base/components/track-detail/track-detail?trackId=${that.data.sharePaperInfo.releaseRecordId}&tabIndex=2`
        })
    },

    saveImage: function () {
        const {sharePaperInfo} = this.data;
        wx.previewImage({
            urls: [sharePaperInfo.invitationImgUrl]
        })
    },

    saveToAlbum: function () {
        let {invitationImgUrl} = this.data.sharePaperInfo;
        wx.downloadFile({
            url: invitationImgUrl,
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

    _loadEvaluationDetail(evaluationId) {
        const _this = this;
        app.doAjax({
            url: "evaluations/outline",
            method: "get",
            data: {
                evaluationId: evaluationId
            },
            success: res => {
                _this.setData({
                    smallImg: res.smallImg
                });
            }
        })
    },

    open: function () {
        const that = this;
        const {evaluationId, corpid} = this.data;
        wx.navigateTo({
            url: `/pages/station/components/depart/depart?evaluationId=${evaluationId}&corpid=${corpid}`,
            success(res) {
                that.setData({
                    corpid: ''
                })
            }
        })
    },

    loadDispatchInfo(departmentId) {
        const _this = this;
        const {evaluationId, isWxWork} = this.data;
        if(!isWxWork){
            return Promise.reject();
        }
        app.doAjax({
            url: `wework/evaluations/${evaluationId}/inventory/available/ma`,
            method: "get",
            data: {
                evaluationId: evaluationId,
                departmentId: departmentId,
            },
            success: (res) => {
                const {availableVoucher, availableInventory, total} = res;
                _this.setData({
                    dispatchInfo: res,
                    maxCount: total,
                    availableVoucher,
                    availableInventory
                })
            }
        })
    },

    _loadRootDepart() {
        if(!this.data.isWxWork){
            return Promise.reject();
        }
        const rootDepart = new Promise((resolve, reject) => {
            app.doAjax({
                url: 'departments/subdivision',
                method: 'get',
                data: {
                    entrance: 'WEWORK_MA',
                    funcCode: 'evaluationManage'
                },
                success: (res) => {
                    resolve(res);
                },
                fail: (err) => {
                    reject(err)
                }
            })
        });
        return rootDepart;
    },

    onShareAppMessage(options) {
        const {evaluationName, smallImg, sharePaperInfo} = this.data;
        const {releaseRecordId} = sharePaperInfo;
        return {
            title: `邀您参加《${evaluationName}》`,
            path: `pages/work-base/components/guide/guide?releaseRecordId=${releaseRecordId}`,
            imageUrl: smallImg,
        }
    }
});
