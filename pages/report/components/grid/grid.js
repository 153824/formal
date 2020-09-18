const app = getApp();
Component({
    properties: {
        type: {
            type: String,
            value: "fourCell"
        },
        axis: {
            type: Array,
            value: []
        },
        area: {
            type: Array,
            value: []
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
