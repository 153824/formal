const app = getApp();
Page({
    data: {
        childDepart: [],
        checkedDepart: "",
        routeMap: [],
        evaluationId: "",
        corpid: "",
        rootDepartId: '',
        rootDepartName: '',
        rootBindTpDepartId: '',
        is3rd: app.wx3rdInfo.is3rd,
        isWxWork: app.wxWorkInfo.isWxWork,
        scrollToRoute: '',
    },
    onLoad: function (options) {
        const {evaluationId, corpid} = options;
        if(corpid){
            this.setData({
                corpid
            })
        }
        if(evaluationId){
            this.setData({
                evaluationId: evaluationId
            })
        }
        this._loadRootDepart()
            .then(res => {
                console.log('_loadRootDepart： ',res.data[0].label);
                this.setData({
                    childDepart: res.data,
                    rootBindTpDepartId: res.data && res.data[0] ? res.data[0].bindTpDepartId : '',
                    rootDepartId: res.data && res.data[0] ? res.data[0].value : '',
                    rootDepartName: res.data && res.data[0] ? res.data[0].label : '',
                })
            })
            .catch(err => {
                console.error(err);
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
                    console.log(res);
                    resolve(res);
                },
                fail: (err) => {
                    reject(err)
                }
            })
        });
        return rootDepart;
    },
    loadDepart(e) {
        let {depart} = e.currentTarget.dataset;
        if(!depart){
            depart = {
                value: "",
                parentId: ""
            }
        }
        const departInfo = new Promise((resolve, reject) => {
            app.doAjax({
                url: 'departments/subdivision',
                method: 'get',
                data: {
                    entrance: 'WEWORK_MA',
                    funcCode: 'evaluationManage',
                    deptId: depart.value
                },
                success: (res) => {
                    resolve(res)
                },
                fail: (err) => {
                    reject(err)
                }
            });
        });
        return departInfo;
    },
    loadChildDepart(e) {
        const that = this;
        const {depart} = e.currentTarget.dataset;
        const {routeMap} = this.data;
        const childDepart = this.loadDepart(e);
        this.setData({
            childDepart: [],
        }, ()=>{
            childDepart.then(res => {
                routeMap.push(depart);
                this.setData({
                    routeMap: [...routeMap],
                    childDepart: res.data,
                },()=>{
                    that.setData({
                        scrollToRoute: `route-map-${routeMap.length - 1}`,
                    })
                    console.log(`route-map-${routeMap.length - 1}`)
                })
            }).catch(err => {
                throw err;
            });
        })
    },
    loadTargetDepart(e) {
        const {routeMap} = this.data;
        const {index,root} = e.currentTarget.dataset;
        const targetDepart = this.loadDepart(e);
        targetDepart.then(res => {
            this.setData({
                routeMap: root ? []:routeMap.slice(0, index+1),
                childDepart: [],
            },()=>{
                const index = this.data.routeMap.length - 1;
                this.setData({
                    childDepart: res.data,
                    scrollToRoute: `route-map-${index}`,
                })
            });
        }).catch(err => {
            throw err;
        });
    },
    changeDepart(e) {
        this.setData({
            checkedDepart: e.detail
        });
    },
    _loadDepartInfo() {
        const {checkedDepart} = this.data;
        const departInfo = new Promise((resolve, reject) => {
           app.doAjax({
               url: 'departments/by_id',
               method: 'get',
               data: {
                   deptId: checkedDepart
               },
               success: res=>{
                   console.log(res);
                   resolve(res);
               },
               fail: err=>{
                   reject(err);
               }
           })
        });
        return departInfo;
    },
    submit(e) {
        const {evaluationId} = this.data;
        this._loadDepartInfo()
            .then(res=>{
                const {deptName, deptId, bindTpDepartId, leaf, nodeChain} = res.data;
                wx.setStorageSync(`checked-depart-info-${evaluationId}`, {
                    bindTpDepartId,
                    label: deptName,
                    leaf: leaf,
                    nodeChain: nodeChain,
                    value: deptId,
                });
                wx.navigateBack();
            })
            .catch(err=>{
                throw err;
            });
    }
});
