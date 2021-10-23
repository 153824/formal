import debounce from "../../utils/lodash/debounce";
import {Tracker, umaEvent} from "../../uma.config";
import {exchangeEvaluationId, submit} from "../../api/report";

const app = getApp();

Page({
    data: {
        positionList: [
            'HR专员(招聘/薪酬/培训/绩效)',
            'HR主管/经理',
            'HRBP',
            'OD/TD/LD',
            'HRD/HRM',
            '业务部门负责人',
            'CEO/老板',
            '其他'
        ],
        positionIndex: -1,
        companyModelList: [
            '15人以下',
            '15-50人',
            '50-150人',
            '150-500人',
            '500-1000人',
            '1000人以上'
        ],
        companyModelIndex: -1,
        lastKeyword: '',
        lastResult: [],
        companyList: [],
        selectCompanyTrigger: false,
        currentCompany: '',
        currentKeyword: '',
        isDisabled: true,
        username: '',
        evaluationId: ''
    },

    async onLoad(options) {
        const {evaluationId} = await exchangeEvaluationId({receiveRecordId: options.receiveRecordId})
        this.setData({
            evaluationId,
            receiveRecordId: options.receiveRecordId
        })
    },

    onPositionChange(e) {
        const {value} = e.detail;
        this.setData({
            positionIndex: value
        })
    },

    onUsernameInput(e) {
        console.log(e);
        this.setData({
            username: e.detail.value
        })
    },

    onCompanyModelChange(e) {
        console.log('onCompanyModelChange: ', e);
        const {value} = e.detail;
        this.setData({
            companyModelIndex: value
        })
    },

    loadCompany: debounce(function (e){
        let canISearch = true;
        const currentKeyword = e.detail.value;
        const {lastResult, lastKeyword} = this.data;
        if(currentKeyword.indexOf(lastKeyword)>-1){
            if(lastResult.length === 0){
                canISearch = false;
            }
        }
        if(!lastKeyword && currentKeyword){
            canISearch = true;
        }
        if(!currentKeyword){
            canISearch = false;
        }
        canISearch && this.search(currentKeyword);
    }, 500, {trailing: true, leading: false}),

    search(currentKeyword) {
        const that = this;
        console.log('currentKeyword: ', currentKeyword);
        app.doAjax({
            url: '../wework/potential_customer/company',
            method: 'GET',
            noLoading: true,
            data: {
                name: currentKeyword,
            },
            success(res) {
                that.setData({
                    lastKeyword: currentKeyword,
                    lastResult: res,
                    companyList: res,
                });
                that.showSelectCompany();
            }
        });
    },

    showSelectCompany() {
        this.setData({
            selectCompanyTrigger: true
        })
    },

    hideSelectCompany() {
        this.setData({
            selectCompanyTrigger: false
        })
    },

    selectCompany(e) {
        const {company} = e.currentTarget.dataset;
        this.setData({
            currentCompany: company,
            currentKeyword: company,
        });
        this.hideSelectCompany();
    },

    goToReport() {

    },

    async submit() {
        const {
            currentCompany,
            currentPosition,
            lastKeyword,
            currentKeyword,
            evaluationId,
            companyModelList,
            companyModelIndex,
            positionList,
            positionIndex,
            username,
            receiveRecordId
        } = this.data;
        if((currentCompany || lastKeyword || currentKeyword).length <= 2){
            app.toast('企业名称至少为2个字');
            return
        }
        const data = {
            companyName: currentCompany || lastKeyword || currentKeyword,
            position: positionList[positionIndex],
            evaluationId: evaluationId,
            memberNum: companyModelList[companyModelIndex],
            userName: username
        }
        await submit(data)
        wx.navigateTo({
            url: `/pages/report/report?receiveRecordId=${receiveRecordId}`
        })
        try {
            const umaConfig = umaEvent.submitReportForm;
            new Tracker(wx).generate(umaConfig.tag)
        }
        catch (e) {
            console.log('友盟埋点统计')
        }
    },
});
