import debounce from "../../../../utils/lodash/debounce";

const app = getApp();

Component({
    properties: {
        evaluationId: {
            type: String,
            value: '',
        }
    },
    data: {
        isShow: false,
        stepName: 'record',
        lastKeyword: '',
        lastResult: [],
        currentKeyword: '',
        companyList: [],
        currentCompany: '',
        currentPosition: '',
        selectCompanyTrigger: false
    },
    methods: {
        hide() {
           this.setData({
               isShow: false
           });
        },

        show() {
            this.setData({
                isShow: true
            });
        },

        submit() {
            const that = this;
            const {currentCompany, currentPosition} = this.data;
            const {evaluationId} = this.properties;
            app.doAjax({
                url: '../wework/potential_customer',
                method: 'POST',
                data: {
                    companyName: currentCompany,
                    position: currentPosition,
                    evaluationId: evaluationId,
                },
                success() {
                    that.setData({
                        stepName: 'done'
                    });
                },
                error(e) {

                }
            });
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

        selectCompany(e) {
            const {company} = e.currentTarget.dataset;
            this.setData({
                currentCompany: company,
                currentKeyword: company,
            });
            this.hideSelectCompany();
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
    }
});
