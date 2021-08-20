import moment from '../../../../utils/moment'
const app = getApp();
Page({
    data: {
        scrollToIndex: '',
        showAdvance: false,
        headerHeight: 0,
        inviteCount: 1,
        canUSeeReport: 'refuse', // refuse 不允许；agree 允许；
        expireModel: 'short', // forever 长期有效；short 时间期内有效；
        minHour: 10,
        maxHour: 20,
        minDate: new Date().getTime(),
        maxDate: new Date(2200, 10, 1).getTime(),
        currentDate: new Date().getTime(),
        startTime: -1,
        endTime: -1,
        timeModel: 'start', // start 开始时间; end 结束时间;
        canIUsePicker: false,
        isWxWork: app.globalData.isWxWork,
        is3rd: app.globalData.is3rd,
        selectedTeam: {
            label: "",
            leaf: true,
            nodeChain: "",
            value: "",
            bindTpDepartId: ""
        },
        rootTeam: {
            label: "",
            leaf: true,
            nodeChain: "",
            value: "",
            bindTpDepartId: ""
        },
        corpid: '',
        norms: [],
        evaluationId: '',
        evaluationName: '',
        maxCount: 15,
        shareCover: '',
        releaseRecordId: ''
    },
    onLoad(options) {
        const that = this;
        console.log(options);
        const {norms=[], evaluationId=""} = options && options.necessaryInfo ? JSON.parse(options.necessaryInfo) : {};
        setTimeout(()=>{
            wx.createSelectorQuery().select('#generate-header').boundingClientRect(res=>{
                that.setData({
                    headerHeight: res.height + 20
                })
            }).exec();
        }, 500);
        this.setData({
            isWxWork: true,
            norms,
            evaluationId
        });
        this.loadRootDepart()
            .then(res=>{
                this.setData({
                    selectedTeam: {...res.data[0]},
                    rootTeam: {...res.data[0]},
                    corpid: res.corpId,
                });
                return Promise.resolve(res);
            })
            .then(res=>{
                const {selectedTeam} = this.data;
                return this.loadDispatchInfo(selectedTeam.value);
            })
            .then(res=>{
                console.log(res);
            })
            .catch(err=>{
                console.error(err);
            });
        this.loadEvaluationInfo(evaluationId);
        this.loadEvaluationDetail(evaluationId);

    },
    onShow() {
        const {evaluationId} = this.data;
        const selectedTeam = wx.getStorageSync(`checked-depart-info-${evaluationId}`)
        if(Object.keys(selectedTeam).length){
            this.setData({
                selectedTeam
            });
            this.loadDispatchInfo(selectedTeam.value);
        }
    },
    loadRootDepart() {
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
    loadDispatchInfo(departmentId) {
        const that = this;
        const {evaluationId} = this.data;
        console.log("departmentId, evaluationId: ", departmentId, evaluationId);
        app.doAjax({
            url: `wework/evaluations/${evaluationId}/inventory/available/ma`,
            method: "get",
            data: {
                evaluationId: evaluationId,
                departmentId: departmentId,
            },
            success: (res) => {
                const {total} = res;
                that.setData({
                    dispatchInfo: res,
                    maxCount: total
                })
            }
        });
    },
    goToAdvance() {
        const that = this;
        const {showAdvance, headerHeight} = this.data;
        let scrollTop = showAdvance ? 0 : headerHeight;
        this.setData({
            showAdvance: !that.data.showAdvance
        })
        wx.pageScrollTo({
            scrollTop
        })
    },
    goToDepart() {
        const {corpid, evaluationId} = this.data;
        wx.navigateTo({
            url: `/pages/station/components/depart/depart?corpid=${corpid}&evaluationId=${evaluationId}`
        })
    },
    onInviteInput(e) {
        const targetCount = Number(e.detail.value);
        const {maxCount} = this.data;
        if(targetCount > maxCount){
            this.setData({
                inviteCount: maxCount
            })
            app.toast(`最多可发放${maxCount}份`)
            return
        }
        this.setData({
            inviteCount: targetCount
        })
    },
    addCount() {
        const {inviteCount, maxCount} = this.data;
        this.setData({
            inviteCount: inviteCount + 1 > maxCount  ? maxCount : inviteCount + 1
        })
        if(inviteCount + 1 > maxCount){
            app.toast(`最多可发放${maxCount}份`)
        }
    },
    subCount() {
        const {inviteCount, maxCount} = this.data;
        this.setData({
            inviteCount: inviteCount - 1 <= 0 ? 0 : inviteCount - 1
        })
    },
    setReportAuth(e) {
        const {type} = e.currentTarget.dataset;
        this.setData({
            canUSeeReport: type
        })
    },
    setExpireModel(e) {
        const {type} = e.currentTarget.dataset;
        this.setData({
            expireModel: type
        })
    },
    onConfirm(e) {
        const targetTime = moment(e.detail).format('YYYY/MM/DD hh:mm');
        const {timeModel, startTime, endTime} = this.data;
        if((startTime === targetTime || endTime === targetTime)){
            app.toast('开始时间与结束时间不能相同');
            return;
        }
        this.setData({
            currentDate: e.detail,
        });
        if(timeModel === 'start'){
            this.setData({
                startTime: moment(e.detail).format('YYYY/MM/DD hh:mm'),
            });
        } else {
            this.setData({
                endTime: moment(e.detail).format('YYYY/MM/DD hh:mm'),
            });
        }
        this.onCancel()
    },
    setTime(e) {
        const {model} = e.currentTarget.dataset;
        this.setData({
            timeModel: model,
            canIUsePicker: true
        })
    },
    onCancel() {
        this.setData({
            canIUsePicker: false
        })
    },
    invite() {
        const that = this;
        const {evaluationId, norms, inviteCount, canUSeeReport, isWxWork, is3rd, selectedTeam} = this.data;
        const releaseInfo = {
            evaluationId: evaluationId,
            normId: norms[0].normId,
            permitSetting: canUSeeReport === 'refuse' ? "STRICT" : "LOOSE",
            releaseCount: inviteCount,
            entrance: "WECHAT_MA",
        };
        try {
            releaseInfo.deptId = selectedTeam.value;
        } catch (e) {
            throw e;
        }
        if (isWxWork||is3rd) {
            releaseInfo.entrance = "WEWORK_MA";
        }
        app.doAjax({
            url: "wework/evaluations/share/qr_code",
            method: "post",
            data: releaseInfo,
            success(res) {
                that.setData({
                    qrcode: res.invitationImgUrl,
                    releaseRecordId: res.releaseRecordId
                });
                that.showQRCode()
            }
        });
    },
    showQRCode() {
        console.log(this.selectComponent('#preview-image'));
        this.selectComponent('#preview-image').showQRCode();
    },
    loadEvaluationInfo(evaluationId) {
        const that = this;
        app.doAjax({
            url: `../wework/evaluations/${evaluationId}/info`,
            method: 'GET',
            success(res) {
                console.log(res);
                that.setData({
                    evaluationName: res.name
                })
            }
        })
    },
    loadEvaluationDetail(evaluationId) {
        const that = this;
        app.doAjax({
            url: "evaluations/outline",
            method: "get",
            data: {
                evaluationId: evaluationId
            },
            success: res => {
                that.setData({
                    shareCover: res.smallImg
                });
            }
        });
    },
    onShareAppMessage(options) {
        const {evaluationName, shareCover, releaseRecordId} = this.data;
        return {
            title: `邀您参加《${evaluationName}》`,
            path: `pages/work-base/components/guide/guide?releaseRecordId=${releaseRecordId}`,
            imageUrl: shareCover,
        }
    }
});
