const app = getApp();
Page({
    data: {
        childDepart: [],
        checkedDepart: "",
        routeMap: [],
        evaluationId: ""
    },
    onLoad: function (options) {
        const {evaluationId} = options;
        if(evaluationId){
            this.setData({
                evaluationId: evaluationId
            })
        }
        this._loadRootDepart().then(res => {
            this.setData({
                childDepart: res.data,
            })
        }).catch(err => {
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
        childDepart.then(res => {
            routeMap.push(depart);
            this.setData({
                routeMap: routeMap,
                childDepart: res.data
            })
        }).catch(err => {
            throw err;
        });
    },
    loadTargetDepart(e) {
        const {routeMap} = this.data;
        const {index,root} = e.currentTarget.dataset;
        const targetDepart = this.loadDepart(e);
        targetDepart.then(res => {
            this.setData({
                routeMap: root ? []:routeMap.slice(0, index+1),
                childDepart: res.data
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
            const {deptName,deptId} = res.data;
            wx.setStorageSync(`checked-depart-info-${evaluationId}`, {
                text: deptName,
                value: deptId
            });
            wx.navigateBack();
        }).catch(err=>{
            throw err;
        });
    }
});
