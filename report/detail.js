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
console.log("value_1: ",value_1)
function getChartMsg1(canvas, width, height) {
  console.log(width,height);
  console.log("value_1: ",value_1);
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
        fontSize: +(24 * app.rate).toFixed(0),
        // formatter: function(text){
        //   var reg = /\（([^)]*)\）/;
        //   var res = text.split(reg);
        //   if( res ){
        //     text = res[0] + "\n" + res[1]
        //   }
        //   return text;
        // }
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
    wx.hideShareMenu();
    console.log(options);
    var that = this;
    ctx = wx.createCanvasContext('canvasArcCir');
    var id = that.data.id || options.id;
    var shareKey = options.key || "";
    var command = options.command || "";
    this.setData({
      id: id,
      shareKey: shareKey,
      command
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
            noTeamMember: true,
            paperId: ret.paper.id
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
          console.log("max值=" + objs[n].max);
          console.log("objs: ",objs)
          var { showSubScore } = objs[n];
          for (var i in arr) {
            var node = arr[i];
            console.log("node: ",node.total);
            if( showSubScore == 'average' ){
              value_1[n].push(node.average);
            }else if(!showSubScore){
              value_1[n].push(node.average);
            }
            else{
              value_1[n].push(node.total);
            }
            indicator_1[n].push({
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
        // console.log("teamId ="+ret.teamId+"   "+app.teamId)
        ret["teamRole"] = (app.teamId == ret.teamId) ? app.teamRole : 1;
        // console.log("teamRole=" + ret.teamRole + "   " + app.teamRole)
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
        app.doAjax({
          url: 'paperDetail',
          method: 'get',
          data: {
            id: ret.paper.id
          },
          success: function (res) {
            that.setData({
              sharePic: res.setting.smallImg
            })
          }
        })
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
   * 进入分享报告页面
   */
  toShareReport: function() {
    var paper = this.data.paper;
    var userMsg = this.data.userMsg;

    wx.navigateTo({
      url: './shareReport?id=' + this.data.id + "&username=" + userMsg.username + "&paperName=" + paper.name
    });
    wx.aldstat.sendEvent('报告详情页分享报告', {
      '触发点击': '点击数'
    });
  },
  /**测测他人 */
  toTestOtherUser: function() {
    var paperDetail = this.data.paper;
    var userPapersNum = this.data.userPapersNum;
    wx.navigateTo({
      url: '../station/detail?id=' + paperDetail.id,
    })
    wx.aldstat.sendEvent('报告详情页测测别人', {
       '测评名称': 'name' + paperDetail.name
    });
  },
  /**返回首页 */
  backToHome: function() {
    this.getMyTeamList()
    wx.switchTab({
      url: '../index/index'
    });
    this.loadUserMsg();
    return;
  },
  /**
   * 获取团队列表，并切换到我自己的团队
   */
  getMyTeamList: function(e) {
    var that = this;
    app.getMyTeamList(function(list) {
      // var teamNames = [];
      list.forEach(function(node) {
        console.log("user role="+node.role);
        if (node.role == 3) {
          app.teamId = node.objectId;
          app.teamName = node.name;
          app.teamRole = node.role;
          app.globalData.team = node;
        }
      });
    });
  },
  loadUserMsg: function() {
    var userData = app.globalData.userInfo || wx.getStorageSync("userInfo");
    var teamData = app.globalData.team || userData;
    var vip0EndTime = teamData.vip0EndTime;
    var vipEndTime = teamData.vipEndTime;
    var vip2EndTime = teamData.vip2EndTime;
    var vip3EndTime = teamData.vip3EndTime;
    var vip4EndTime = teamData.vip4EndTime;
    var now = new Date().getTime();
    var vip0 = false;
    var vip1 = false;
    var vip2 = false;
    var vip3 = false;
    var vip4 = false;
    if (vip0EndTime) {
      vip0EndTime = new Date(vip0EndTime).getTime();
      userData.vip0EndTime = app.changeDate(vip0EndTime, "yyyy.MM.dd");
    }
    if (vipEndTime) {
      vipEndTime = new Date(vipEndTime).getTime();
      userData.vipEndTime = app.changeDate(vipEndTime, "yyyy.MM.dd");
    }
    if (vip2EndTime) {
      vip2EndTime = new Date(vip2EndTime).getTime();
      userData.vip2EndTime = app.changeDate(vip2EndTime, "yyyy.MM.dd");
    }
    if (vip3EndTime) {
      vip3EndTime = new Date(vip3EndTime).getTime();
      userData.vip3EndTime = app.changeDate(vip3EndTime, "yyyy.MM.dd");
    }
    if (vip4EndTime) {
      vip4EndTime = new Date(vip4EndTime).getTime();
      userData.vip4EndTime = app.changeDate(vip4EndTime, "yyyy.MM.dd");
    }
    if (vip0EndTime && vip0EndTime > now) {
      vip0 = true;
    }
    if (vipEndTime && vipEndTime > now) {
      vip1 = true;
    }
    if (vip2EndTime && vip2EndTime > now) {
      vip2 = true;
    }
    if (vip3EndTime && vip3EndTime > now) {
      vip3 = true;
    }
    if (vip4EndTime && vip4EndTime > now) {
      vip4 = true;
    }
    if (vip1 && vip2 && vip2EndTime >= vipEndTime) {
      vip1 = false;
    } else if (vip1 && vip2 && vip2EndTime <= vipEndTime) {
      vip2 = false;
    } else if (vip1 && vip3 && vip3EndTime <= vipEndTime) {
      vip3 = false;
    } else if (vip1 && vip4 && vip4EndTime <= vipEndTime) {
      vip4 = false;
    }
    this.setData({
      vip0: vip0,
      vip1: vip1,
      vip2: vip2,
      vip3: vip3,
      vip4: vip4,
      userInfo: userData
    });
    // this.getMyTeamList();
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
  onShareAppMessage: function (options) {
    const { id,userMsg,paper,sharePic } = this.data;
    const { globalData } = app;
    return {
      title: `${ globalData.team.name }邀您看${ userMsg.username }的《${ paper.name }》报告`,
      path: `/report/detail?id=${id}`,
      imageUrl: sharePic,
    }
  },
});
