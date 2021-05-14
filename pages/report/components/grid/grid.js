const app = getApp();
Component({
    properties: {
        type: {
            type: String,
            value: "fourCell"
        },
        axis: {
            type: Array,
            value: [1,2,3]
        },
        area: {
            type: Array,
            value:[1,2,3]
        },
        coordinate: {
            type: Array,
            value: []
        }
    },
    data: {
        pixelRate: app.globalData.pixelRate
    },
    methods: {}
});
