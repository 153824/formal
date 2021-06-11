const app = getApp();
Page({
    data: {
        childDepart: [],
        checkedDepart: "",
        routeMap: [],
        evaluationId: "",
        corpid: "",
        rootDepartId: '',
        rootBindTpDepartId: '',
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
        this._loadRootDepart().then(res => {
            console.log('_loadRootDepart： ',res);
            this.setData({
                childDepart: res.data,
                rootBindTpDepartId: res.data && res.data[0] ? res.data[0].bindTpDepartId : '',
                rootDepartId: res.data && res.data[0] ? res.data[0].value : '',
            })
        }).catch(err => {
            console.error(err);
        })
    },
    onUnload() {
        const {evaluationId, rootDepartId, rootBindTpDepartId} = this.data;
        const flag = wx.getStorageSync(`checked-depart-info-${evaluationId}`)
        if (!flag) {
            wx.setStorageSync(`checked-depart-info-${evaluationId}`, {
                value: rootDepartId,
                bindTpDepartId: rootBindTpDepartId
            });
        }
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
        console.log(e);
        const {depart} = e.currentTarget.dataset;
        const {routeMap} = this.data;
        const childDepart = this.loadDepart(e);
        this.setData({
            childDepart: [],
        }, ()=>{
            childDepart.then(res => {
                routeMap.push(depart);
                console.log('routeMap.push: ',routeMap);
                console.log('loadChildDepart： ',res.data);
                this.setData({
                    routeMap: [...routeMap],
                    childDepart: res.data,
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
                childDepart: res.data,
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
        this._loadDepartInfo().then(res=>{
            console.log('_loadDepartInfo: ', res.data);
            const {deptName,deptId, bindTpDepartId} = res.data;
            wx.setStorageSync(`checked-depart-info-${evaluationId}`, {
                text: deptName,
                value: deptId,
                bindTpDepartId
            });
            wx.navigateBack();
        }).catch(err=>{
            throw err;
        });
    }
});
