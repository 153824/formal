const app = getApp();
Page({
    data: {
        childDepart: [
            {
                value: "5f9a66d5e128c35a1d28ab5d",
                label: "罗课",
                leaf: false,
                parentId: null
            }
        ],
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
    loadDepart(e, parent = false) {
        const {depart} = e.currentTarget.dataset;
        const departInfo = new Promise((resolve, reject) => {
            app.doAjax({
                url: 'departments/subdivision',
                method: 'get',
                data: {
                    entrance: 'WEWORK_MA',
                    funcCode: 'evaluationManage',
                    deptId: parent ? (depart.parentId || "") : depart.value
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
        const {index} = e.currentTarget.dataset;
        const targetDepart = this.loadDepart(e, true);
        targetDepart.then(res => {
            this.setData({
                routeMap: routeMap.slice(0, index),
                childDepart: res.data
            });
        }).catch(err => {
            throw err;
        });
    },
    changeDepart(e) {
        console.log(e.detail);
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
            console.log("_loadDepartInfo: ",res);
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
