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
        routeMap: []
    },
    onLoad: function (options) {
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
               url: '',
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
    },
    submit(e) {
        wx.setStorageSync("checked-depart-info", {})
    }
});
