import debounce from '../../utils/lodash/debounce';
import * as echarts from '../../utils/ec-canvas/echarts';
import {getAge} from "../../utils/utils";
import {getEnv, getTag, Tracker, umaEvent} from "../../uma.config";

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
        graphQuadrants:[],
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
        detailTrigger: false,
        opacityTrigger: true,
        incentives: {},
        currentActive: [],
        reportCopyrightTxt: "",
        options: {},
        analysisCount:0,
        // 适配事业驱动力测评无需显示维度
        filterEvaluationId: ['5efdab04c4d9660006a48f4f'],
        canIUnfold: true,
        maxHeight: 0,
        seeItActive: true,
        scene: ""
    },
    properties: {
		commond: {            // 额外节点
			type: String,
			value: ''
        }
    },
    onLoad: function (options) {
        const that = this;
        ctx = wx.createCanvasContext('canvasArcCir');
        const id = that.data.id || options.receiveRecordId || options.receivedRecordId;
        if(options.isSelf){
            this.setData({
                isSelf: options.isSelf
            })
        }
        app.checkOfferType(id).then(res=>{
            const {type, evaluationName} = res;
            const {scene} = wx.getLaunchOptionsSync();
            const umaConfig = umaEvent.getInReport;
            if (umaConfig.scene.includes(scene)) {
                try{
                    new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin.card, name: `${evaluationName}`});
                }
                catch (e) {
                    console.log('友盟数据统计',e);
                }
            }
        });
        this.setData({id});
    },

    onShow: function () {
        const that = this;
        const {options} = this.data;
        const id = that.data.id || options.receiveRecordId || options.receivedRecordId;
        if(app.checkAccessToken()){
            this.canIUseShareAt({id,options});
        }else{
            app.checkUserInfo=(res)=>{
                this.canIUseShareAt({id,options});
            };
        }
    },

    onReady() {
        this.computeHeight()
    },

    seeIt() {
        const {seeItActive} = this.data;
        this.setData({
            seeItActive: !seeItActive,
        });
    },

    computeHeight() {
        const that = this;
        try {
            setTimeout(()=>{
                const query = wx.createSelectorQuery()
                query.select(`#usage-manual`).boundingClientRect(res=>{
                    that.setData({
                        canIUnfold: res && res.height ? res.height / app.rate > 240 : false,
                        maxHeight: 240
                    })
                }).exec();
                that.setData({
                    seeItActive: false
                })
            }, 100)
        } catch (e) {
            console.error(e);
        }
        // const query = wx.createSelectorQuery()
        // query.selectAll(`#usage-manual`).fields({
        //     size: true
        // }).exec(function (res) {
        //     for (let i = 0; i < res[0].length; i++) {
        //         const contentHeight = res[0][i].height;
        //         that.setData({
        //             canIUnfold: contentHeight / app.rate > 240,
        //             maxHeight: 240
        //         })
        //     }
        // })
    },

    canIUseShareAt({options,id}) {
        const flag = app.checkAccessToken();
        if(!flag){
            wx.navigateTo({
                url: '/pages/auth/auth?type=auth'
            });
            return
        }
        if (options.sharedAt) {
            options.userId = wx.getStorageSync('userInfo').userId;
            this.verifyReportIsCanRead(options).then(res => {
                this.getReport(id);
            }).catch(err => {
                wx.showToast({
                    title: "该分享已过期",
                    icon: "none",
                    duration: 888
                });
            });
        } else {
            this.getReport(id);
        }
    },

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

    /**
     * 获取报告详情
     */
    getReport: function (id) {
        let that = this;
        id = id || that.data.id;
        let getReportPromise = new Promise((resolve, reject) => {
            app.doAjax({
                url: "reports/detail",
                method: "get",
                noLoading: true,
                data: {
                    receiveRecordId: id
                },
                success: function (res) {
                    that.getProgramSetting(res.releaseRecordId)
                    resolve(res);
                },
                fail: function (err) {
                    reject(err);
                }
            })
        });
        getReportPromise.
        then(res => {
            if (this.isInTeams(res)) {
                return;
            }
            let participant = res.participant;
            res.participant.age = getAge(participant.birthday);
            res.reportGeneratedAt = app.changeDate(res.reportGeneratedAt, "yyyy/MM/dd hh:mm");
            radarValue = {};
            radarIndicator = {};
            value_2 = {};
            indicator_2 = {};
            var objs = res.dimensions;
            for (var n in objs) {
                var arr = objs[n].subclasses;
                var newChild = [];
                radarValue[n] = radarValue[n] || [];
                radarIndicator[n] = radarIndicator[n] || [];
                value_2[n] = value_2[n] || [];
                indicator_2[n] = indicator_2[n] || [];
                var {showSubScore} = objs[n];
                var  analysisCount = 0
                for(var i in res.respondAnalysis){
                    if(res.respondAnalysis[i].display&&res.respondAnalysis[i]){
                        analysisCount++
                    }
                }
                if(res.respondAnalysis['syllabus'].display){
                    analysisCount--
                }
                for (var i in arr) {
                    var node = arr[i];
                    radarValue[n].push(node.grade.value);
                    radarIndicator[n].push({
                        text: node.name,
                        color: "#323541",
                        max: objs[n].chartSetting.maxScore || 5
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
                    // value_2[n].push({
                    //     value: node.average,
                    //     itemStyle: {
                    //         color: "#5186FF"
                    //     }
                    // });
                    newChild.push(node);
                }
                that.setData({
                    radarIndicator: JSON.stringify(radarIndicator),
                    radarValue: JSON.stringify(radarValue)
                })
                newChild.sort(function (it1, it2) {
                    return it2.average - it1.average;
                });
                objs[n].subclasses = newChild;
                var keys = Object.keys(newChild);
                objs[n].subclasses[keys[0]]["active"] = "active";
            }
            res["id"] = id;
            var proposal = res.proposal || [];
            var dimensions = res.dimensions || [];
            res["proposalShow"] = false;
            res["showDimension"] = false;
            for (var i in dimensions) {
                if (dimensions[i].display) {
                    res["showDimension"] = true;
                }
            }
            if (proposal.display) {
                res["proposalShow"] = true;
            }
            that.drawCircle(res.summary.grade);
            res["teamRole"] = (app.teamId == res.releaseTeamId) ? app.teamRole : 1;
            res.maskTrigger = false;
            that.setData(res);
            setTimeout(()=>{
                that.setData({
                    maskTrigger: false,
                    analysisCount:analysisCount,
                })
            },500)
            if(res.coordinate.display&&res.coordinate.graphQuadrants){
                setTimeout(()=>{
                    that.setData({
                        graphQuadrants: res.coordinate.graphQuadrants.reverse(),
                        maskTrigger: false
                    })
                },500)
            }
            return Promise.resolve(res)
        }).then(res => {
            if (!res || this.isInTeams(res)) {
                return;
            }
            let participant = res.participant;
            res.participant.age = getAge(participant.birthday);
            res.reportGeneratedAt = app.changeDate(res.reportGeneratedAt, "yyyy/MM/dd hh:mm");
            radarValue = {};
            radarIndicator = {};
            value_2 = {};
            indicator_2 = {};
            var objs = res.dimensions;
            let histogramYAxis = [];
            let limit = [];
            let histogramValues = [];
            let lines = []
            for (var n in objs) {
                const targetHistogramYAxisArr = [];
                const targetLimitArr = [];
                const targetHistogramValuesArr = [];
                var arr = objs[n].subclasses;
                var newChild = [];
                radarValue[n] = radarValue[n] || [];
                radarIndicator[n] = radarIndicator[n] || [];
                value_2[n] = value_2[n] || [];
                indicator_2[n] = indicator_2[n] || [];
                for (var i in arr) {
                    var node = arr[i];
                    radarValue[n].push(node.grade.value);
                    targetHistogramValuesArr.push(node.grade.value);
                    targetHistogramYAxisArr.push(node.name);
                    targetLimitArr.push(objs[n].chartSetting.minScore);
                    targetLimitArr.push(objs[n].chartSetting.maxScore);
                    radarIndicator[n].push({
                        text: node.name,
                        color: "#323541",
                        max: objs[n].chartSetting.maxScore || 5
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
                newChild.sort(function (it1, it2) {
                    return it2.average - it1.average;
                });
                objs[n].subclass = newChild;
                var keys = Object.keys(newChild);
                // 默认第一个展开
                objs[n].subclass[keys[0]]["active"] = "active"
            }
            that.setData({
                histogramYAxis: histogramYAxis,
                limit: limit,
                histogramValues: histogramValues,
                lines: lines
            })
            res["id"] = id;
            var proposal = res.proposal || [];
            var dimensions = res.dimensions || [];
            for (var i in dimensions) {
                if (dimensions[i].display) {
                    res["showDimension"] = true;
                }
            }
            if (proposal.display) {
                res["proposalShow"] = true;
            }
            that.drawCircle(res.summary.grade);
            res["teamRole"] = (app.teamId == res.releaseTeamId) ? app.teamRole : 1;

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
        var dimensions = this.data.dimensions;
        if (i != null) {
            var old = dimensions[index]["subclasses"][i]["active"];
            dimensions[index]["subclasses"][i]["active"] = old ? "" : "active";
        } else {
            var old = dimensions[index]["subclasses"];
            dimensions[index]["subclasses"] = old ? "" : "active";
        }
        this.setData({
            dimensions: dimensions
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
        if (i != null) {
            var old = dimensions[index]["subclasses"][i]["active"];
            dimensions[index]["subclasses"][i]["active"] = old ? "" : "active";
        } else {
            var old = dimensions[index]["subclasses"];
            dimensions[index]["subclasses"] = old ? "" : "active";
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
                            app.toast("您已经同意~");
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

    toShareReport: function () {
        const that = this;
        const {participant, shareInfo, paper, report,smallImg} = this.data;
        const {globalData} = app;
        return {
            title: `${globalData.team.name}邀您看${participant.filledName||participant.nickname||'好啦访客'}的《${shareInfo.evaluationName}》报告`,
            path: `pages/report/report`,
            imageUrl: report.smallImg,
        }
    },
    /**测测他人 */
    toTestOtherUser: function () {
        var {shareInfo} = this.data;
        var userPapersNum = this.data.userPapersNum;
        wx.navigateTo({
            url: '../station/components/detail/detail?id=' + shareInfo.evaluationId,
        });
    },
    /**
     * 分享
     */
    onShareAppMessage: function (options) {
        const that = this;
        const {participant, shareInfo, id, report,smallImg} = this.data;
        const time = new Date().getTime();
        return {
            title: `邀您查看${participant.filledName||participant.nickname||'好啦测评'}的《${shareInfo.evaluationName}》报告`,
            path: `pages/report/report?receivedRecordId=${id}&sharedAt=${time}`,
            imageUrl:smallImg,
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
        const {shareInfo} = this.data;
        app.doAjax({
            url: "paperQues",
            method: "get",
            data: {
                id: shareInfo.evaluationId
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

    callDetail: function(e) {
        let {detailTrigger, currentActive} = this.data;
        let {mark} = e.currentTarget.dataset;
        console.log(mark);
        if(currentActive.includes(mark)){
            console.log(currentActive);
            currentActive = currentActive.filter(item=>{
                return item !== mark
            })
        } else {
            currentActive.push(mark)
        }
        this.setData({
            detailTrigger: !detailTrigger,
            currentActive: [...currentActive]
        });
        // setTimeout(()=>{
        //     this.setData({
        //         opacityTrigger: !opacityTrigger
        //     })
        // },200)
    },

    getProgramSetting(releaseRecordId) {
        const that = this;
        if(!app.checkAccessToken()){
            return;
        }
        app.getMiniProgramSetting(releaseRecordId).then(res=>{
            that.setData({
                reportCopyrightTxt: res.reportCopyrightTxt
            })
        }).catch(err=>{
            console.error(err)
        });
    },

    onUnload: function () {
        const {isSelf} = this.data;
        if (isSelf && isSelf === "SELF") {
            wx.reLaunch({
                url: "/pages/work-base/work-base"
            })
        } else if (isSelf && isSelf === "SHARE") {
            wx.reLaunch({
                url: "/pages/user-center/components/receive-evaluations/receive-evaluations?targetPath=userCenter"
            })
        } else {

        }
    }
});
