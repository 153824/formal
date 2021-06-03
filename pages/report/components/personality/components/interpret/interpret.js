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
        canIUnfold: true
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
                console.log(res[0]);
                let lineHeight = 24 // 固定高度值 单位：PX
                for (var i = 0; i < res[0].length; i++) {
                    that.setData({
                        canIUnfold: (res[0][i].height / lineHeight) > 3
                    })
                    console.log((res[0][i].height / lineHeight) > 3)
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
