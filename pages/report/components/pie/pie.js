import * as echarts from "../../../../utils/ec-canvas/echarts";
const app = getApp();
let _this;
Component({
    properties: {
        pieChartId: {
            type: String,
            default: ''
        },
        pieData: {
            type: Array,
            default: []
        }
    },
    data: {},
    methods: {
        getPieChartInfo(canvas, width, height) {
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: wx.getSystemInfoSync().pixelRatio
            });
            if (!app.rate) {
                const sysMsg = wx.getSystemInfoSync();
                app.rate = sysMsg.windowWidth / 750;
            }
            canvas.setChart(chart);
            const {pieData} = _this.properties;
            console.log('pieData: ', pieData);
            const option = {
                backgroundColor: "#00000000",
                series: [{
                    label: {
                        normal: {
                            fontSize: 14
                        }
                    },
                    type: 'pie',
                    center: ['50%', '50%'],
                    radius: ['0%', '40%'],
                    data: _this.formatData(pieData),
                    color: _this.formatColor(pieData)
                }]
            };

            chart.setOption(option);
            return chart;
        },
        formatData(data=[]) {
            console.log(data);
            const targetData = data.map((item, index)=>{
                console.log(item)
                return {
                    value: item.grade,
                    name: item.name,
                    label: {
                        formatter: [
                            `{point|●} {title|${item.name}}`,
                            `{subtitle|${item.proportion}}`
                        ].join('\n'),
                        color: '#000000',
                        fontSize: 5,
                        borderWidth: 3,
                        backgroundColor: '#00000000',
                        padding: [3, 10, 10, 5],
                        lineHeight: 20,
                        rich: {
                            point: {
                                color: _this.formatColor(data)[index]
                            },
                            title: {
                                color: '#00000080',
                                fontSize: 12,
                                fontFamily: 'PingFangSC-Regular, PingFang SC',
                                fontWeight: 400,
                                lineHeight: 12,
                            },
                            subtitle: {
                                fontSize: 12,
                                fontFamily: 'PingFangSC-Regular, PingFang SC',
                                fontWeight: 400,
                                color: '#00000025',
                                lineHeight: 20,
                            },
                        },
                        // color: '#000000',
                        // fontWeight: 400,
                        // fontSize: 12
                    }
                }
            })
            return targetData
        },
        formatColor(data) {
            let max = 0
            let totalScore = 0
            data.forEach((item)=>{
                max = item.grade > max ? item.grade : max
                totalScore = totalScore + item.grade
            })
            const targetData = data.map(item=>{
                const opacity = item.grade / max
                return `rgba(119, 162, 250, ${max === item.grade ? 1 : opacity})`
            })
            console.log('targetData: ', targetData);
            return targetData
        }
    },
    lifetimes: {
        attached() {
            _this = this;
            this.setData({
                getPieChartInfoInit: {
                    onInit: this.getPieChartInfo
                }
            })
        }
    }
});
