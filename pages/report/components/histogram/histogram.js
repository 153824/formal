import * as echarts from "../../../../utils/ec-canvas/echarts";

const app = getApp();
let _this;
Component({
    properties: {
        histogramIndex: {
            type: Number,
            value: 0
        },
        histogramYAxis: {
            type: Array,
            value: []
        },
        limit: {
            type: Array,
            value: [[0, 1]]
        },
        histogramValues: {
            type: Array,
            value: [[]]
        },
        lines: {
            type: Array,
            value: []
        },
        direction: {
            type: String,
            value: 'column'
        },
        colors: {
            type: Array,
            value: []
        }
    },
    methods: {
        getHistogramInfo: (canvas, width, height) => {
            const that = _this;
            const canvasId = canvas.canvasId;
            const index = canvasId.replace("mychartcanvas", "");
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: wx.getSystemInfoSync().pixelRatio
            });
            const {histogramYAxis, limit, histogramValues, lines, direction} = that.properties;
            const barColors = that.properties.colors;
            const series = [
                {
                    name: "受测者得分",
                    type: 'bar',
                    data: direction === 'column' ? histogramValues[index].reverse() : histogramValues[index],
                    label: {
                        show: true,
                        position: direction === "column" ? "right" : "top",
                        textStyle: {
                            color: 'rgba(53, 62, 232, 0.43)',
                            fontSize: +(22 * app.rate).toFixed(0),
                        }
                    },
                    barWidth: (28 * app.rate).toFixed(0),
                    itemStyle: {
                        normal: {
                            color: function (res) {
                                if (!barColors.length) {
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
                                } else {
                                    return barColors[res.dataIndex];
                                }
                            },
                        }
                    },
                },
            ];
            const legend = {
                data: [
                    {
                        name: '受测者得分',
                        textStyle: {
                            color: 'rgba(53, 62, 232, 1)',
                            fontSize: +(24 * app.rate).toFixed(0),
                        }
                    }
                ],
                right: (40 * app.rate).toFixed(0),
                icon: "roundRect",
                itemWidth: 28,
                itemHeight: 6,
            };
            const colors = ["rgba(247, 181, 0, 1)", "rgba(109, 212, 0, 1)"];
            let color = colors[0];
            for (let key in lines[index]) {
                let num = Math.random() * 10;
                if (num > 5) {
                    color = colors[0];
                } else {
                    color = colors[1];
                }
                const line = {
                    name: key,
                    type: 'line',
                    data: direction === 'column' ? lines[index][key].data.reverse() : lines[index][key].data,
                    itemStyle: {
                        normal: {
                            color: lines[index][key].color || color,
                            lineStyle: {
                                color: lines[index][key].color || color
                            }
                        }
                    }
                };
                const legendData = {
                    name: key,
                    textStyle: {
                        color: lines[index][key].color || color,
                        fontSize: +(24 * app.rate).toFixed(0),
                    }
                };
                series.push(line);
                legend.data.push(legendData);
            }
            canvas.setChart(chart);
            let defaultXData = [
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
                            fontSize: +(28 * app.rate).toFixed(0),
                        }
                    },
                    type: 'category',
                    boundaryGap: true,
                    data: direction === 'column' ? histogramYAxis[index].reverse() : histogramYAxis[index],
                }
            ];
            let defaultYData = {
                position: 'top',
                type: 'value',
                scale: true,
                min: limit[index][0],
                max: limit[index][1],
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
            };
            if (direction === 'column') {
                let temp;
                temp = defaultXData;
                defaultXData = defaultYData;
                defaultYData = temp;
            }else{
                defaultXData[0].axisLabel.rotate = -90;
            }
            const option = {
                legend: legend,
                grid: {
                    containLabel: true
                },
                xAxis: defaultXData,
                yAxis: defaultYData,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line',
                        crossStyle: {
                            color: '#fff'
                        }
                    }
                },
                series: series,
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
