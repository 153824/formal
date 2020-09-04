import * as echarts from "../../../../utils/ec-canvas/echarts";

const app = getApp();
let _this;
Component({
    properties: {
        id: {
            type: String,
            value: 0
        }
    },
    data: {},
    methods: {
        getHistogramInfo:(canvas, width, height)=> {
            const canvasId = canvas.canvasId;
            const index = canvasId.replace("mychartcanvas", "");
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            canvas.setChart(chart);
            const option = {
                legend: {
                    data: [
                        {
                            name: '受测者得分',
                            textStyle: {
                                color: 'rgba(53, 62, 232, 1)',
                                fontSize: +(24 * app.rate).toFixed(0),
                            }
                        },
                        {
                            name: '均分',
                            textStyle: {
                                color: 'rgba(109, 212, 0, 1)',
                                fontSize: +(24 * app.rate).toFixed(0),
                            }
                        },
                        {
                            name: '达标线',
                            textStyle: {
                                color: 'rgba(247, 181, 0, 1)',
                                fontSize: +(24 * app.rate).toFixed(0),
                            }
                        }
                    ],
                    right: (40 * app.rate).toFixed(0),
                    icon: "roundRect",
                    itemWidth: 28,
                    itemHeight: 6,
                },
                grid: {
                    containLabel: true
                },
                yAxis: [
                    {
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: "rgba(233, 233, 233, 1)"
                            }
                        },
                        axisTick: {
                            show: false,
                            alignWithLabel: true,
                            length: 10
                        },
                        splitLine: {
                            show: false
                        },
                        axisLabel: {
                            textStyle: {
                                color: 'rgba(53, 62, 232, 1)',
                                fontSize: +(24 * app.rate).toFixed(0),
                            }
                        },
                        type: 'category',
                        boundaryGap: true,
                        data: ["积极主动", "乐观自信", "外向亲和", "坚韧抗压", "认真负责"],
                    }
                ],
                xAxis: {
                    position: 'top',
                    type: 'value',
                    scale: true,
                    max: 9,
                    min: 0,
                    splitNumber: 3,
                    boundaryGap: [0.2, 0.2],
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(233, 233, 233, 1)"
                        }
                    },
                    splitLine: {
                        show: false,
                    },
                    axisTick: {
                        show: true,
                    },
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line',
                        crossStyle: {
                            color: '#fff'
                        }
                    }
                },
                series: [
                    {
                        name: "受测者得分",
                        type: 'bar',
                        data: [6, 5, 7, 4, 9],
                        label: {
                            show: true,
                            position: "right",
                            textStyle: {
                                color: 'rgba(53, 62, 232, 0.43)',
                                fontSize: +(22 * app.rate).toFixed(0),
                            }
                        },
                        barWidth: (28 * app.rate).toFixed(0),
                        itemStyle: {
                            normal: {
                                color: function () {
                                    return {
                                        colorStops: [
                                            {
                                                offset: 1, color: "rgba(154, 161, 244, 1)"
                                            },
                                            {
                                                offset: 0, color: "rgba(109, 115, 229, 1)"
                                            },
                                        ]
                                    }
                                }(),
                            }
                        },
                    },
                    {
                        name: "均分",
                        type: 'line',
                        data: [7, 4.5, 6.8, 8.5, 7.3],
                        itemStyle: {
                            normal: {
                                color: 'rgba(109, 212, 0, 1)',
                                lineStyle: {
                                    color: 'rgba(109, 212, 0, 1)'
                                }
                            }
                        }
                    },
                    {
                        name: "达标线",
                        type: 'line',
                        data: [5.7, 3.2, 5.8, 6, 5.9],
                        itemStyle: {
                            normal: {
                                color: 'rgba(247, 181, 0, 1)',
                                lineStyle: {
                                    color: 'rgba(247, 181, 0, 1)'
                                }
                            }
                        }
                    }
                ]
            };
            chart.setOption(option);
            return chart;
        }
    },
    pageLifetimes: {},
    lifetimes: {
        attached() {
            _this = this;
            this.setData({
                getHistogramInfoInit: {
                    onInit: this.getHistogramInfo
                }
            })
        }
    }
});
