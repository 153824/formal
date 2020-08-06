import debounce from '../utils/lodash/debounce';
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
  startPageX: 0,
  scrollViewWidth: 0,
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
    dlgName: "",
    cardCur: 0,
    moveParams: {
      scrollLeft: 0
    }
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
  onReady: function() {
    let that = this;
    setTimeout(function() {
      that.scrollSelectItem(0,false);
    },2000);
  },
  /**
   * 获取报告详情
   */
  getReport: function(id) {
    let that = this;
    id = id || that.data.id;
    let { shareKey='' } = this.data;
    let { userInfo } = app.globalData;
    let getReportPromise = new Promise((resolve, reject) => {
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
            success: function (res) {
              resolve(res);
            },
            fail: function (err) {
              reject(err);
            }
          })
    });
    getReportPromise.then(res=>{
      if( res.reportVersion ){
        console.log("I Get in!");
        return new Promise((resolve, reject) => {
          resolve(res);
        });
      }
      if( this.isInTeams(res) ){
        return;
      }

      let now = new Date().getFullYear();
      let userMsg = res.userMsg;
      let t = new Date(userMsg.birthday).getFullYear();
      res.userMsg.age = now - t + 1;
      res.finishTime = app.changeDate(res.finishTime, "yyyy/MM/dd hh:mm");
      let timeNormal = 1; //作答时长正常
      let answeTimeSatr = +res.answeTimeSatr;
      let answeTimeEnd = +res.answeTimeEnd;
      let time = +res.timeTotal;
      if (time <= answeTimeSatr) {
        //作答时长偏短
        timeNormal = 2;
      }
      if (time >= answeTimeEnd) {
        //作答时长偏长
        timeNormal = 3;
      }
      res["timeNormal"] = timeNormal;
      value_1 = {};
      indicator_1 = {};
      value_2 = {};
      indicator_2 = {};
      var objs = res.dimension;
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
          console.log("arr: ",node);
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
      res["id"] = id;
      var total1Full = res.total1;
      res.total1 = +res.total1.toFixed(0);
      var proposal = res.proposal || [];
      var dimensions = res.dimension || {};
      res["proposalShow"] = false;
      res["showDimension"] = false;
      for (var i in dimensions) {
        if (dimensions[i].show) {
          res["showDimension"] = true;
        }
      }
      proposal.forEach(function(n) {
        if (n.show) {
          res["proposalShow"] = true;
        }
      });
      that.drawCircle(res.total1);
      res["statement"] = res["statement"].replace(/\n/g, "<br>").replace("<bold", "<span style='font-weight: 600;'").replace("</bold", "</span");
      res["noTeamMember"] = false;
      res["teamRole"] = (app.teamId == res.teamId) ? app.teamRole : 1;
      res["showPage"] = true;
      that.setData(res);

      app.doAjax({
        url: "userOrderMsg",
        method: "get",
        data: {
          id: res.id,
          paperId: res.paper.id,
          total: total1Full || 0,
          totalD1: res.dimension1Total || 0,
          totalD2: res.dimension2Total || 0
        },
        success: function(r) {
          that.setData(r);
        }
      });

      app.doAjax({
        url: 'evaluationDetail',
        method: 'get',
        data: {
          evaluationId: res.paper.id
        },
        success: function (res) {
          that.setData({
            sharePic: res.evaluationInfo.smallImg,

          })
        }
      });
    }).then(res=>{
      if( !res ){
        return;
      }
      if( this.isInTeams(res) ){
        return;
      }
      console.log("getReport: ",res);
      let now = new Date().getFullYear();
      let userMsg = res.userMsg;
      let t = new Date(userMsg.birthday).getFullYear();
      res.userMsg.age = now - t + 1;
      res.finishTime = app.changeDate(res.finishTime, "yyyy/MM/dd hh:mm");
      let timeNormal = 1; //作答时长正常
      let answeTimeSatr = +res.answeTimeSatr;
      let answeTimeEnd = +res.answeTimeEnd;
      let time = +res.timeTotal;
      if (time <= answeTimeSatr) {
        //作答时长偏短
        timeNormal = 2;
      }
      if (time >= answeTimeEnd) {
        //作答时长偏长
        timeNormal = 3;
      }
      res["timeNormal"] = timeNormal;
      value_1 = {};
      indicator_1 = {};
      value_2 = {};
      indicator_2 = {};
      var objs = res.dimension;
      for (var n in objs) {
        var arr = objs[n].subclass;
        var newChild = [];
        value_1[n] = value_1[n] || [];
        indicator_1[n] = indicator_1[n] || [];
        value_2[n] = value_2[n] || [];
        indicator_2[n] = indicator_2[n] || [];
        var { showSubScore } = objs[n];
        for (var i in arr) {
          var node = arr[i];
          if( showSubScore === 'average' ){
            value_1[n].push(node.average);
          }else if(!showSubScore){
            value_1[n].push(node.average);
          }
          else{
            value_1[n].push(node.subTotal);
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
        objs[n].subclass = newChild;
        var keys = Object.keys(newChild);
        console.log("keys" ,keys);
        objs[n].subclass[keys[0]]["active"] = "active"
        console.log("objs[n].subclass[keys[0]][\"active\"]",objs[n].subclass[keys[0]]["active"]);
      }
      res["id"] = id;
      var total1Full = res.generalTotal100;
      try{
        res.total100 = +res.generalTotal100.toFixed(0);
      }catch (e) {
      }
      var proposal = res.proposal || [];
      var dimensions = res.dimension || {};
      res["proposalShow"] = false;
      res["showDimension"] = false;
      for (var i in dimensions) {
        if (dimensions[i].show) {
          res["showDimension"] = true;
        }
      }
      proposal.forEach(function(n) {
        if (n.show) {
          res["proposalShow"] = true;
        }
      });
      that.drawCircle(res.total100);
      res["statement"] = res["statement"].replace(/\n/g, "<br>").replace("<bold", "<span style='font-weight: 600;'").replace("</bold", "</span");
      res["noTeamMember"] = false;
      res["teamRole"] = (app.teamId == res.teamId) ? app.teamRole : 1;
      res["showPage"] = true;
      res.fillBlank = [];
      for( let i = 0; i < 4; i++ ){
        res.fillBlank.push("");
      }
      that.setData(res);
      console.log("res: ",res);
      app.doAjax({
        url: 'evaluationDetail',
        method: 'get',
        data: {
          evaluationId: res.paper.id
        },
        success: function (response) {
          that.setData({
            sharePic: response.evaluationInfo.smallImg,
            knowledgePoints: response.evaluationInfo.knowledgePoints
          })
        }
      });
    });
  },
  isInTeams: function(teamInfo){
    let { shareKey='' } = this.data;
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
   * 展开显示维度信息(兼容新的数据结构)
   */
  activeNewItem: function(e){
    var d = e.currentTarget.dataset;
    var index = d.index;
    if (index == null) return;
    var i = d.i;
    var list = this.data.dimension;
    if (i != null) {
      var old = list[index]["subclass"][i]["active"];
      list[index]["subclass"][i]["active"] = old ? "" : "active";
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
    });
    wx.aldstat.sendEvent('报告详情页测测别人', {
       '测评名称': 'name' + paperDetail.name
    });
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
  /**
   * 返回首页
   */
  back: function() {
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

  cardSwiper: debounce(function(e){
    this.setData({
      cardCur: e.detail.current
    });
    console.log("I Scroll It");
    this.scrollSelectItem(e.detail.current,true);
  },50,{
    leading: true,
    trailing: false
  }),

  scroll: function (e) {
    this.scrollLeft = e.detail.scrollLeft;
    console.log("scroll: ", e);
  },

  switchClass: function (e) {
    const offsetLeft = e.currentTarget.offsetLeft;
    const cardCur = e.target.dataset.id;
    this.setData({
      scrollLeft: offsetLeft - this.data.scrollViewWidth/2,
      cardCur
    })
  },

  getRect: function (elementId) {
      const that = this;
      wx.createSelectorQuery().select(elementId).boundingClientRect((rect)=>{
        console.log("rect：",rect);
        let moveParams = that.data.moveParams;
        try{
          moveParams.subLeft = rect.left;
        }catch(e){
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
    console.log("moveTo")
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

  scrollSelectItem: function (id,vibrate=true) {
    console.log("scrollSelectItem");
    let ele = 'scroll-item-' + id;
    this.getRect('#' + ele);
    this.setData({
      cardCur: id
    });
    if( vibrate ){
      wx.vibrateShort({
        success: function (res) {
          console.log(res);
        }
      })
    }
  },
});
