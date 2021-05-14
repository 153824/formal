import * as echarts from "../../../../utils/ec-canvas/echarts";
const app = getApp();
let _this;
Component({
    properties: {
        radarIndex: {
          type: Number,
          value: 0
        },
        radarValue: {
            type: String,
            value: ""
        },
        radarIndicator: {
            type: String,
            value: ""
        }
    },
    data: {},
    methods: {
        getRadarChartInfo (canvas, width, height) {
            const canvasId = canvas.canvasId;
            const radarIndex = radarIndex
            const index = canvasId.replace("mychartcanvas", "");
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: wx.getSystemInfoSync().pixelRatio
            });
            let {radarValue,radarIndicator} = _this.properties;
            radarValue = JSON.parse(radarValue);
            radarIndicator = JSON.parse(radarIndicator);
            if (!app.rate) {
                const sysMsg = wx.getSystemInfoSync();
                app.rate = sysMsg.windowWidth / 750;
            }
            canvas.setChart(chart);
            const option = {
                radar: {
                    name: {
                        fontWeight: 400,
                        color: "#323541",
                        fontSize: +(24 * app.rate).toFixed(0),
                    },
                    indicator: radarIndicator[index],
                    splitArea: {
                        areaStyle: {
                            color: ['#fff',
                                '#fff', '#fff',
                                '#fff', '#fff',
                            ]
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: ['rgba(238, 238, 238, 0.2)', 'rgba(238, 238, 238, 0.3)', 'rgba(238, 238, 238, 0.5)', 'rgba(238, 238, 238, 0.6)', 'rgba(238, 238, 238, 0.7)', 'rgba(238, 238, 238, 0.8)']
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(238, 238, 238, 0.8)'
                        }
                    }
                },
                series: [{
                    type: 'radar',
                    tooltip: {
                        trigger: 'item'
                    },
                    lineStyle: {
                        color: "#FFCC20"
                    },
                    symbol: "roundRect",
                    itemStyle: {
                        normal: {
                            color: "#FFCC20",
                            borderColor: "#FFCC20",
                            areaStyle: {
                                type: 'default',
                                color: "rgba(251, 178, 60, 0.5)"
                            }
                        }
                    },
                    data: [{
                        value: radarValue[index]
                    }]
                }]
            };
            chart.setOption(option);
            return chart;
        }
    },
    lifetimes: {
        attached() {
            _this = this;
            this.setData({
                getRadarChartInfoInit: {
                    onInit: this.getRadarChartInfo
                }
            })
        }
    }
});
