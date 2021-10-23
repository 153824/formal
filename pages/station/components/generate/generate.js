import moment from '../../../../utils/moment'
import {Tracker, umaEvent} from "../../../../uma.config";
const app = getApp();
Page({
    data: {
        scrollToIndex: '',
        showAdvance: false,
        headerHeight: 0,
        inviteCount: 1,
        canUSeeReport: 'agree', // refuse 不允许；agree 允许；
        expireModel: 'forever', // forever 长期有效；short 时间期内有效；
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
        maxCount: 0,
        shareCover: '',
        releaseRecordId: '',
        gentKey: new Date().getTime(),
        showVIP: false
    },
    onLoad(options) {
        const that = this;
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
                return Promise.resolve(res.data[0]);
            })
            .then(res=>{
                return this.loadDispatchInfo(res.value);
            })
            .then(res=>{
                console.log(res);
            })
            .catch(err=>{
                console.error(err);
            });
        this.loadEvaluationInfo(evaluationId);
        this.loadEvaluationDetail(evaluationId);
        const umaConfig = umaEvent.getInGenerate;
        const currentRoute = getCurrentPages()[getCurrentPages().length - 2].route;
        if(umaConfig.route.bench.includes(currentRoute)){
            try{
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.bench});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        } else {
            try{
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.detail});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
    },
    onShow() {
        const {evaluationId} = this.data;
        const selectedTeam = wx.getStorageSync(`checked-depart-info-${evaluationId}`)
        if(Object.keys(selectedTeam).length){
            this.setData({
                selectedTeam: {...selectedTeam},
                isShowWWOpenData: false
            },()=>{
                this.setData({
                    isShowWWOpenData: true
                })
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
                const {number} = res;
                that.setData({
                    dispatchInfo: res,
                    maxCount: res.type === 'BY_TIME' ? 999999999 : number
                });
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
        const nowTimestamp = new Date().getTime();
        const targetCount = Number(e.detail.value);
        const {maxCount, dispatchInfo} = this.data;
        const isByCount = dispatchInfo.type === 'BY_COUNT';
        if(targetCount > maxCount && isByCount){
            this.setData({
                inviteCount: maxCount
            })
            app.toast(`最多可发放${maxCount}份`)
            return
        }
        if(!isByCount && dispatchInfo.number < nowTimestamp){
            this.setData({
                inviteCount: 0
            });
            app.toast(`买断方案已过期`)
            return
        }
        this.setData({
            inviteCount: targetCount
        });
    },
    addCount() {
        const {inviteCount, maxCount, dispatchInfo} = this.data;
        const isByCount = dispatchInfo.type === 'BY_COUNT';
        this.setData({
            inviteCount: inviteCount + 1 > maxCount  ? maxCount : inviteCount + 1
        })
        if(inviteCount + 1 > maxCount && isByCount){
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
        if(type === 'vip'){
            this.openOverlay()
            const umaConfig = umaEvent.clickCantWatchReport;
            const currentRoute = getCurrentPages()[getCurrentPages().length - 2].route;
            if(umaConfig.route.bench.includes(currentRoute)){
                try{
                    new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.bench});
                }
                catch (e) {
                    console.log('友盟数据统计',e);
                }
            } else {
                try{
                    new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.detail});
                }
                catch (e) {
                    console.log('友盟数据统计',e);
                }
            }
            return
        }
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
        const targetTime = moment(e.detail).format('YYYY/MM/DD HH:mm');
        console.log(targetTime);
        const {timeModel, startTime, endTime} = this.data;
        if((startTime === targetTime || endTime === targetTime) && (startTime !== -1 || endTime !== -1)){
            app.toast('开始时间与结束时间不能相同');
            return;
        }
        this.setData({
            currentDate: e.detail,
        });
        if(timeModel === 'start'){
            this.setData({
                startTime: moment(e.detail).format('YYYY/MM/DD HH:mm'),
            });
        } else {
            this.setData({
                endTime: moment(e.detail).format('YYYY/MM/DD HH:mm'),
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
        const umaConfig = umaEvent.generateInvite;
        const {maxCount, evaluationName, evaluationId, norms, inviteCount, canUSeeReport, isWxWork, is3rd, selectedTeam, expireModel, startTime, endTime} = this.data;
        const releaseInfo = {
            evaluationId: evaluationId,
            normId: norms[0].normId,
            permitSetting: canUSeeReport === 'refuse' ? "STRICT" : "LOOSE",
            releaseCount: inviteCount,
            entrance: "WECHAT_MA",
        };
        if(!inviteCount){
            app.toast('邀请参与测评的人数最少为 1')
            return
        }
        if(!maxCount){
            app.toast('可用份数为 0')
            return
        }
        try {
            releaseInfo.deptId = selectedTeam.value;
        } catch (e) {
            throw e;
        }
        if (isWxWork||is3rd) {
            releaseInfo.entrance = "WEWORK_MA";
        }
        if(expireModel === 'short'){
            releaseInfo.beginTime = moment(startTime).valueOf();
            releaseInfo.endTime = moment(endTime).valueOf();
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
        const currentRoute = getCurrentPages()[getCurrentPages().length - 2].route;
        if(umaConfig.route.bench.includes(currentRoute)){
            try{
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.bench, name: `${evaluationName}`,});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        } else {
            try{
                new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.detail, name: `${evaluationName}`,});
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
    },
    showQRCode() {
        console.log(this.selectComponent('#preview-image'));
        this.selectComponent('#preview-image').showQRCode();
    },
    async loadEvaluationInfo(evaluationId) {
        const res = await app.loadEvaluationInfo(evaluationId)
        this.setData({
            evaluationName: res.name
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
    goToCustomerService() {
        try{
            app.openContactService()
        }
        catch (err) {
            console.error(err);
        }
        try{
            const umaConfig = umaEvent.customerService;
            new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.report});
        }
        catch (e) {
            console.log('友盟数据统计',e);
        }
    },
    closeOverlay() {
        this.setData({
            showVIP: false
        })
    },
    openOverlay() {
        this.setData({
            showVIP: true
        })
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
