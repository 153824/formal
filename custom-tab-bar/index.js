Component({
    properties: {},
    data: {
        active: 1,
        icon: {
            indexNormal: 'http://ihola.luoke101.com/index_no_active.png',
            indexActive: 'http://ihola.luoke101.com/index_active.png',
            stationNormal: 'http://ihola.luoke101.com/person_job_no_active%402x.png',
            stationActive: 'http://ihola.luoke101.com/person_job_active%402x.png',
            managerNormal: 'http://ihola.luoke101.com/evaluation-manager-no-active%402x.png',
            managerActive: 'http://ihola.luoke101.com/evaluation-manager-active%402x.png',
            userNormal: 'http://ihola.luoke101.com/my_no_active%402x.png',
            userActive: 'http://ihola.luoke101.com/my_active%402x.png',
        },
        paths: [
            {
                "pagePath": "index/index",
            },
            {
                "pagePath": "station/station",
            },
            {
                "pagePath": "manager/manager",
            },
            {
                "pagePath": "user/index",
            }
        ]
    },
    methods: {
        onChange(event) {
            const { paths } = this.data;
            wx.switchTab({
                url: `../${paths[event.detail].pagePath}`
            });
            this.setData({ active: event.detail });
        },
        init() {
            const page = getCurrentPages().pop();
            console.log("page",page.route);
            this.setData({
                active: this.data.paths.findIndex(item => item.pagePath === `${page.route}`)
            });
        }
    },
});
