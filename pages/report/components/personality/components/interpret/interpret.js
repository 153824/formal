const app = getApp();
Component({
    properties: {
        description: {
            type: Object,
            value: {}
        },
        index: {
            type: Number,
            value: 0
        }
    },
    data: {
        active: false,
        canIUnfold: true,
        maxHeight: 0
    },
    methods: {
        seeIt() {
            const {active} = this.data;
            this.setData({
                active: !active,
            });
        },
        computeHeight() {
            const that = this;
            const {index} = this.properties;
            console.log(index);
            const query = wx.createSelectorQuery().in(this)
            query.selectAll(`#detail-${index}`).fields({
                size: true
            }).exec(function (res) {
                for (let i = 0; i < res[0].length; i++) {
                    const contentHeight = res[0][i].height;
                    that.setData({
                        canIUnfold: contentHeight / app.rate > 240,
                        maxHeight: 240
                    })
                }
            })
        }
    },
    lifetimes: {
        ready() {
            this.computeHeight();
        }
    }
});
