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
        rootBindTpDepartId: "",
        corpid: "wwfaa9224ffb93c5b3"
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
            is3rd: app.wx3rdInfo.is3rd,
            isWxWork: app.wxWorkInfo.isWxWork,
            reportMeet: app.wxWorkInfo.isWxWork || app.wx3rdInfo.is3rd ? 2 : 1,
        });
        let storageInfo = wx.getStorageInfoSync().keys;
        let departInfo = wx.getStorageSync(`checked-depart-info-${id}`);
        const reg = /^checked-depart-info-.*/ig;
        storageInfo.forEach((item, key) => {
            if (reg.test(item) && !departInfo) {
                wx.removeStorageSync(item);
            }
        });
        if (!departInfo) {
            this._loadRootDepart().then(res => {
                const {label, value, bindTpDepartId} = res.data[0];
                this.setData({
                    dropDownOps: [
                        {
                            text: label,
                            value: value,

                        }
                    ],
                    dropdownValue: value,
                    defaultDeptId: value,
                    rootBindTpDepartId: bindTpDepartId,
                    corpid: res.corpid
                })
                this.loadDispatchInfo(value);
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
            this.loadDispatchInfo(dropDownOps.value);
            this.setData({
                dropDownOps: [dropDownOps],
                dropdownValue: dropDownOps.value
            });
        }
    },

    onHide() {
        this.selectComponent("#drop-item").toggle(false);
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
        let {
            count,
            evaluationName,
            norms,
            evaluationId,
            hadBuyout,
            isFree,
            maxCount,
            reportMeet,
            dispatchInfo,
            isWxWork,
            is3rd,
            defaultDeptId
        } = that.data;
        let costNum = count;
        if (!costNum && !hadBuyout && !isFree) {
            return;
        }
        if (!isWxWork && !is3rd && costNum > maxCount && !hadBuyout && !isFree) {
            console.error(JSON.stringify({
                isWxWork,
                isFree: isFree,
                hadBuyout: hadBuyout,
                costNum,
                maxCount,
            }))
            app.toast("测评可用数量不足!!");
            return;
        }
        if ((isWxWork || is3rd) && !isFree && !hadBuyout && !dispatchInfo.inventory) {
            console.error(JSON.stringify({
                isWxWork,
                is3rd,
                isFree: isFree,
                hadBuyout: hadBuyout,
                inventory: dispatchInfo.inventory
            }))
            app.toast("测评可用数量不足!");
            return;
        }
        try {
            wx.uma.trackEvent('1602212964270', {name: evaluationName, isFree: isFree})
        } catch (e) {

        }
        const releaseInfo = {
            evaluationId: evaluationId,
            normId: norms[0].normId,
            permitSetting: Number(reportMeet) === 1 ? "LOOSE" : "STRICT",
            releaseCount: costNum,
            entrance: "WECHAT_MA"
        };
        if (this.data.isWxWork || this.data.is3rd) {
            try {
                releaseInfo.deptId = wx.getStorageSync(`checked-depart-info-${evaluationId}`).value || defaultDeptId;
            } catch (e) {
                throw e;
            }
            releaseInfo.entrance = "WEWORK_MA";
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

    openContact(){
        wx.qy.selectEnterpriseContact({
            fromDepartmentId: -1,// 必填，-1表示打开的通讯录从自己所在部门开始展示, 0表示从最上层开始
            mode: "single",// 必填，选择模式，single表示单选，multi表示多选
            type: ["department"],// 必填，选择限制类型，指定department、user中的一个或者多个
            selectedDepartmentIds: ["2","3"],// 非必填，已选部门ID列表。用于多次选人时可重入
             success: function(res) {
                    console.log(res);
                     var selectedDepartmentList = res.result.departmentList;// 已选的部门列表
                     for (var i = 0; i < selectedDepartmentList.length; i++)
                     {
                              var department = selectedDepartmentList[i];
                              var departmentId = department.id;// 已选的单个部门ID
                              var departemntName = department.name;// 已选的单个部门名称
                      }
              }
      });
      
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
        const {evaluationId, corpid} = this.data;
        wx.navigateTo({
            url: `/pages/station/components/depart/depart?evaluationId=${evaluationId}&corpid=${corpid}`,
        })
    },

    loadDispatchInfo(departmentId) {
        const _this = this;
        const {evaluationId} = this.data;
        app.doAjax({
            url: `wework/evaluations/${evaluationId}/inventory/available/ma`,
            method: "get",
            data: {
                evaluationId: evaluationId,
                departmentId: departmentId
            },
            success: (res) => {
                _this.setData({
                    dispatchInfo: res,
                    maxCount: res.inventory
                })
            }
        })
    },

    _loadRootDepart() {
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
