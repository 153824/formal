const app = getApp();
Component({
    properties: {
        mbti: {
            type: Object,
            value: {
                personality: {},
                traits: [],
                indicators: [],
                descriptions: []
            }
        }
    },
    data: {},
    methods: {
        init(option) {
            const {labelColor, labelFontSize, percent, label} = option;
            const ctx = wx.createCanvasContext('mbti', this);
            // 绘制百分比
            ctx.setFontSize(`${percent.fontWeight} ${percent.fontSize}`);
            ctx.setFillStyle(percent.color);
            ctx.fillText('81%', 10, 20);
            // 绘制百分比对应的文本
            ctx.setFontSize(`${label.fontWeight} ${label.fontSize}`);
            ctx.setFillStyle(label.color);
            ctx.fillText('外向型', 6, 35);

            // ctx.fillRect(10, 10, 150, 75);
            ctx.draw();
        },
    },
    lifetimes: {
        ready() {
            const option = {
                percent: {
                    color: '#353EE8',
                    fontSize: +(30 * app.rate).toFixed(0),
                    fontWeight: 600
                },
                label: {
                    color: '#353EE8',
                    fontSize: +(26 * app.rate).toFixed(0),
                    fontWeight: 600
                },
            };
            this.init(option);
        }
    }
});
