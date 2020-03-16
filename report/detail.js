// admins/report.js
import * as echarts from '../utils/ec-canvas/echarts';
var app = getApp();
var ctx;
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
    xAxis: {
      data: indicator_2[index],
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    grid: {
      containLabel: true
    },
    yAxis: {
      min: 0,
      max: 10,
      minInterval: 0.8,
      axisLabel: {
        show: false,
        color: "#F6F7FF"
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    series: [{
      type: 'bar',
      data: value_2[index],
      label: {
        show: true,
        position: "top"
      }
    }]
  };

  chart.setOption(option);
  return chart;
}
//雷达图数据
var value_1 = {};
var indicator_1 = {};

function getChartMsg1(canvas, width, height) {
  var canvasId = canvas.canvasId;
  var index = canvasId.replace("mychartcanvas", "");
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  if (!app.rate) {
    var sysMsg = wx.getSystemInfoSync();
    app.rate = sysMsg.windowWidth / 750;
  }
  canvas.setChart(chart);
  var option = {
    radar: {
      name: {
        fontWeight: 400,
        // fontFamily: "PingFangSC-Regular",
        color: "#323541",
        fontSize: +(24 * app.rate).toFixed(0)
      },
      indicator: indicator_1[index],
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
        value: value_1[index]
      }]
    }]
  };
  chart.setOption(option);
  return chart;
}
Page({
  data: {
    getChartMsg: {
      onInit: getChartMsg
    },
    getChartMsg1: {
      onInit: getChartMsg1
    },
    activeProposal: 0,
    showDlg: false,
    showDimension: false,
    proposalShow: false,
    noTeamMember: false,
    showPage: false,
    dlgName: ""
  },
  onLoad: function(options) {
    var that = this;
    ctx = wx.createCanvasContext('canvasArcCir');
    var id = that.data.id || options.id;
    var shareKey = options.key || "";
    this.setData({
      id: id,
      shareKey: shareKey
    });
    app.checkUser = function() {
      that.getReport(id);
    };
    if (app.isLogin) {
      that.getReport(id);
    }
  },
  onShow: function() {

  },
  /**
   * 获取报告详情
   */
  getReport: function(id) {
    var that = this;
    id = id || that.data.id;
    var userInfo = app.globalData.userInfo;
    var shareKey = that.data.shareKey || "";
    app.doAjax({
      url: "getReport",
      method: "get",
      data: {
        id: id,
        shareKey: shareKey,
        userMsg: JSON.stringify({
          id: userInfo.id,
          avatar: userInfo.avatar || "",
          nickname: userInfo.nickname || "",
          realName: userInfo.realName || ""
        })
      },
      success: function(ret) {
        if (ret && ret.type == "noTeamMember") {
          if (shareKey) {
            wx.redirectTo({
              url: '../user/teamInvite?key=' + shareKey + "&reportId=" + id
            });
            return;
          }
          that.setData({
            teamAdminNickname: ret.teamAdminUserName || "",
            showPage: true,
            noTeamMember: true
          });
          return;
        }
        var now = new Date().getFullYear();
        var userMsg = ret.userMsg;
        var t = new Date(userMsg.birthday).getFullYear();
        ret.userMsg.age = now - t + 1;
        ret.finishTime = app.changeDate(ret.finishTime, "yyyy/MM/dd hh:mm");
        var timeNormal = 1; //作答时长正常
        var answeTimeSatr = +ret.answeTimeSatr;
        var answeTimeEnd = +ret.answeTimeEnd;
        var time = +ret.timeTotal;
        if (time <= answeTimeSatr) {
          //作答时长偏短
          timeNormal = 2;
        }
        if (time >= answeTimeEnd) {
          //作答时长偏长
          timeNormal = 3;
        }
        ret["timeNormal"] = timeNormal;
        value_1 = {};
        indicator_1 = {};
        value_2 = {};
        indicator_2 = {};
        var objs = ret.dimension;
        for (var n in objs) {
          var arr = objs[n].child;
          var newChild = [];
          value_1[n] = value_1[n] || [];
          indicator_1[n] = indicator_1[n] || [];
          value_2[n] = value_2[n] || [];
          indicator_2[n] = indicator_2[n] || [];
          for (var i in arr) {
            var node = arr[i];
            value_1[n].push(node.average);
            indicator_1[n].push({
              text: node.name,
              color: "#323541",
              max: node.max || 5
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
          newChild.sort(function(it1, it2) {
            return it2.average - it1.average;
          });
          objs[n].child = newChild;
          var keys = Object.keys(newChild);
          objs[n].child[keys[0]]["active"] = "active";
        }
        ret["id"] = id;
        var total1Full = ret.total1;
        ret.total1 = +ret.total1.toFixed(0);
        var proposal = ret.proposal || [];
        var dimensions = ret.dimension || {};
        ret["proposalShow"] = false;
        ret["showDimension"] = false;
        for (var i in dimensions) {
          if (dimensions[i].show) {
            ret["showDimension"] = true;
          }
        }
        proposal.forEach(function(n) {
          if (n.show) {
            ret["proposalShow"] = true;
          }
        });
        // changeS(0)
        that.drawCircle(ret.total1);
        // function changeS(num) {
        //   that.drawCircle(num);
        //   if(num==100)return;
        //   setTimeout(function() {
        //     changeS(num);
        //   }, 500);
        // }
        ret["statement"] = ret["statement"].replace(/\n/g, "<br>").replace("<bold", "<span style='font-weight: 600;'").replace("</bold", "</span");
        ret["noTeamMember"] = false;
        ret["teamRole"] = app.teamRole;
        ret["showPage"] = true;
        that.setData(ret);
        app.doAjax({
          url: "userOrderMsg",
          method: "get",
          data: {
            id: ret.id,
            paperId: ret.paper.id,
            total: total1Full || 0,
            totalD1: ret.dimension1Total || 0,
            totalD2: ret.dimension2Total || 0
          },
          success: function(r) {
            that.setData(r);
          }
        });
      }
    });
  },
  /**
   * 图片大图查看
   */
  showBigImg: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url]
    });
  },
  /**
   * 展开显示维度信息
   */
  activeItem: function(e) {
    var d = e.currentTarget.dataset;
    var index = d.index;
    if (index == null) return;
    var i = d.i;
    var list = this.data.dimension;
    if (i != null) {
      var old = list[index]["child"][i]["active"];
      list[index]["child"][i]["active"] = old ? "" : "active";
    } else {
      var old = list[index]["active"];
      list[index]["active"] = old ? "" : "active";
    }
    this.setData({
      dimension: list
    });
  },
  /**
   * 显示作答分析弹窗
   */
  showDlg: function(e) {
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
  hideDlg: function(e) {
    this.setData({
      showDlg: false,
      dlgName: ""
    });
  },
  /**
   * 建议切换显示
   */
  changeProposal: function(e) {
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
  applyReportAudit: function(e) {
    var that = this;
    wx.showModal({
      title: '确认同意',
      content: '同意后，被测者将能直接查看此份报告',
      cancelText: "取消",
      confirmText: "同意",
      cancelColor: "#323541",
      confirmColor: "#323541",
      success: function(ret) {
        if (ret.confirm) {
          app.doAjax({
            url: "applyReportAudit",
            method: "post",
            data: {
              id: that.data.id,
              status: 2
            },
            success: function(r) {
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
  drawCircle: function(num) {
    var width = 20;
    var w = 90;
    var r = 80
    var sys = wx.getSystemInfoSync();
    var n = parseInt((sys.windowWidth / 750) * 100) / 100;
    width = width * n;
    w = w * n;
    r = r * n;
    ctx.setStrokeStyle('#5960ED');
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
   * 分享内容
   */
  /*onShareAppMessage: function() {
    var userName = app.globalData.userInfo.nickname || "";
    return {
      title: userName + "邀请你查看报告",
      imageUrl: "http://ihola.luoke101.com/wxShareImg.png"
    };
  },*/
  /**
   * 进入分享报告页面
   */
  toShareReport: function() {
    var paper = this.data.paper;
    var userMsg = this.data.userMsg;
    wx.navigateTo({
      url: './shareReport?id=' + this.data.id + "&username=" + userMsg.username + "&paperName=" + paper.name
    });
  },
  /**
   * 返回首页
   */
  back: function() {
    // wx.switchTab({
    //   url: '../index/index'
    // });
    wx.switchTab({
      url: '../store/store'
    });
  },
})