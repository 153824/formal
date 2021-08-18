import moment from '../../../../utils/moment'
const app = getApp();
Page({
    data: {
        scrollToIndex: '',
        showAdvance: false,
        headerHeight: 0,
        inviteCount: 0,
        maxCount: 15,
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
        // app.globalData.isWxWork
        isWxWork: true,
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
        corpid: ''
    },
    onLoad(options) {
        const that = this;
        setTimeout(()=>{
            wx.createSelectorQuery().select('#generate-header').boundingClientRect(res=>{
                that.setData({
                    headerHeight: res.height + 20
                })
            }).exec();
        }, 500);
        this.setData({
            isWxWork: true
        });
        this.loadRootDepart()
            .then(res=>{
                this.setData({
                    selectedTeam: {...res.data[0]},
                    rootTeam: {...res.data[0]},
                    corpid: res.corpId,
                });
            })
            .catch(err=>{
                console.error(err);
            })
    },
    onShow() {},
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
        const {selectedTeam, corpid} = this.data;
        if(Object.keys(selectedTeam).length && !selectedTeam.leaf){
            return
        }
        wx.navigateTo({
            url: `/pages/station/components/depart/depart?corpid=${corpid}&evaluationId=`
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
    }
});
