const app = getApp();
Component({
    properties: {
        indicators: {
            type: Array,
            value: []
        }
    },
    data: {
        barWidth: 0,
        rate: app.rate
    },
    methods: {},
    lifetimes: {
        ready() {
            // const query = this.createSelectorQuery();
            // query.select('.mbti-chart__bar').boundingClientRect();
            // query.exec((res)=>{
            //     console.log('lifetimes: ',res);
            //     this.setData({
            //         barWidth: res[0].width
            //     });
            // })
        }
    }
});
