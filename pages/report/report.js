import debounce from '../../utils/lodash/debounce';
import * as echarts from '../../utils/ec-canvas/echarts';

var app = getApp();
var _this;
var ctx;
var timer;
//柱状图数据
var value_2 = {};
var indicator_2 = {};

function getChartMsg(canvas, width, height) {
    var canvasId = canvas.canvasId;
    var index = canvasId.replace("mychartcanvas", "");
    const chart = echarts.init(canvas, null, {
        width: width,
        height: height
    });
    canvas.setChart(chart);
    var option = {
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

//雷达图数据
var radarValue = {};
var radarIndicator = {};

function getRadarChartInfo(canvas, width, height) {
    const canvasId = canvas.canvasId;
    const index = canvasId.replace("mychartcanvas", "");
    const chart = echarts.init(canvas, null, {
        width: width,
        height: height
    });
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

function getHistogramInfo(canvas, width, height) {
    const canvasId = canvas.canvasId;
    const index = canvasId.replace("mychartcanvas", "");
    const chart = echarts.init(canvas, null, {
        width: width,
        height: height
    });
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

Page({
    startPageX: 0,
    scrollViewWidth: 0,
    data: {
        getChartMsg: {
            onInit: getChartMsg
        },
        getRadarChartInfo: {
            onInit: getRadarChartInfo
        },
        getHistogramInfo: {
            onInit: getHistogramInfo
        },
        activeProposal: 0,
        showDlg: false,
        showDimension: false,
        proposalShow: false,
        noTeamMember: false,
        showPage: false,
        dlgName: "",
        cardCur: 0,
        moveParams: {
            scrollLeft: 0
        },
        canvasLoading: true,
        radarIndicator: "",
        radarValue: "",
        radarLoading: true,
        histogramYAxis: [[]],
        limit: [[]],
        histogramValues: [[]],
        referLines: [[]],
        maskTrigger: true,
        isSelf: "SELF"
    },

    onLoad: function (options = {isSelf: ""}) {
        const that = this;
        ctx = wx.createCanvasContext('canvasArcCir');
        const id = that.data.id || options.receiveRecordId || options.receivedRecordId;
        if(options.isSelf){
            this.setData({
                isSelf: options.isSelf
            });
        }
        this.setData({
            id: id,
        });
        if(!app.globalData.userInfo && !wx.getStorageSync('userInfo')){
            app.checkUserInfo = userInfo => {
                if (options.sharedAt) {
                    options.userId = userInfo.id || wx.getStorageSync("userInfo")["id"];
                    that.verifyReportIsCanRead(options).then(res => {
                        that.getReport(id);
                    }).catch(err => {
                        wx.showToast({
                            title: "该分享已过期",
                            icon: "none",
                            duration: 888
                        });
                        setTimeout(() => {
                            wx.switchTab({
                                url: '/pages/home/home'
                            })
                        }, 999);
                    });
                } else {
                    that.getReport(id);
                }
            };
        }else{
            if (options.sharedAt) {
                options.userId = wx.getStorageSync("userInfo")["id"];
                that.verifyReportIsCanRead(options).then(res => {
                    that.getReport(id);
                }).catch(err => {
                    wx.showToast({
                        title: "该分享已过期",
                        icon: "none",
                        duration: 888
                    });
                    setTimeout(() => {
                        wx.switchTab({
                            url: '/pages/home/home'
                        })
                    }, 999);
                });
            } else {
                that.getReport(id);
            }
        }
    },

    onShow: function () {},

    verifyReportIsCanRead: function (option) {
        return this.acceptReport(option)
    },

    acceptReport: function (option) {
        const {receivedRecordId, sharedAt, userId} = option;
        const acceptReportPromise = new Promise((resolve, reject) => {
            app.doAjax({
                url: `reports/accept`,
                method: 'post',
                data: {
                    receivedRecordId: receivedRecordId,
                    sharedAt: sharedAt,
                    userId: userId
                },
                noLoading: true,
                success: function (res) {
                    if (res.code !== -1) {
                        resolve(true)
                    } else {
                        reject(false)
                    }
                }
            })
        })
        return acceptReportPromise;
    },

    onReady: function () {
        let that = this;
        setTimeout(function () {
            that.scrollSelectItem(0, false);
        }, 2000);
    },
    /**
     * 获取报告详情
     */
    getReport: function (id) {
        let that = this;
        id = id || that.data.id;
        app.doAjax({
            url: 'reports/check_type',
            method: 'get',
            data: {
                receiveRecordId: id
            },
            success: function (res) {
                that.setData({
                    isSelf: res.data.type
                })
            }
        })
        let getReportPromise = new Promise((resolve, reject) => {
            app.doAjax({
                url: "reports/detail",
                method: "get",
                noLoading: true,
                data: {
                    receiveRecordId: id
                },
                success: function (res) {
                    resolve(res);
                },
                fail: function (err) {
                    reject(err);
                }
            })
        });
        getReportPromise.then(res => {
            if (res.report.reportVersion) {
                return new Promise((resolve, reject) => {
                    resolve(res);
                });
            }
            if (this.isInTeams(res)) {
                return;
            }
            let now = new Date().getFullYear();
            let participantInfo = res.participantInfo;
            let t = new Date(participantInfo.birthday).getFullYear();
            res.participantInfo.age = now - t + 1;
            res.report.finishTime = app.changeDate(res.report.finishTime, "yyyy/MM/dd hh:mm");
            let timeNormal = 1; //作答时长正常
            let answeTimeSatr = +res.report.answeTimeSatr;
            let answeTimeEnd = +res.report.answeTimeEnd;
            let time = +res.report.timeTotal;
            if (time <= answeTimeSatr) {
                //作答时长偏短
                timeNormal = 2;
            }
            if (time >= answeTimeEnd) {
                //作答时长偏长
                timeNormal = 3;
            }
            res.report["timeNormal"] = timeNormal;
            radarValue = {};
            radarIndicator = {};
            value_2 = {};
            indicator_2 = {};
            var objs = res.report.dimension;
            for (var n in objs) {
                var arr = objs[n].child;
                var newChild = [];
                radarValue[n] = radarValue[n] || [];
                radarIndicator[n] = radarIndicator[n] || [];
                value_2[n] = value_2[n] || [];
                indicator_2[n] = indicator_2[n] || [];
                var {showSubScore} = objs[n];
                for (var i in arr) {
                    var node = arr[i];
                    if (showSubScore == 'average') {
                        radarValue[n].push(node.average);
                    } else if (!showSubScore) {
                        radarValue[n].push(node.average);
                    } else {
                        radarValue[n].push(node.total);
                    }
                    radarIndicator[n].push({
                        text: node.name,
                        color: "#323541",
                        max: objs[n].max || 5
                    });
                    indicator_2[n].push({
                        value: node.name,
                        textStyle: {
                            fontWeight: 400,
                            fontFamily: "PingFangSC-Regular",
                            color: "#323541",
                            fontSize: 14
                        }
                    });
                    value_2[n].push({
                        value: node.average,
                        itemStyle: {
                            color: "#5186FF"
                        }
                    });
                    newChild.push(node);
                }
                that.setData({
                    radarIndicator: JSON.stringify(radarIndicator),
                    radarValue: JSON.stringify(radarValue)
                })
                // newChild.sort(function (it1, it2) {
                //     return it2.average - it1.average;
                // });
                objs[n].child = newChild;
                var keys = Object.keys(newChild);
                objs[n].child[keys[0]]["active"] = "active";
            }
            res["id"] = id;
            var total1Full = res.report.total1;
            res.report.total1 = +res.report.total1.toFixed(0);
            var proposal = res.report.proposal || [];
            var dimensions = res.report.dimension || {};
            res.report["proposalShow"] = false;
            res.report["showDimension"] = false;
            for (var i in dimensions) {
                if (dimensions[i].show) {
                    res.report["showDimension"] = true;
                }
            }
            proposal.forEach(function (n) {
                if (n.show) {
                    res.report["proposalShow"] = true;
                }
            });
            that.drawCircle(res.total1);
            res.report["statement"] = res.report["statement"].replace(/\n/g, "<br>").replace("<bold", "<span style='font-weight: 600;'").replace("</bold", "</span");
            res.report["noTeamMember"] = false;
            res.report["teamRole"] = (app.teamId == res.releaseTeamId) ? app.teamRole : 1;
            res.report["showPage"] = true;
            res.maskTrigger = false;
            that.setData(res);
            setTimeout(()=>{
                that.setData({
                    maskTrigger: false
                })
            },500)
            app.doAjax({
                url: "userOrderMsg",
                method: "get",
                data: {
                    id: res.id,
                    paperId: res.evaluationInfo.evaluationId,
                    total: total1Full || 0,
                    totalD1: res.dimension1Total || 0,
                    totalD2: res.dimension2Total || 0
                },
                noLoading: true,
                success: function (r) {
                    that.setData(r);
                }
            });
        }).then(res => {
            if (!res || this.isInTeams(res)) {
                return;
            }
            let now = new Date().getFullYear();
            let participantInfo = res.participantInfo;
            let t = new Date(participantInfo.birthday).getFullYear();
            res.participantInfo.age = now - t + 1;
            res.report.finishTime = app.changeDate(res.report.finishTime, "yyyy/MM/dd hh:mm");
            let timeNormal = 1; //作答时长正常
            let answeTimeSatr = +res.report.answeTimeSatr;
            let answeTimeEnd = +res.report.answeTimeEnd;
            let time = +res.report.timeTotal;
            if (time <= answeTimeSatr) {
                //作答时长偏短
                timeNormal = 2;
            }
            if (time >= answeTimeEnd) {
                //作答时长偏长
                timeNormal = 3;
            }
            res.report["timeNormal"] = timeNormal;
            radarValue = {};
            radarIndicator = {};
            value_2 = {};
            indicator_2 = {};
            var objs = res.report.dimension;
            let histogramYAxis = [];
            let limit = [];
            let histogramValues = [];
            let lines = []
            for (var n in objs) {
                const targetHistogramYAxisArr = [];
                const targetLimitArr = [];
                const targetHistogramValuesArr = [];
                var arr = objs[n].subclass;
                var newChild = [];
                radarValue[n] = radarValue[n] || [];
                radarIndicator[n] = radarIndicator[n] || [];
                value_2[n] = value_2[n] || [];
                indicator_2[n] = indicator_2[n] || [];
                var {showSubScore, subScale} = objs[n];
                for (var i in arr) {
                    var node = arr[i];
                    if (showSubScore === 'average') {
                        switch (subScale) {
                            case 'origin':
                                radarValue[n].push(node.average);
                                targetHistogramValuesArr.push(node.average);
                                break;
                            case 'decimal':
                                radarValue[n].push(node.average10);
                                targetHistogramValuesArr.push(node.average10);
                                break;
                            case 'centesimal':
                                radarValue[n].push(node.average100);
                                targetHistogramValuesArr.push(node.average100);
                                break;
                            case 'stanine':
                                radarValue[n].push(node.averageStanine);
                                targetHistogramValuesArr.push(node.averageStanine);
                                break;
                            default:
                                radarValue[n].push(node.subTotal);
                                targetHistogramValuesArr.push(node.subTotal);
                                break;
                        }
                    } else if (showSubScore === 'total') {
                        switch (subScale) {
                            case 'origin':
                                radarValue[n].push(node.subTotal);
                                targetHistogramValuesArr.push(node.subTotal);
                                break;
                            case 'decimal':
                                radarValue[n].push(node.subTotal10);
                                targetHistogramValuesArr.push(node.subTotal10);
                                break;
                            case 'centesimal':
                                radarValue[n].push(node.subTotal100);
                                targetHistogramValuesArr.push(node.subTotal100);
                                break;
                            case 'stanine':
                                radarValue[n].push(node.subTotalStanine);
                                targetHistogramValuesArr.push(node.subTotalStanine);
                                break;
                            default:
                                radarValue[n].push(node.subTotal);
                                targetHistogramValuesArr.push(node.subTotal);
                                break;
                        }
                    }
                    targetHistogramYAxisArr.push(node.name);
                    targetLimitArr.push(objs[n].min);
                    targetLimitArr.push(objs[n].max);
                    radarIndicator[n].push({
                        text: node.name,
                        color: "#323541",
                        max: objs[n].max || 5
                    });
                    indicator_2[n].push({
                        value: node.name,
                        textStyle: {
                            fontWeight: 400,
                            fontFamily: "PingFangSC-Regular",
                            color: "#323541",
                            fontSize: 14
                        }
                    });
                    value_2[n].push({
                        value: node.average,
                        itemStyle: {
                            color: "#5186FF"
                        }
                    });
                    newChild.push(node);
                }
                histogramYAxis.push(targetHistogramYAxisArr);
                limit.push(targetLimitArr);
                histogramValues.push(targetHistogramValuesArr);
                lines.push(objs[n].scoreLinesObj);
                that.setData({
                    radarIndicator: JSON.stringify(radarIndicator),
                    radarValue: JSON.stringify(radarValue),
                });
                // newChild.sort(function (it1, it2) {
                //     return it2.average - it1.average;
                // });
                objs[n].subclass = newChild;
                var keys = Object.keys(newChild);
                objs[n].subclass[keys[0]]["active"] = "active"
            }
            that.setData({
                histogramYAxis: histogramYAxis,
                limit: limit,
                histogramValues: histogramValues,
                lines: lines
            })
            res["id"] = id;
            var total1Full = res.report.generalTotal100;
            try {
                res.report.total100 = +res.generalTotal100.toFixed(0);
            } catch (e) {
            }
            var proposal = res.report.proposal || [];
            var dimensions = res.report.dimension || {};
            res.report["proposalShow"] = false;
            res.report["showDimension"] = false;
            for (var i in dimensions) {
                if (dimensions[i].show) {
                    res.report["showDimension"] = true;
                }
            }
            proposal.forEach(function (n) {
                if (n.show) {
                    res.report["proposalShow"] = true;
                }
            });
            that.drawCircle(res.total100);
            res.report["statement"] = res.report["statement"].replace(/\n/g, "<br>").replace("<bold", "<span style='font-weight: 600;'").replace("</bold", "</span");
            res.report["noTeamMember"] = false;
            res.report["teamRole"] = (app.teamId == res.releaseTeamId) ? app.teamRole : 1;
            console.log("teamRole: ", res.report["teamRole"]);
            console.log("app.teamId: ", app.teamId, "res.releaseTeamId.teamId: ", res.releaseTeamId.teamId)
            res.report["showPage"] = true;
            res.fillBlank = [];
            for (let i = 0; i < 4; i++) {
                res.fillBlank.push("");
            }
            that.setData(res);
            setTimeout(()=>{
                that.setData({
                    maskTrigger: false
                })
            },500)
            this.getEvaluationQues();
        }).catch(err=>{
            console.error(err);
            app.toast("获取测评错误")
        });
    },
    /**
     * 是否在团队里
     */
    isInTeams: function (teamInfo) {
        let {shareKey = ''} = this.data;
        if (teamInfo && teamInfo.type == "noTeamMember") {
            if (shareKey) {
                wx.redirectTo({
                    url: '../user/teamInvite?key=' + shareKey + "&reportId=" + id
                });
                return true;
            }
            this.setData({
                teamAdminNickname: teamInfo.teamAdminUserName || "",
                showPage: true,
                noTeamMember: true,
                paperId: teamInfo.paper.id
            });
            return false;
        }
    },
    /**
     * 图片大图查看
     */
    showBigImg: function (e) {
        var url = e.currentTarget.dataset.url;
        wx.previewImage({
            urls: [url]
        });
    },
    /**
     * 展开显示维度信息
     */
    activeItem: function (e) {
        var d = e.currentTarget.dataset;
        var index = d.index;
        if (index == null) return;
        var i = d.i;
        var list = this.data.report;
        if (i != null) {
            var old = list.dimension[index]["child"][i]["active"];
            list.dimension[index]["child"][i]["active"] = old ? "" : "active";
        } else {
            var old = list.dimension[index]["active"];
            list.dimension[index]["active"] = old ? "" : "active";
        }
        this.setData({
            report: list
        });
    },
    /**
     * 展开显示维度信息(兼容新的数据结构)
     */
    activeNewItem: function (e) {
        var d = e.currentTarget.dataset;
        var index = d.index;
        if (index == null) return;
        var i = d.i;
        var list = this.data.report;
        if (i != null) {
            var old = list.dimension[index]["subclass"][i]["active"];
            list.dimension[index]["subclass"][i]["active"] = old ? "" : "active";
        } else {
            var old = list.dimension[index]["active"];
            list.dimension[index]["active"] = old ? "" : "active";
        }
        this.setData({
            report: list
        });
    },
    /**
     * 显示作答分析弹窗
     */
    showDlg: function (e) {
        var n = e.currentTarget.dataset.n;
        if (!n) return;
        this.setData({
            showDlg: true,
            dlgName: n
        });
    },
    /**
     * 隐藏作答分析弹窗
     */
    hideDlg: function (e) {
        this.setData({
            showDlg: false,
            dlgName: ""
        });
    },
    /**
     * 建议切换显示
     */
    changeProposal: function (e) {
        var i = e.currentTarget.dataset.i;
        var current = e.detail.current;
        if (i != null) {
            this.setData({
                activeProposal: i
            });
        }
        if (current != null) {
            this.setData({
                activeProposal: current
            });
        }
    },
    /**
     * 审核申请查看报告
     */
    applyReportAudit: function (e) {
        const receiveRecordId = this.data.id;
        var that = this;
        wx.showModal({
            title: '确认同意',
            content: '同意后，被测者将能直接查看此份报告',
            cancelText: "取消",
            confirmText: "同意",
            cancelColor: "#323541",
            confirmColor: "#323541",
            success: function (ret) {
                if (ret.confirm) {
                    app.doAjax({
                        url: `reports/${receiveRecordId}`,
                        method: "put",
                        noLoading: false,
                        data: {
                            type: 'agree'
                        },
                        success: function (r) {
                            that.getReport();
                        }
                    });
                }
            }
        });

    },
    /**
     * 百分比进度条显示
     */
    drawCircle: function (num) {
        var width = 20;
        var w = 90;
        var r = 80
        var sys = wx.getSystemInfoSync();
        var n = parseInt((sys.windowWidth / 750) * 100) / 100;
        width = width * n;
        w = w * n;
        r = r * n;
        ctx.setStrokeStyle('#353EE8');
        ctx.setLineWidth(width);
        ctx.setLineCap('round');
        var endAngle = (num * 2 / 100) + 1.5;
        endAngle = +(endAngle.toFixed(1));
        // if (endAngle > 2) {
        //   endAngle = endAngle - 2;
        // }
        ctx.arc(w, w, r, 1.5 * Math.PI, endAngle * Math.PI, false);
        ctx.stroke();
        ctx.draw();
    },
    /**
     * 进入分享报告页面
     */
    toShareReport: function () {
        const that = this;
        const {participantInfo, evaluationInfo, paper, report} = this.data;
        const {globalData} = app;
        return {
            title: `${globalData.team.name}邀您看${participantInfo.username}的《${evaluationInfo.evaluationName}》报告`,
            path: `pages/report/report`,
            imageUrl: report.smallImg,
        }
    },
    /**测测他人 */
    toTestOtherUser: function () {
        var {evaluationInfo} = this.data;
        var userPapersNum = this.data.userPapersNum;
        wx.navigateTo({
            url: '../station/components/detail/detail?id=' + evaluationInfo.evaluationId,
        });
    },
    /**
     * 获取团队列表，并切换到我自己的团队
     */
    getMyTeamList: function (e) {
        app.getMyTeamList(function (list) {
            list.forEach(function (node) {
                if (node.role == 3) {
                    app.teamId = node.objectId;
                    app.teamName = node.name;
                    app.teamRole = node.role;
                    app.globalData.team = node;
                }
            });
        });
    },
    /**
     * 分享
     */
    onShareAppMessage: function (options) {
        const that = this;
        const {participantInfo, evaluationInfo, id, report} = this.data;
        const time = new Date().getTime();
        try{
            wx.uma.trackEvent('1602216644404');
        }catch (e) {

        }
        return {
            title: `邀您查看${participantInfo.username}的《${evaluationInfo.evaluationName}》报告`,
            path: `pages/report/report?receivedRecordId=${id}&sharedAt=${time}`,
            imageUrl: evaluationInfo.smallImg,
        }
    },
    /**
     * @Description: 获取题目
     * @author: WE!D
     * @name:
     * @args:
     * @return:
     * @date: 2020/8/8
     */
    getEvaluationQues: function () {
        const that = this;
        const {evaluationInfo} = this.data;
        app.doAjax({
            url: "paperQues",
            method: "get",
            data: {
                id: evaluationInfo.evaluationId
            },
            noLoading: true,
            success: function (res) {
                const {ques} = res;
                const knowledgePoints = {};
                ques.forEach((item, key) => {
                    knowledgePoints[item.id] = item.knowledgePoints;
                });
                that.setData({
                    knowledgePoints
                })
            }
        });
    },
    cardSwiper: debounce(function (e) {
        this.setData({
            cardCur: e.detail.current
        });
        this.scrollSelectItem(e.detail.current, true);
    }, 50, {
        leading: true,
        trailing: false
    }),

    scroll: function (e) {
        this.scrollLeft = e.detail.scrollLeft;
    },

    switchClass: function (e) {
        const offsetLeft = e.currentTarget.offsetLeft;
        const cardCur = e.target.dataset.id;
        this.setData({
            scrollLeft: offsetLeft - this.data.scrollViewWidth / 2,
            cardCur
        })
    },

    getRect: function (elementId) {
        const that = this;
        wx.createSelectorQuery().select(elementId).boundingClientRect((rect) => {
            let moveParams = that.data.moveParams;
            try {
                moveParams.subLeft = rect.left;
            } catch (e) {
                moveParams.subLeft = 0;
                return;
            }
            moveParams.subLeft = rect.left;
            moveParams.subHalfWidth = rect.width / 2;
            moveParams.screenHalfWidth = app.globalData.windowWidth / 2;
            that.moveTo();
        }).exec();
    },

    moveTo: function () {
        let subLeft = this.data.moveParams.subLeft;
        let screenHalfWidth = this.data.moveParams.screenHalfWidth;
        let subHalfWidth = this.data.moveParams.subHalfWidth;
        let scrollLeft = this.data.moveParams.scrollLeft;
        let distance = subLeft - screenHalfWidth + subHalfWidth;
        scrollLeft = scrollLeft + distance;
        this.setData({
            scrollLeft: scrollLeft
        });
    },

    scrollMove(e) {
        let moveParams = this.data.moveParams;
        moveParams.scrollLeft = e.detail.scrollLeft;
        this.moveParams = moveParams;
    },

    selectItem: function (e) {
        let ele = 'scroll-item-' + e.target.dataset.id;
        this.getRect('#' + ele);
        this.setData({
            cardCur: e.target.dataset.id
        })
    },

    scrollSelectItem: function (id, vibrate = true) {
        let ele = 'scroll-item-' + id;
        this.getRect('#' + ele);
        this.setData({
            cardCur: id
        });
        if (vibrate) {
            wx.vibrateShort({
                success: function (res) {
                }
            })
        }
    },

    onUnload: function () {
        const {isSelf} = this.data;
        if (isSelf && isSelf === "SELF") {
            console.log("1")
            wx.reLaunch({
                url: "/pages/work-base/work-base"
            })
        } else if (isSelf && isSelf === "SHARE") {
            console.log("2")
            wx.reLaunch({
                url: "/pages/user-center/components/receive-evaluations/receive-evaluations?targetPath=userCenter"
            })
        } else {
            console.log("3")
            // wx.reLaunch({
            //     url:
            // });
        }
    }
});
